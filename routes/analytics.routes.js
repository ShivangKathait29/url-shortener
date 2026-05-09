import express from 'express';
import { db } from '../db/index.js';
import { urlsTable } from '../models/url.model.js';
import { clickEventsTable } from '../models/click-event.model.js';
import { eq, and, desc } from 'drizzle-orm';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:code', ensureAuthenticated, async (req, res) => {
  const { code } = req.params;
  const [url] = await db.select().from(urlsTable)
    .where(and(eq(urlsTable.shortCode, code), eq(urlsTable.userId, req.user.id)));

  if (!url) return res.status(404).json({ error: 'URL not found' });

  const events = await db.select().from(clickEventsTable)
    .where(eq(clickEventsTable.urlId, url.id))
    .orderBy(desc(clickEventsTable.createdAt))
    .limit(50);

  return res.json({ clickCount: url.clickCount, recentClicks: events });
});

export default router;
