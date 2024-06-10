import { rateLimit } from 'express-rate-limit'

const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 3,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
});

export default authRateLimiter;