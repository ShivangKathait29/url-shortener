import express from 'express';
import { shortenUrlRequestSchema } from "../validation/request.validation.js";
import { nanoid } from 'nanoid';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { createShortUrl } from '../services/url.service.js';
import { urlsTable } from '../models/url.model.js';
import { db } from '../db/index.js';
import { and, eq } from 'drizzle-orm';

const router = express.Router();



router.post("/shorten", ensureAuthenticated, async (req, res) => {
    
    
    
    const validationResult = await shortenUrlRequestSchema.safeParseAsync(req.body);
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error });
    }

    const { url, code } = validationResult.data;
    const shortCode = code ?? nanoid(8);

    try {
        const result = await createShortUrl({ shortCode, targetURL: url, userId: req.user.id });

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error shortening URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/codes', ensureAuthenticated, async (req, res) => {
    const codes = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, req.user.id));
    return res.json({ codes });
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
    const result =await db
    .delete(urlsTable)
    .where(and(
        eq(urlsTable.id, id),
        eq(urlsTable.userId, req.user.id)));

    return res.status(200).json({ deleted: true });
});

router.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;
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
});

export default router;