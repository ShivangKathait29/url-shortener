import express from 'express';
import { usersTable} from '../models/index.js';
import { db } from '../db/index.js';
import { eq } from 'drizzle-orm';
import {randomBytes, createHmac} from 'crypto';
const router = express.Router();

router.post('/signup', async(req, res) => {
    const {firstname, lastname, email, password } = req.body;

    if (
        typeof firstname !== 'string' ||
        typeof lastname !== 'string'  ||
        typeof email !== 'string'     ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({ message: 'Invalid input types.' });
    }
    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    if (!trimmedFirstname || !trimmedLastname || !trimmedEmail || !trimmedPassword) {
        return res.status(400).json({ message: 'Missing required fields: firstname, lastname, email, and password are all required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (trimmedPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    try {
        const [existingUser] = await db
        .select({
            id : usersTable.id,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));
        if(existingUser) 
            return res
        .status(400)
        .json({ message: `User with email ${email} already exists!` });
        
        const salt = randomBytes(256).toString('hex');
        const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');
        const user = await db.insert(usersTable)
        .values({
            firstname,
            lastname,
            email,
            password: `${salt}:${hashedPassword}`,
        })
        .returning({id: usersTable.id});
        if (!user) return res.status(500).json({ message: 'User creation failed' });
        return res.status(201).json({ data: { userId: user[0].id }});
    } catch (error) {
        console.error('Error during user signup:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;