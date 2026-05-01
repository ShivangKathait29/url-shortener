import { z } from 'zod';

export const signupPostRequestSchema = z.object({
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const loginPostRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
}); 

export const shortenUrlRequestSchema = z.object({
    url: z.string().url().refine(
      (url) => {
        const u = new URL(url);
        return ['http:', 'https:'].includes(u.protocol);
      },
      { message: 'Only http/https URLs are allowed' }
    ),
    code: z.string()
      .regex(/^[a-zA-Z0-9_-]+$/, 'Alias must be alphanumeric (plus _ and -)')
      .min(3, 'Alias must be at least 3 characters')
      .max(20, 'Alias must be at most 20 characters')
      .optional(),
    expiresIn: z.number().int().positive().optional(),
});

export const bulkShortenRequestSchema = z.object({
    urls: z.array(shortenUrlRequestSchema).min(1).max(50),
});