import express from 'express';
import { shortenUrlRequestSchema, bulkShortenRequestSchema } from "../validation/request.validation.js";
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { createShortUrl } from '../services/url.service.js';
import { urlsTable } from '../models/url.model.js';
import { db } from '../db/index.js';
import { and, eq } from 'drizzle-orm';
import { base62Encode } from '../utils/base62.js';
import { getNextId } from '../utils/counter.js';
import { getCachedUrl, setCachedUrl, invalidateCachedUrl } from '../cache/url.cache.js';
import { enqueueClickEvent } from '../queue/click.producer.js';

const router = express.Router();



router.post("/shorten", ensureAuthenticated, async (req, res) => {
    
    
    
    const validationResult = await shortenUrlRequestSchema.safeParseAsync(req.body);
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error });
    }

    const { url, code } = validationResult.data;
    const shortCode = code ?? base62Encode(await getNextId());

    try {
        const result = await createShortUrl({ shortCode, targetURL: url, userId: req.user.id });
        await setCachedUrl(shortCode, url);

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error shortening URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/shorten/bulk", ensureAuthenticated, async (req, res) => {
  const validation = bulkShortenRequestSchema.safeParse(req.body);
  if (validation.error) return res.status(400).json({ error: validation.error });

  const results = await Promise.allSettled(
    validation.data.urls.map(async ({ url, code, expiresIn }) => {
      const shortCode = code ?? base62Encode(await getNextId());
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 3600000) : null;
      return createShortUrl({ shortCode, targetURL: url, userId: req.user.id, expiresAt });
    })
  );

  return res.status(201).json({
    results: results.map((r) =>
      r.status === 'fulfilled' ? { success: true, data: r.value } : { success: false, error: r.reason.message }
    ),
  });
});

router.get('/codes', ensureAuthenticated, async (req, res) => {
    try {
     const codes = await db
      .select()
      .from(urlsTable)
      .where(eq(urlsTable.userId, req.user.id));
     return res.json({ codes });
  } catch (error) {
    console.error("Error fetching codes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
     // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return res.status(400).json({ error: "Invalid URL ID format" });
    }
    
    try {
        const [deleted] = await db
            .delete(urlsTable)
            .where(and(
                eq(urlsTable.id, id),
                eq(urlsTable.userId, req.user.id)))
            .returning({ id: urlsTable.id, shortCode: urlsTable.shortCode });
        
        if (!deleted) {
            return res.status(404).json({ error: "URL not found" });
        }

        // Evict from cache so stale redirects don't survive
        await invalidateCachedUrl(deleted.shortCode);
        
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.error("Error deleting URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;
  try {
    // 1. Check cache
    const cached = await getCachedUrl(code);
    if (cached) return res.redirect(cached);

    // 2. DB fallback — also fetch expiresAt for expiry check
    const [result] = await db
      .select({
        id: urlsTable.id,
        targetURL: urlsTable.targetURL,
        expiresAt: urlsTable.expiresAt,
      })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) return res.status(404).json({ error: "Invalid URL" });

    if (result.expiresAt && result.expiresAt < new Date()) {
      await invalidateCachedUrl(code);
      return res.status(410).json({ error: "This link has expired" });
    }

    // 3. Cache on miss
    await setCachedUrl(code, result.targetURL);

    enqueueClickEvent({
      urlId: result.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
    }).catch(() => {}); // fire-and-forget

    return res.redirect(result.targetURL);
  } catch (error) {
    console.error("Error resolving short URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;