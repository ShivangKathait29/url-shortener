import { Worker } from 'bullmq';
import 'dotenv/config';
import { db } from '../db/index.js';
import { clickEventsTable } from '../models/click-event.model.js';
import { urlsTable } from '../models/url.model.js';
import { eq, sql } from 'drizzle-orm';
import geoip from 'geoip-lite';

const connection = { url: process.env.REDIS_URL };

const worker = new Worker('click-tracking', async (job) => {
  const { urlId, ip, userAgent, referer } = job.data;
  const geo = geoip.lookup(ip) || {};

  // Simple user-agent parsing
  const browser = userAgent?.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[1] || 'Unknown';
  const os = userAgent?.match(/(Windows|Mac|Linux|Android|iOS)/i)?.[1] || 'Unknown';
  const device = /Mobile|Android/i.test(userAgent) ? 'Mobile' : 'Desktop';

  await db.insert(clickEventsTable).values({
    urlId, ipAddress: ip, userAgent, referer,
    country: geo.country || null,
    city: geo.city || null,
    device, browser, os,
  });

  await db.update(urlsTable)
    .set({ clickCount: sql`${urlsTable.clickCount} + 1` })
    .where(eq(urlsTable.id, urlId));
}, { connection, concurrency: 10 });

worker.on('completed', (job) => console.log(`Click ${job.id} processed`));
worker.on('failed', (job, err) => console.error(`Click ${job.id} failed:`, err.message));
console.log('Click worker started');
