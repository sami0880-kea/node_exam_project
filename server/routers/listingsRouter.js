import 'dotenv/config';
import { Router } from 'express';
import db from "../database/connection.js";
import { ObjectId } from 'mongodb';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const router = Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

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
            price: Number(price),
            brand,
            model,
            year: Number(year),
            fuel,
            version,
            automaticGear,
            images,
            color,
            mileage: Number(mileage),
            power: Number(power),
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
    const {
        search = '',
        sort = '',
        page = 1,
        limit = 20
    } = req.query;
    
    const filters = {};
    if (search) {
        filters.$or = [
            { brand: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    let sortOption = {};
    switch (sort) {
        case 'price_asc':
            sortOption.price = 1;
            break;
        case 'price_desc':
            sortOption.price = -1;
            break;
        case 'date_asc':
            sortOption._id = 1;
            break;
        case 'date_desc':
            sortOption._id = -1;
            break;
        default:
            break;
    }
    
    try {
        const listings = await db.listings
            .find(filters)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
    
        const total = await db.listings.countDocuments(filters);
    
        res.status(200).send({
            data: listings,
            total,
            page: page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching listings",
            error: error.message
        });
    }
});    

router.get('/api/listings/user/:userId', async (req, res) => {
    const { userId } = req.params;
        
    try {
        const listings = await db.listings
            .find({ userId: new ObjectId(userId) })
            .toArray();
    
        res.status(200).send({
            data: listings,
            total: listings.length,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching listings for the user",
            error: error.message
        });
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
        await Promise.all(imagesToDelete.map(async imageUrl => {
            const key = imageUrl.split('/').pop();
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/${key}`
            };
            const command = new DeleteObjectCommand(deleteParams);
            await s3Client.send(command);
        }));

        const uploadedImages = await Promise.all(images.map(async image => {
            if (typeof image === 'string') {
                return image;
            }
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/${Date.now()}-${image.originalname}`,
                Body: Readable.from(image.buffer),
                ContentType: image.mimetype
            };
            const command = new PutObjectCommand(uploadParams);
            const response = await s3Client.send(command);
            return response.Location;
        }));

        const updatedListing = {
            price: Number(price),
            brand,
            model,
            year: Number(year),
            fuel,
            version,
            automaticGear,
            images: uploadedImages,
            color,
            mileage: Number(mileage),
            power: Number(power),
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

        await Promise.all(listing.images.map(async imageUrl => {
            const key = imageUrl.split('/').pop();
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/${key}`
            };
            const command = new DeleteObjectCommand(deleteParams);
            await s3Client.send(command);
        }));

        await db.listings.deleteOne({ _id: new ObjectId(id) });

        res.status(200).send({ message: "Listing deleted" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting listing" });
    }
});

export default router;