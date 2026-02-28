import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../models/index.js";
import { createUserToken } from "../utils/token.js"
import { signupPostRequestSchema, loginPostRequestSchema } from "../validation/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail } from "../services/user.service.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult = signupPostRequestSchema.safeParse(req.body);

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: `User with email ${email} already exists!` });
    }

    const { password: hashedPassword, salt } = hashPasswordWithSalt(password);

    const [user] = await db
      .insert(usersTable)
      .values({ firstname, lastname, email, salt, password: hashedPassword })
      .returning({ id: usersTable.id });

    return res.status(201).json({ data: { userId: user.id } });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const validationResult = loginPostRequestSchema.safeParse(req.body);

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { email, password } = validationResult.data;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: `User with email ${email} does not exist` });
    }

    const { password: hashedPassword } = hashPasswordWithSalt(password, user.salt);

    if (hashedPassword !== user.password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = await createUserToken({ id: user.id });

    return res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
