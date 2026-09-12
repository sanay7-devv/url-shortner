const mongoose = require("mongoose");

/**
 * One document per shortened link.
 * `shortCode` is the 6-character public-facing alias (unique, indexed).
 * `clicks` and `lastAccessedAt` power the analytics feature.
 */
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("Url", urlSchema);
