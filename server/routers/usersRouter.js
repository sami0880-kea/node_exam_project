import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/api/user', verifyToken, async (req, res) => {
    const { password, ...data } = req.user;
    res.send({ data: data });
});

export default router;