import express from 'express';
import { shortenUrlRequestSchema } from "../validation/request.validation.js";
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { createShortUrl } from '../services/url.service.js';
import { urlsTable } from '../models/url.model.js';
import { db } from '../db/index.js';
import { and, eq } from 'drizzle-orm';
import { base62Encode } from '../utils/base62.js';
import { getNextId } from '../utils/counter.js';

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

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error shortening URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
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
        const result = await db
            .delete(urlsTable)
            .where(and(
                eq(urlsTable.id, id),
                eq(urlsTable.userId, req.user.id)))
            .returning({ id: urlsTable.id });
        
        if (result.length === 0) {
            return res.status(404).json({ error: "URL not found" });
        }
        
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.error("Error deleting URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;
  try{
  const [result] = await db
    .select({
      targetURL: urlsTable.targetURL,
    })
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, code));

  if (!result) {
    return res.status(404).json({ error: "Invalid URL" });
  }
  return res.redirect(result.targetURL);
}catch (error) {
    console.error("Error resolving short URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;