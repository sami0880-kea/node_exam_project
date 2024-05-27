import { Router } from 'express';
import db from "../database/connection.js";
import { ObjectId } from 'mongodb';
import { verifyToken } from '../middlewares/authMiddleware.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/api/listings', verifyToken, async (req, res) => {
    const {
        price,
        brand,
        model,
        year,
        fuel,
        version,
        automaticGear,
        images,
        color,
        mileage,
        power,
        equipment,
        exclusiveVAT,
        description
    } = req.body;
    const userId = req.user._id;

    try {
        const newListing = {
            price,
            brand,
            model,
            year,
            fuel,
            version,
            automaticGear,
            images,
            color,
            mileage,
            power,
            equipment,
            exclusiveVAT,
            description,
            userId: new ObjectId(userId)
        }; 
        await db.listings.insertOne(newListing);
        res.status(201).send({ data: "Listing created" });
    } catch (error) {
        res.status(500).send({ data: error });
    }
});
 
router.get('/api/listings', async (req, res) => {
    try {
        const listings = await db.listings.find().toArray();
        const modifiedListings = listings.map(listing => ({
            ...listing,
            images: (listing.images).length > 0 ? [listing.images[0]] : null
        }));
        res.status(200).send({ data: modifiedListings });
    } catch (error) {
        res.status(500).send({ data: error });
    }
});

router.get('/api/listings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (listing) {
            const user = await db.users.findOne({ _id: new ObjectId(listing.userId) });
            const sellerName = user ? user.name : 'Unknown Seller';
            res.status(200).send({ data: {...listing, sellerName} });
        } else {
            res.status(404).send({ message: "Listing not found" });
        }
    } catch (error) {
        res.status(500).send({ data: error });
    }
});

router.put('/api/listings/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const {
        price,
        brand,
        model,
        year,
        fuel,
        version,
        automaticGear,
        images,
        color,
        mileage,
        power,
        equipment,
        exclusiveVAT,
        description
    } = req.body;

    try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
            return res.status(404).send({ message: "Listing not found" });
        }

        const imagesToDelete = listing.images.filter(image => !images.includes(image));
        imagesToDelete.forEach((imageUrl) => {
            const imagePath = path.join('uploads', path.basename(imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        const updatedListing = {
            price,
            brand,
            model,
            year,
            fuel,
            version,
            automaticGear,
            images,
            color,
            mileage,
            power,
            equipment,
            exclusiveVAT,
            description,
        };

        await db.listings.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedListing }
        );

        res.status(200).send({ message: "Listing updated" });
    } catch (error) {
        res.status(500).send({ message: "Error updating listing" });
    }
});

router.delete('/api/listings/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        if (listing.userId.toString() !== userId.toString()) {
            return res.status(403).send('You are not authorized to delete this listing');
        }

        if (listing.images && listing.images.length > 0) {
            listing.images.forEach((imageUrl) => {
                const imagePath = path.join('uploads', path.basename(imageUrl));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        await db.listings.deleteOne({ _id: new ObjectId(id) });

        res.status(200).send({ message: "Listing deleted" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting listing" });
    }
});

export default router;