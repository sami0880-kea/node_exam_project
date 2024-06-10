import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { messagesSocket } from './util/socketsUtil.js';

import authRouter from './routers/authRouter.js';
import usersRouter from './routers/usersRouter.js';
import listingsRouter from './routers/listingsRouter.js';
import mailRouter from './routers/mailRouter.js';
import conversationsRouter from './routers/conversationsRouter.js';
import messagesRouter from './routers/messagesRouter.js';
import carsRouter from './routers/carsRouter.js';
import uploadRouter from './routers/uploadRouter.js';
import limiter from './util/rateLimiterUtil.js';

const app = express();
const server = http.createServer(app);

messagesSocket(server);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/uploads', express.static('uploads'));

app.use(limiter);

import helmet from "helmet";
app.use(helmet());


app.use(authRouter);
app.use(usersRouter);
app.use(listingsRouter);
app.use(carsRouter);
app.use(uploadRouter);
app.use(conversationsRouter);
app.use(mailRouter);
app.use(messagesRouter);

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));