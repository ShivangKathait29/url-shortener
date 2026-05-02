import redis from '../cache/index.js';
import { db } from '../db/index.js';
import { urlsTable } from '../models/url.model.js';
import { base62Decode } from './base62.js';

const COUNTER_KEY = 'url:counter';

export async function initCounter() {
  const exists = await redis.exists(COUNTER_KEY);
  if (!exists) {
    const urls = await db.select({ shortCode: urlsTable.shortCode }).from(urlsTable);
    let maxId = 100000; // Start at 100,000 to get at least 3 chars
    for (const u of urls) {
       // Ignore likely custom aliases
       if (u.shortCode.length > 8) continue; 
       const id = base62Decode(u.shortCode);
       if (Number.isSafeInteger(id) && id > maxId) {
         maxId = id;
       }
    }
    await redis.set(COUNTER_KEY, maxId);
    console.log(`[Cache] Redis counter seeded with: ${maxId}`);
  }
}

export async function getNextId() {
  return redis.incr(COUNTER_KEY);
}
