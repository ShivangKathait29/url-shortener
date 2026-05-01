import {validateUserToken} from '../utils/token.js';

export function authenticateMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res
        .status(400)
        .json({ error: 'Invalid authorization header format' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }
    
    const payload = validateUserToken(token);
    
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();

}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */

export function ensureAuthenticated(req, res, next) {
    if (!req.user) {
        return res
          .status(401)
          .json({ error: "You must be logged in to access this resource" });
    }
    next();
}