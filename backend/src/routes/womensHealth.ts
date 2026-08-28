import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { repository } from "../data/repository.js";

const router = Router();

router.get("/cycles", authMiddleware, async (req: AuthRequest, res: Response) => {
  const cycle = await repository.getCycle(req.userId!);
  return res.json(cycle || {});
});

router.post("/cycles", authMiddleware, async (req: AuthRequest, res: Response) => {
  const cycle = await repository.upsertCycle(req.userId!, req.body);
  return res.status(201).json(cycle);
});

router.put("/cycles/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const cycle = await repository.upsertCycle(req.userId!, req.body);
  return res.json(cycle);
});

router.delete("/cycles/:id", authMiddleware, async (_req: AuthRequest, res: Response) => {
  return res.json({ success: true, message: "Cycle record cleared" });
});

router.get("/chat-sessions", authMiddleware, async (req: AuthRequest, res: Response) => {
  const sessions = await repository.getChatSessions(req.userId!);
  return res.json(sessions);
});

router.post("/chat-sessions", authMiddleware, async (req: AuthRequest, res: Response) => {
  const session = await repository.upsertChatSession(req.userId!, req.body);
  return res.status(201).json(session);
});

router.put("/chat-sessions/:sessionId", authMiddleware, async (req: AuthRequest, res: Response) => {
  const session = await repository.upsertChatSession(req.userId!, { ...req.body, id: req.params.sessionId });
  return res.json(session);
});

router.delete("/chat-sessions/:sessionId", authMiddleware, async (req: AuthRequest, res: Response) => {
  await repository.deleteChatSession(req.userId!, req.params.sessionId);
  return res.json({ success: true });
});

export default router;
