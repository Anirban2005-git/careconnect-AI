import { Router, Response } from "express";
import crypto from "crypto";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import { repository } from "../data/repository.js";
import { verifyFirebaseToken, isFirebaseReady } from "../config/firebase.js";

const router = Router();

router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ error: "Email and full name are required" });
    }
    const existing = await repository.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered. Please sign in." });

    const { user, token } = await repository.createUser({ email, fullName });
    return res.status(201).json({ token, user, demoMode: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await repository.findUserByEmail(email);
    if (!user) {
      const created = await repository.createUser({ email, fullName: email.split("@")[0] });
      user = created.user;
      return res.json({ token: created.token, user, demoMode: true });
    }

    let token = await repository.getTokenByEmail(email);
    if (!token) {
      token = `demo_${crypto.randomBytes(16).toString("hex")}`;
      await repository.updateUser(user.id, { demoToken: token });
    }

    return res.json({ token, user, demoMode: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/firebase", authRateLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Firebase ID token required" });

    if (!isFirebaseReady()) {
      return res.status(503).json({ error: "Firebase not configured. Use demo login.", demoMode: true });
    }

    const decoded = await verifyFirebaseToken(idToken);
    if (!decoded) return res.status(401).json({ error: "Invalid Firebase token" });

    let user = await repository.findUserByFirebaseUid(decoded.uid);
    if (!user) {
      const created = await repository.createUser({
        firebaseUid: decoded.uid,
        email: decoded.email || `${decoded.uid}@careconnect.in`,
        fullName: decoded.name || "CareConnect User",
      });
      user = created.user;
    }

    return res.json({ token: idToken, user, demoMode: false });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await repository.findUserById(req.userId!);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

router.post("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const updated = await repository.updateUser(req.userId!, req.body);
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json(updated);
});

router.put("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  const updated = await repository.updateUser(req.userId!, req.body);
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json(updated);
});

export default router;
