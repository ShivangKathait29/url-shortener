import jwt from 'jsonwebtoken';
import { userTokenSchema } from '../validation/token.validation.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload) {

    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const validationResult = userTokenSchema.safeParse(payload);
    if (!validationResult.success) throw new Error('Invalid token payload');
    return jwt.sign(validationResult.data, JWT_SECRET, { expiresIn: '1h' });
}
    export function validateUserToken(token) {
        try {
      if (!JWT_SECRET) return null;
      const payload = jwt.verify(token, JWT_SECRET);
      const validationResult = userTokenSchema.safeParse(payload);
      if (!validationResult.success) return null;
      return validationResult.data;
    } catch (error) {
      return null;
    }
}





