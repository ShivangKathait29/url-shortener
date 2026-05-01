import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";

export async function createShortUrl({ shortCode, targetURL, userId }) {
    try{
  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetURL,
      userId,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    });

  return result;
}catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      const err = new Error('Short code already exists');
      err.code = 'DUPLICATE_CODE';
      throw err;
    }
    throw error;
  }
}
