import jwt from "jsonwebtoken";
import { securityLog } from "../utils/logger.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const ip = req.ip || req.connection?.remoteAddress || "unknown";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    securityLog("UNAUTHORIZED_ACCESS", { ip, path: req.path });
    return res.status(401).json({ error: "Accès non autorisé" });
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.length > 500) {
    securityLog("INVALID_TOKEN_SIZE", { ip });
    return res.status(401).json({ error: "Token invalide" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      maxAge: "8h",
    });
    req.admin = decoded;
    next();
  } catch (err) {
    securityLog("INVALID_TOKEN", { ip, error: err.message });
    return res.status(401).json({ error: "Session expirée — reconnectez-vous" });
  }
}
