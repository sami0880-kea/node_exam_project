import { Router } from 'express';
import { ObjectId } from 'mongodb';
import db from '../database/connection.js';

const router = Router();

router.get('/api/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await db.messages.find({ conversationId: new ObjectId(conversationId) }).toArray();

        const populatedMessages = await Promise.all(messages.map(async (msg) => {
            const user = await db.users.findOne({ _id: new ObjectId(msg.sender) });
            return { ...msg, senderName: user.name };
        }));

        res.status(200).send({ data: populatedMessages });
    } catch (error) {
        res.status(500).send({ message: error });
    }
});

export default router;