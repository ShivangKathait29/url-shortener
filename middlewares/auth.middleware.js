import {validateUserToken} from '../utils/token.js';
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export function authenticateMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next();
    }

    if (!authHeader.startsWith('Bearer')) {
        return res
        .status(400)
        .json({ error: 'Invalid authorization header format' });
    }

    const [_token] = authHeader.split(' ');
    
    const payload = validateUserToken(token);

    req.user = payload;
    next();

    

    



}