const { nanoid } = require("nanoid");
const Url = require("../models/Url");
const { isValidHttpUrl } = require("../utils/validateUrl");

const SHORT_CODE_LENGTH = 6;
const MAX_GENERATION_ATTEMPTS = 5;

/**
 * Generates a short code that isn't already in the database.
 * Collisions are astronomically rare at 6 chars (~56 billion combinations)
 * but we still guard against them instead of trusting luck.
 */
async function generateUniqueShortCode() {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = nanoid(SHORT_CODE_LENGTH);
    // eslint-disable-next-line no-await-in-loop
    const existing = await Url.findOne({ shortCode: candidate }).lean();
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique short code, please retry.");
}

/**
 * POST /api/shorten
 * Body: { originalUrl: string, customCode?: string }
 */
async function createShortUrl(req, res) {
  try {
    const { originalUrl, customCode } = req.body;

    if (!isValidHttpUrl(originalUrl)) {
      return res.status(400).json({
        error: "Please provide a valid http:// or https:// URL.",
      });
    }

    // If this exact URL was already shortened, return the existing code
    // instead of creating a duplicate row.
    const existingForUrl = await Url.findOne({ originalUrl: originalUrl.trim() });
    if (existingForUrl && !customCode) {
      return res.status(200).json({
        shortCode: existingForUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${existingForUrl.shortCode}`,
        originalUrl: existingForUrl.originalUrl,
        clicks: existingForUrl.clicks,
        reused: true,
      });
    }

    let shortCode;
    if (customCode) {
      const cleanCode = String(customCode).trim();
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(cleanCode)) {
        return res.status(400).json({
          error:
            "Custom codes must be 3-20 characters: letters, numbers, hyphens, or underscores only.",
        });
      }
      const taken = await Url.findOne({ shortCode: cleanCode }).lean();
      if (taken) {
        return res.status(409).json({ error: "That custom code is already taken." });
      }
      shortCode = cleanCode;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    const doc = await Url.create({
      originalUrl: originalUrl.trim(),
      shortCode,
    });

    return res.status(201).json({
      shortCode: doc.shortCode,
      shortUrl: `${process.env.BASE_URL}/${doc.shortCode}`,
      originalUrl: doc.originalUrl,
      clicks: doc.clicks,
      reused: false,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Unique index race condition (two requests generated the same code
      // at the same instant) - rare, but handled rather than crashing.
      return res.status(409).json({ error: "Short code collision, please try again." });
    }
    console.error("[createShortUrl]", err);
    return res.status(500).json({ error: "Server error while creating short URL." });
  }
}

/**
 * GET /:shortCode
 * Looks up the original URL and redirects the browser to it.
 * Increments the click counter as a side effect (fire-and-forget on read speed).
 */
async function redirectToUrl(req, res) {
  try {
    const { shortCode } = req.params;

    const doc = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 }, $set: { lastAccessedAt: new Date() } },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ error: "Short link not found." });
    }

    return res.redirect(302, doc.originalUrl);
  } catch (err) {
    console.error("[redirectToUrl]", err);
    return res.status(500).json({ error: "Server error while redirecting." });
  }
}

/**
 * GET /api/stats/:shortCode
 * Returns click-count analytics for a single short link without redirecting.
 */
async function getStats(req, res) {
  try {
    const { shortCode } = req.params;
    const doc = await Url.findOne({ shortCode }).lean();

    if (!doc) {
      return res.status(404).json({ error: "Short link not found." });
    }

    return res.status(200).json({
      shortCode: doc.shortCode,
      originalUrl: doc.originalUrl,
      clicks: doc.clicks,
      createdAt: doc.createdAt,
      lastAccessedAt: doc.lastAccessedAt,
    });
  } catch (err) {
    console.error("[getStats]", err);
    return res.status(500).json({ error: "Server error while fetching stats." });
  }
}

/**
 * GET /api/urls
 * Returns the most recently created links (used for a simple "recent links" list).
 */
async function listRecentUrls(req, res) {
  try {
    const docs = await Url.find().sort({ createdAt: -1 }).limit(20).lean();
    return res.status(200).json(
      docs.map((doc) => ({
        shortCode: doc.shortCode,
        shortUrl: `${process.env.BASE_URL}/${doc.shortCode}`,
        originalUrl: doc.originalUrl,
        clicks: doc.clicks,
        createdAt: doc.createdAt,
      }))
    );
  } catch (err) {
    console.error("[listRecentUrls]", err);
    return res.status(500).json({ error: "Server error while listing URLs." });
  }
}

module.exports = {
  createShortUrl,
  redirectToUrl,
  getStats,
  listRecentUrls,
};
