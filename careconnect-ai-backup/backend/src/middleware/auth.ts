import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken, isFirebaseReady } from "../config/firebase.js";
import { repository } from "../data/repository.js";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; fullName: string };
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.slice(7);

    if (isFirebaseReady() && !token.startsWith("demo_")) {
      const decoded = await verifyFirebaseToken(token);
      if (decoded) {
        let user = await repository.findUserByFirebaseUid(decoded.uid);
        if (!user) {
          const created = await repository.createUser({
            firebaseUid: decoded.uid,
            email: decoded.email || `${decoded.uid}@careconnect.in`,
            fullName: decoded.name || "CareConnect User",
          });
          user = created.user;
        }
        req.user = { id: user.id, email: user.email, fullName: user.fullName };
        req.userId = user.id;
        return next();
      }
    }

    const demoUser = await repository.findUserByDemoToken(token);
    if (demoUser) {
      req.user = { id: demoUser.id, email: demoUser.email, fullName: demoUser.fullName };
      req.userId = demoUser.id;
      return next();
    }

    return res.status(401).json({ error: "Invalid or expired token" });
  } catch {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();
  authMiddleware(req, _res, next).catch(next);
}
