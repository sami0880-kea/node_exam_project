import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

const router = Router();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', 
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

router.post('/api/upload', verifyToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
    }

    const imageUrl = req.file.location;
    res.status(200).send({ data: imageUrl });
});

export default router;