import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { repository } from "../data/repository.js";
import { analyzeSymptoms } from "../services/aiService.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const symptoms = await repository.getSymptoms(req.userId!);
  return res.json(symptoms);
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  let aiInsight = req.body.aiInsight;
  if (!aiInsight && req.body.symptoms) {
    const analysis = await analyzeSymptoms({
      symptoms: req.body.symptoms,
      cycleDay: req.body.cycleDay,
      cyclePhase: req.body.cyclePhase,
      notes: req.body.notes,
    });
    aiInsight = analysis.insight;
  }
  const item = await repository.createSymptom(req.userId!, { ...req.body, aiInsight });
  return res.status(201).json(item);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  await repository.deleteSymptom(req.userId!, req.params.id);
  return res.json({ success: true });
});

export default router;
