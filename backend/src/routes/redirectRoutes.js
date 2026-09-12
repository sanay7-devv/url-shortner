const express = require("express");
const { redirectToUrl } = require("../controllers/urlController");

const router = express.Router();

// GET /:shortCode -> 302 redirect to the original URL
router.get("/:shortCode", redirectToUrl);

module.exports = router;
