/**
 * Returns true only for well-formed http(s) URLs.
 * Rejects things like "javascript:...", plain text, or malformed strings
 * before they ever reach the database.
 */
function isValidHttpUrl(candidate) {
  if (typeof candidate !== "string" || candidate.trim().length === 0) {
    return false;
  }

  try {
    const parsed = new URL(candidate.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = { isValidHttpUrl };
