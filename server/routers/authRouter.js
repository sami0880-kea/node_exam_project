import { Router } from 'express';
import db from "../database/connection.js";
import { hash, compare } from '../util/passwordUtil.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import authRateLimiter from '../util/authRaterLimiterUtil.js';
const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/api/login', authRateLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.users.findOne({ email });
        if (user) {
            const match = await compare(password, user.password);
            if (match) {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 24 * (60 * 60 * 1000)
                });
                res.status(200).send({ message: "Logged in successfully" });
            } else {
                res.status(404).send({ message: "Invalid login details" });
            }
        } else {
            res.status(404).send({ message: "Invalid login details" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal login error" });
    }
});

router.post('/api/signup', authRateLimiter, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await db.users.findOne({ email });
        if (existingUser) return res.status(409).send({ message: "Email already exists" });

        const hashedPassword = await hash(password);
        await db.users.insertOne({ name, email, password: hashedPassword });
        res.status(201).send({ message: "User registered" });
    } catch (error) {
        res.status(500).send({ message: "Error registering user" });
    }
});

router.post('/api/forgot-password', authRateLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required" });

    try {
        const user = await db.users.findOne({ email });
        if (!user) return res.status(200).send({ message: "Password reset email sent if email is registered" });

        const token = crypto.randomBytes(24).toString('hex');
        const expiration = Date.now() + 6 * 60 * 60 * 1000;

        await db.tokens.insertOne({ email, token, expiration });

        const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
        const { data, error } = await resend.emails.send({
            from: 'LeasePortalen <noreply@samim.one>',
            to: [email],
            subject: 'Nustil adgangskode',
            text: `Du har anmodet om en nulstilling af adgangskoden. \nKlik venligst på følgende link for at nulstille din adgangskode: ${resetUrl} \n\nDenne mail kan ikke besvares!`
        });

        if (error) {
            return res.status(500).send({ data: "Could not send mail" });
        }

        res.status(200).send({ message: "Password reset email sent if email is registered" });
    } catch (error) {
        res.status(500).send({ message: "Error sending email" });
    }
});

router.post('/api/reset-password', authRateLimiter, async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).send({ message: "Token and password are required" });

    try {
        const record = await db.tokens.findOne({ token });
        if (!record) return res.status(400).send({ message: "Invalid or expired token" });
        if (record.expiration < Date.now()) return res.status(400).send({ message: "Token expired" });

        const hashedPassword = await hash(password);
        await db.users.updateOne({ email: record.email }, { $set: { password: hashedPassword } });

        await db.tokens.deleteOne({ token });

        res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error resetting password" });
    }
});

router.post('/api/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).send({ message: "Logged out successfully" });
});

export default router;