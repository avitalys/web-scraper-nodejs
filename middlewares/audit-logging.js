const { console } = require("../utils/logger");

exports.auditLoggingMiddleware = (req, res, next) => {
  // get the IP and user agent of the request, if available
  const ip = (req.headers["x-forwarded-for"] || req.ip) ?? "";
  const userAgent = req.headers["user-agent"] ?? "";

  const entry = {
    action: `${req.method}, ${req.originalUrl}`,
    params: req.params ?? null,
    body: req.body ?? null,
    occurredAt: new Date(),
    context: {
      location: ip === "::1" ? "127.0.0.1" : ip,
      userAgent,
    },
  };

  console.log(entry);
  next();
};
