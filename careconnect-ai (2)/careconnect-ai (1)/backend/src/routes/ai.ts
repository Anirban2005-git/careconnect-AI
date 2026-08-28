import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { aiRateLimiter } from "../middleware/rateLimit.js";
import { chatWithAI, analyzeSymptoms, analyzeHealthQuery, isAiConfigured, translateGuidance } from "../services/aiService.js";

const router = Router();

async function handleChat(req: AuthRequest, res: Response) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const result = await chatWithAI(messages);
    return res.json(result);
  } catch {
    const lastMessage = req.body?.messages?.[req.body.messages.length - 1]?.content || "";
    const language = /[\u0980-\u09ff]/.test(lastMessage) ? "bn" : /[\u0900-\u097f]/.test(lastMessage) ? "hi" : "en";
    const reply = language === "bn"
      ? "আপনার অনুরোধটি সম্পূর্ণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। জরুরি প্রয়োজনে 112 বা 108 নম্বরে যোগাযোগ করুন।"
      : language === "hi"
        ? "आपका अनुरोध पूरा नहीं हो सका। कृपया फिर से कोशिश करें। आपातकालीन स्थिति में 112 या 108 पर संपर्क करें।"
        : "Your request could not be completed. Please try again. For immediate healthcare needs, contact your physician or call 112 / 108.";
    return res.status(500).json({
      error: "Error processing your request",
      reply,
    });
  }
}

async function handleAnalyzeSymptoms(req: AuthRequest, res: Response) {
  try {
    const { symptoms, cycleDay, cyclePhase, notes } = req.body;
    const result = await analyzeSymptoms({ symptoms, cycleDay, cyclePhase, notes });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Failed to analyze symptoms" });
  }
}

async function handleTranslateGuidance(req: AuthRequest, res: Response) {
  try {
    const { text, language } = req.body;
    if (!text || !["English", "Bengali", "Hindi"].includes(language)) {
      return res.status(400).json({ error: "Guidance text and a supported language are required" });
    }
    const translatedText = await translateGuidance(text, language);
    return res.json({ text: translatedText });
  } catch {
    return res.status(500).json({ error: "Failed to translate guidance" });
  }
}

async function handleAnalyzeQuery(req: AuthRequest, res: Response) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    const result = await analyzeHealthQuery(query);
    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Failed to analyze query" });
  }
}

router.post("/chat", aiRateLimiter, authMiddleware, handleChat);
router.post("/analyze", aiRateLimiter, authMiddleware, handleAnalyzeQuery);
router.post("/analyze-symptoms", aiRateLimiter, authMiddleware, handleAnalyzeSymptoms);
router.post("/translate-guidance", aiRateLimiter, authMiddleware, handleTranslateGuidance);

export { handleChat, handleAnalyzeSymptoms, handleAnalyzeQuery, handleTranslateGuidance, isAiConfigured };
export default router;
