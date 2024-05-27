import jwt from 'jsonwebtoken';
import db from "../database/connection.js";
import { ObjectId } from 'mongodb';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies['jwt'];
            if (!token) {
            return res.status(401).send({ data: "Not logged in!" });
        }

        const claims = jwt.verify(token, process.env.JWT_SECRET);
        if (!claims) {
            return res.status(401).send({ data: "Not logged in!" });
        }

        const user = await db.users.findOne({ _id: new ObjectId(claims.id) });
        if (!user) {
            return res.status(404).send({ data: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ data: error });
    }
};
