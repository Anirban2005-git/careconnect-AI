import { Router } from "express";
import { isDbConnected } from "../config/db.js";
import { isFirebaseReady } from "../config/firebase.js";
import { isAiConfigured } from "../services/aiService.js";
import { memoryStore } from "../store/memoryStore.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiConfigured: isAiConfigured(),
    mongoConfigured: isDbConnected(),
    firebaseConfigured: isFirebaseReady(),
    demoMode: !isDbConnected() || memoryStore.isMemoryMode,
    region: "India (IN)",
    disclaimer: "CareConnect AI provides general health information and healthcare navigation. It does not provide medical diagnosis or replace a qualified healthcare professional.",
  });
});

export default router;
