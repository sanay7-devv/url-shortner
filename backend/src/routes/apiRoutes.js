const express = require("express");
const { createShortUrl, getStats, listRecentUrls } = require("../controllers/urlController");

const router = express.Router();

// POST /api/shorten -> create a new short URL
router.post("/shorten", createShortUrl);

// GET /api/stats/:shortCode -> click analytics for one link
router.get("/stats/:shortCode", getStats);

// GET /api/urls -> most recently created links
router.get("/urls", listRecentUrls);

module.exports = router;
