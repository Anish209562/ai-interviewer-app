import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/env.js';

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded; // Contains id
        next();
    } catch (error) {
        if (error.message === 'JWT_SECRET is missing') {
            return res.status(500).json({ error: 'Server misconfiguration' });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
