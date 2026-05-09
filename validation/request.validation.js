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
    url: z.string().url(),
    code : z.string().optional(),
});

export const bulkShortenRequestSchema = z.object({
  urls: z.array(z.object({
    url: z.string().url(),
    code: z.string().optional(),
    expiresIn: z.number().optional(),
  })),
});