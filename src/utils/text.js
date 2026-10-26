/** Helpers for turning stored post data into display text. */

export const toDate = (ts) => {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

export const formatDate = (ts, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = toDate(ts);
  return d ? d.toLocaleDateString("en-GB", opts) : "";
};

export const formatDateTime = (ts) => {
  const d = toDate(ts);
  return d
    ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
};

export const timeAgo = (ts) => {
  const d = toDate(ts);
  if (!d) return "";
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  const units = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    if (s >= secs) {
      const n = Math.floor(s / secs);
      return `${n} ${label}${n > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

export const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

export const makeExcerpt = (post, max = 150) => {
  const text = post.excerpt?.trim() || stripHtml(post.content);
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

export const readingTime = (html) => {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

/** The date a post is shown/sorted by: when it went (or will go) live. */
export const postDate = (post) => post?.publishAt || post?.createdAt || null;

/**
 * Is this post visible to the public right now?
 * - no status (older posts) or "published" → yes
 * - "scheduled" → yes once its publish time has passed
 * - "draft" → never
 */
export const isLive = (post, now = new Date()) => {
  const status = post.status || "published";
  if (status === "published") return true;
  if (status === "scheduled") {
    const when = toDate(post.publishAt);
    return !!when && when <= now;
  }
  return false;
};

/** Date → value for <input type="datetime-local"> in the user's own time zone. */
export const toLocalInput = (value) => {
  const d = toDate(value);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "  React Tips! " → "react-tips" */
export const normalizeTag = (tag) =>
  String(tag || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
