import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { repository } from "../data/repository.js";

const router = Router();

router.get("/", async (req, res) => {
  const filters = req.query as Record<string, string>;
  const providers = await repository.getProviders(filters);
  return res.json({ providers, count: providers.length, demoMode: true });
});

router.get("/nearby", async (req, res) => {
  const { lat, lng, radiusKm, category, search, sort, minRating, telehealth } = req.query;
  const filters: Record<string, string> = {};
  if (lat) filters.lat = String(lat);
  if (lng) filters.lng = String(lng);
  if (radiusKm) filters.radiusKm = String(radiusKm);
  if (category) filters.category = String(category);
  if (search) filters.search = String(search);
  if (sort) filters.sort = String(sort);
  if (minRating) filters.minRating = String(minRating);
  if (telehealth) filters.telehealth = String(telehealth);

  const providers = await repository.getProviders(filters);
  return res.json({
    providers,
    count: providers.length,
    location: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
    demoMode: !process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === "MY_GOOGLE_MAPS_API_KEY",
  });
});

router.get("/:id", async (req, res) => {
  const provider = await repository.getProviderById(req.params.id);
  if (!provider) return res.status(404).json({ error: "Provider not found" });
  return res.json(provider);
});

export default router;
