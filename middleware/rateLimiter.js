const store = new Map(); // key -> { count, resetAt }
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_RPM || '30');

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

function rateLimiter(req, res, next) {
  // Key by authenticated user id when available; fall back to IP for unauthenticated requests.
  const key = req.user?.id || req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  entry.count++;
  next();
}

module.exports = rateLimiter;
