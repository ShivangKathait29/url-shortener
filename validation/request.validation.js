import { z } from 'zod';

export const signupPostRequestSchema = z.object({
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})