import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';
import db from '../database/connection.js';

export const messagesSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['*']
        }
    });

    io.on('connection', (socket) => {
        socket.on('join', (roomId) => {
            socket.join(roomId);
        });

        socket.on('client-sends-message', async (data) => {
            const { conversationId, sender, text } = data;
            const newMessage = {
                conversationId: new ObjectId(conversationId),
                sender: new ObjectId(sender),
                text,
                createdAt: new Date(),
            };
            try {
                const result = await db.messages.insertOne(newMessage);
                const user = await db.users.findOne({ _id: new ObjectId(sender) });
                const messageWithSenderName = { ...newMessage, _id: result.insertedId, senderName: user.name };
                io.to(conversationId).emit('server-sends-message', messageWithSenderName);
            } catch (error) {
                io.emit("Kunne ikke sende besked!");
            }
        });
    });

    return io;
};
