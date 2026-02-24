import express from 'express';
import { usersTable} from '../models/index.js';
import { db } from '../db/index.js';
import {randomBytes, createHmac} from crypto;
const router = express.Router();

router.post('/signup', async(req, res) => {
    const {firstname, lastname, email, password } = req.body;

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
        password,
    })
    .returning({id: usersTable.id})
    return res.status(201).json({ data: {userId: user.id}});
});


export default router;