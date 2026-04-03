import xss from "xss";

// Nettoie récursivement les strings dans un objet
function sanitizeObject(obj) {
  if (typeof obj === "string") return xss(obj, { whiteList: {}, stripIgnoreTag: true });
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k] = sanitizeObject(v);
    }
    return clean;
  }
  return obj;
}

// Middleware sanitize body
export function sanitizeBody(req, res, next) {
  if (req.path === "/api/admin/upload-cv") return next();
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// Middleware sanitize params
export function sanitizeParams(req, res, next) {
  if (req.params) {
    for (const [k, v] of Object.entries(req.params)) {
      if (typeof v === "string") {
        req.params[k] = v.replace(/[^\w-]/g, "");
      }
    }
  }
  next();
}
