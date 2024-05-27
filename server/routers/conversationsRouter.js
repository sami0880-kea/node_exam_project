import { Router } from 'express';
import { ObjectId } from 'mongodb';
import db from '../database/connection.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/api/conversations/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await db.conversations.findOne({ _id: new ObjectId(conversationId) });
    if (!conversation) {
      return res.status(404).send({ message: "Conversation not found" });
    }

    const members = await conversation.members.map(memberId =>
      db.users.findOne({ _id: memberId })
    );

    conversation.members = conversation.members.map((memberId, index) => ({
      id: memberId,
      name: members[index].name
    }));

    res.status(200).send({ data: conversation });
  } catch (error) {
    res.status(500).send({ data: error });
  }
});

router.get('/api/conversations/user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await db.conversations.find({ members: { $in: [new ObjectId(userId)] } }).toArray();

    const latestMessages = await Promise.all(conversations.map(async (convo) => {
      const [latestMessage] = await db.messages.find({ conversationId: convo._id }).sort({ createdAt: -1 }).toArray();
      return latestMessage || null;
    }));

    const listingIds = conversations.map(convo => convo.listingId);
    const listings = await db.listings.find({ _id: { $in: listingIds } }).toArray();

    const listingMap = {};
    listings.forEach(listing => {
      listingMap[listing._id] = {
        name: `${listing.brand} ${listing.model}`,
        image: listing.images && listing.images.length > 0 ? listing.images[0] : null
      };
    });

    const conversationsWithMessages = conversations.map((convo, index) => ({
      ...convo,
      latestMessage: latestMessages[index],
      listingName: listingMap[convo.listingId]?.name,
      listingImage: listingMap[convo.listingId]?.image,
    }));

    res.status(200).send({ data: conversationsWithMessages });
  } catch (error) {
    res.status(500).send({ data: error });
  }
});

router.get('/api/conversations/find/:firstUserId/:secondUserId/:listingId', async (req, res) => {
  const { firstUserId, secondUserId, listingId } = req.params;
  try {
    let conversation = await db.conversations.findOne({
      members: { $all: [new ObjectId(firstUserId), new ObjectId(secondUserId)] },
      listingId: new ObjectId(listingId)
    });

    if (!conversation) {
      const newConversation = {
        members: [new ObjectId(firstUserId), new ObjectId(secondUserId)],
        listingId: new ObjectId(listingId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.conversations.insertOne(newConversation);
      conversation = { _id: result.insertedId, ...newConversation };
    }

    res.status(200).send({ data: conversation });
  } catch (error) {
    res.status(500).send({ data: error });
  }
});


export default router;
