import { Router } from 'express';
import { Resend } from 'resend';
const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);


router.post('/send-email', async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).send({ data: "Please provide email, subject, and message." });
    }

    try {
        await resend.emails.send({
            from: 'Sam <contactform@samim.one>',
            to: [email],
            subject: subject,
            text: message,
        });

        res.status(200).send({ data: "Email sent successfully" });
    } catch (error) {
        res.status(500).send({ data: "Error sending email" });
    }
});
export default router;