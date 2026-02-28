import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../models/index.js";

export async function getUserByEmail(email) {
  const [existingUser] = await db
        .select({
          id: usersTable.id,
            email: usersTable.email,
            lastname: usersTable.lastname,
            firstname: usersTable.firstname,
            password: usersTable.password,
            salt: usersTable.salt,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));
      
          return existingUser;
}