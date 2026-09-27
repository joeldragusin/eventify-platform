import rateLimit from "express-rate-limit";

// Slows down brute-force attempts against auth endpoints: each IP gets a
// limited number of tries in a time window, then must wait.
// This does not replace real bot/abuse protection (e.g. behind a proxy that
// does not forward the real client IP, this limits per-proxy, not per-user),
// but it is a solid first line of defense for a small app.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true, // adds RateLimit-* response headers
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
