import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);


router.post('/api/send-email', async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).send({ data: "Please provide email, subject, and message." });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'LeasePortalen <contactform@samim.one>',
            to: [email],
            subject: `LeasePortalen - Henvendelse (${subject})`,
            text: `Vi har modtaget din besked! Du vil høre fra os hurtigst muligt! \nEmne: ${subject} \nBesked: ${message}`,
        });

        const { data2, error2 } = await resend.emails.send({
            from: 'LeasePortalen <contactform@samim.one>',
            to: ['leaseportalen@proton.me'],
            subject: `Ny henvendelse! - ${subject} (${email})`,
            text: `Fra: ${email} \nEmne: ${subject} \nBesked: ${message}`,
        });
        
        
        if (error || error2) {
            return res.send({ data: "Could not send mail" });
        }

        res.status(200).send({ data: "Email sent successfully" });
    } catch (error) {
        res.status(500).send({ data: "Error sending email" });
    }
});
export default router;