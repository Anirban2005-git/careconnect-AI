import express, { Express } from "express";
import cors from "cors";
import { connectDatabase } from "./config/db.js";
import { initFirebase } from "./config/firebase.js";
import { repository } from "./data/repository.js";
import { apiRateLimiter, aiRateLimiter } from "./middleware/rateLimit.js";
import { handleChat, handleAnalyzeSymptoms } from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/providers.js";
import aiRoutes from "./routes/ai.js";
import appointmentRoutes from "./routes/appointments.js";
import symptomRoutes from "./routes/symptoms.js";
import womensHealthRoutes from "./routes/womensHealth.js";
import healthRoutes from "./routes/health.js";
import mapsRoutes from "./routes/maps.js";
import { authMiddleware } from "./middleware/auth.js";

export async function createApp(): Promise<Express> {
  await connectDatabase();
  initFirebase();
  await repository.seedProvidersIfEmpty();

  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use("/api", apiRateLimiter);

  app.use("/api/health", healthRoutes);
  app.use("/api/maps", mapsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/providers", providerRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/symptoms", symptomRoutes);
  app.use("/api/womens-health", womensHealthRoutes);

  // Legacy AI endpoints (backward compatible with existing frontend)
  app.post("/api/chat", aiRateLimiter, authMiddleware, handleChat);
  app.post("/api/analyze-symptoms", aiRateLimiter, authMiddleware, handleAnalyzeSymptoms);

  return app;
}
