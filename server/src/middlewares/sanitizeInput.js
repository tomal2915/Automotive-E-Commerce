// Recursively removes any object key that starts with "$" or contains "."
// — these are how NoSQL injection payloads are typically shaped in MongoDB
// (e.g. { email: { "$gt": "" } } bypasses an equality check).
// Mutates the object in place instead of reassigning it, since req.query
// is a getter-only property in modern Express and can't be replaced wholesale.
const stripDangerousKeys = (obj) => {
  if (obj === null || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === "object" && obj[key] !== null) {
      stripDangerousKeys(obj[key]);
    }
  }
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) stripDangerousKeys(req.body);
  if (req.query) stripDangerousKeys(req.query);
  if (req.params) stripDangerousKeys(req.params);
  next();
};
