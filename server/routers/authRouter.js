import { Router } from 'express';
import db from "../database/connection.js";
import { hash, compare } from '../util/passwordUtil.js';
import jwt from 'jsonwebtoken';
import authRateLimiter from '../util/authRaterLimiterUtil.js';
const router = Router();

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

router.post('/api/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).send({ message: "Logged out successfully" });
});

export default router;