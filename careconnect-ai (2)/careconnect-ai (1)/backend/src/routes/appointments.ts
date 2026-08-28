import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { repository } from "../data/repository.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const appointments = await repository.getAppointments(req.userId!);
  return res.json(appointments);
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const apt = await repository.createAppointment(req.userId!, req.body);
  return res.status(201).json(apt);
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const apt = await repository.updateAppointment(req.userId!, req.params.id, req.body);
  if (!apt) return res.status(404).json({ error: "Appointment not found" });
  return res.json(apt);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  await repository.deleteAppointment(req.userId!, req.params.id);
  return res.json({ success: true });
});

export default router;
