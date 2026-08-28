import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!aiClient && key && key !== "MY_GEMINI_API_KEY") {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "careconnect-ai" } },
    });
  }
  return aiClient;
}

export function isAiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "MY_GEMINI_API_KEY");
}

function detectResponseLanguage(text: string): "English" | "Bengali" | "Hindi" {
  if (/[\u0980-\u09ff]/.test(text)) return "Bengali";
  if (/[\u0900-\u097f]/.test(text)) return "Hindi";
  return "English";
}

function responseMatchesLanguage(text: string, language: "English" | "Bengali" | "Hindi") {
  if (language === "Bengali") return /[\u0980-\u09ff]/.test(text);
  if (language === "Hindi") return /[\u0900-\u097f]/.test(text);
  return !/[\u0980-\u09ff\u0900-\u097f]/.test(text);
}

function getFallbackReply(language: "English" | "Bengali" | "Hindi", message: string, isEmergency: boolean) {
  if (isEmergency) {
    if (language === "Bengali") {
      return `⚠️ **জরুরি চিকিৎসা সতর্কতা**: আপনার বার্তায় এমন লক্ষণ থাকতে পারে যার জন্য অবিলম্বে জরুরি চিকিৎসা প্রয়োজন।\n\n**এখনই যা করবেন:**\n1. অবিলম্বে **112** বা **108** নম্বরে ফোন করুন।\n2. নিজে গাড়ি চালিয়ে হাসপাতালে যাবেন না।\n3. কাছের 24/7 জরুরি বিভাগে যান এবং কারও সাহায্য নিন।\n\n*CareConnect AI জরুরি রোগ নির্ণয় বা চিকিৎসা করতে পারে না।*`;
    }
    if (language === "Hindi") {
      return `⚠️ **तत्काल चिकित्सा चेतावनी**: आपके संदेश में ऐसे लक्षण हो सकते हैं जिनके लिए तुरंत आपातकालीन चिकित्सा सहायता आवश्यक है।\n\n**अभी ये कदम उठाएं:**\n1. तुरंत **112** या **108** पर कॉल करें।\n2. खुद गाड़ी चलाकर अस्पताल न जाएं।\n3. किसी की मदद लें और नज़दीकी 24/7 आपातकालीन विभाग में जाएं।\n\n*CareConnect AI आपातकालीन बीमारी का निदान या इलाज नहीं कर सकता।*`;
    }
    return `⚠️ **URGENT MEDICAL ALERT**: Based on your message, you may be experiencing symptoms that require immediate emergency attention.\n\n**Action Steps:**\n1. Call **112** or **108** immediately.\n2. Do not drive yourself to the hospital.\n3. Ask someone to stay with you and visit the nearest 24/7 emergency department.\n\n*CareConnect AI cannot diagnose or treat emergency medical conditions.*`;
  }

  if (language === "Bengali") {
    return `### সাধারণ স্বাস্থ্য পরামর্শ\nআপনার উদ্বেগ জানানোর জন্য ধন্যবাদ। নিয়মিত লক্ষণ পর্যবেক্ষণ করুন এবং প্রয়োজনে চিকিৎসকের পরামর্শ নিন।\n\n**সাধারণ যত্ন:** পর্যাপ্ত পানি পান করুন, বিশ্রাম নিন এবং স্বাস্থ্য ইতিহাসে আপনার লক্ষণ লিখে রাখুন।\n\n**সতর্কতা:** CareConnect AI শুধুমাত্র সাধারণ স্বাস্থ্য তথ্য দেয়; এটি চিকিৎসা রোগ নির্ণয় নয়।`;
  }
  if (language === "Hindi") {
    return `### सामान्य स्वास्थ्य सलाह\nअपनी चिंता साझा करने के लिए धन्यवाद। लक्षणों पर नियमित ध्यान दें और आवश्यकता होने पर डॉक्टर से सलाह लें।\n\n**सामान्य देखभाल:** पर्याप्त पानी पिएं, आराम करें और अपने लक्षणों को हेल्थ हिस्ट्री में दर्ज करें।\n\n**अस्वीकरण:** CareConnect AI केवल सामान्य स्वास्थ्य जानकारी देता है; यह चिकित्सा निदान नहीं है।`;
  }
  return `### General Health Recommendations\nThank you for sharing your concern. Monitor your symptoms regularly and consult a doctor when needed.\n\n**General Care:** Hydrate well, rest adequately, and track symptoms in Health History.\n\n**Disclaimer:** CareConnect AI provides general health information only; this is not a medical diagnosis.`;
}

export function detectSpecialist(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("headache") || lower.includes("migraine") || lower.includes("dizzy") || lower.includes("numbness") || lower.includes("brain")) {
    return "Neurologist (Dr. Debashis Banerjee)";
  }
  if (lower.includes("period") || lower.includes("cramp") || lower.includes("ovulation") || lower.includes("pregnancy") || lower.includes("hormon") || lower.includes("pcos") || lower.includes("pcod")) {
    return "OB-GYN / Gynecologist (Dr. Sneha Mukherjee)";
  }
  if (lower.includes("chest") || lower.includes("palpitation") || lower.includes("heart") || lower.includes("blood pressure") || lower.includes("hypertension")) {
    return "Cardiologist (Dr. Rajiv Mehta)";
  }
  if (lower.includes("rash") || lower.includes("skin") || lower.includes("acne") || lower.includes("eczema") || lower.includes("scalp")) {
    return "Dermatologist (Dr. Priya Sen)";
  }
  if (lower.includes("fever") || lower.includes("cough") || lower.includes("cold") || lower.includes("flu") || lower.includes("stomach") || lower.includes("infection")) {
    return "General Physician (Dr. Amitava Roy)";
  }
  return null;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("emergency") || lower.includes("trauma") || lower.includes("accident")) return "urgent_care";
  if (lower.includes("gyn") || lower.includes("period") || lower.includes("women") || lower.includes("obgyn")) return "obgyn";
  if (lower.includes("heart") || lower.includes("cardio") || lower.includes("chest")) return "cardiology";
  if (lower.includes("skin") || lower.includes("derma") || lower.includes("rash")) return "dermatology";
  if (lower.includes("headache") || lower.includes("migraine") || lower.includes("neuro")) return "neurology";
  return "general";
}

function generateSmartFallback(message: string, isEmergency: boolean) {
  const language = detectResponseLanguage(message);
  if (isEmergency) {
    return {
      reply: getFallbackReply(language, message, true),
      isEmergency: true,
      suggestedSpecialist: "Hospital Emergency Department (Medica / Apollo)",
      demoMode: true,
    };
  }

  const lower = message.toLowerCase();
  let reply = "";
  let specialist = "General Physician (Dr. Amitava Roy)";

  if (lower.includes("migraine") || lower.includes("headache")) {
    specialist = "Neurologist (Dr. Debashis Banerjee)";
    reply = `### Assessment & Clinical Guidance: Headaches & Migraines\nMigraines and tension headaches are among the most common neurological concerns.\n\n**Self-Care:** Rest in a dark room, hydrate with coconut water, and avoid screen glare.\n\n**Important:** This is general educational information, not a diagnosis. Consult a neurologist for persistent symptoms.`;
  } else if (lower.includes("period") || lower.includes("cramp") || lower.includes("cycle") || lower.includes("pcos")) {
    specialist = "OB-GYN (Dr. Sneha Mukherjee)";
    reply = `### Assessment & Clinical Guidance: Menstrual Health\nMenstrual cramps are commonly linked to hormonal changes.\n\n**Self-Care:** Warm compress, gentle stretching, iron-rich Indian meals like moong dal khichdi.\n\n**Important:** This is general information. Consult a gynecologist for severe or irregular symptoms.`;
  } else {
    reply = getFallbackReply(language, message, false);
  }

  if (language !== "English") {
    reply = getFallbackReply(language, message, false);
  }

  return { reply, isEmergency: false, suggestedSpecialist: specialist, demoMode: true };
}

export async function chatWithAI(messages: any[]) {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const emergencyRegex = /(severe chest pain|cannot breathe|unconscious|heavy bleeding|suicidal|stroke symptoms|paralyzed|face drooping|poisoning|severe trauma)/i;
  const isEmergency = emergencyRegex.test(lastUserMessage);
  const ai = getGeminiAI();

  if (ai) {
    const responseLanguage = detectResponseLanguage(lastUserMessage);
    const systemInstruction = `You are CareConnect AI, a healthcare navigation and health education assistant for Indian patients.
Provide general educational information only — never diagnose or prescribe.
Structure answers with: Assessment & Summary, Possible Causes (non-definitive), Self-Care, When to See a Specialist, Red Flag Warnings.
Always include that this is not a replacement for professional medical diagnosis.
  IMPORTANT: Reply entirely in ${responseLanguage}. Do not use English headings, explanations, or disclaimer text when the response language is Bengali or Hindi. Detect the language from the latest user message, support English, Bengali, and Hindi, and preserve the medical meaning. If the user mixes languages, use the dominant language.
${isEmergency ? "CRITICAL: Advise calling 112 or 108 immediately." : ""}`;

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: { systemInstruction, temperature: 0.7 },
    });

    let reply = response.text || "";
    if (reply && !responseMatchesLanguage(reply, responseLanguage)) {
      const translatedResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Translate the following healthcare response into ${responseLanguage}. Return only the translated response, with no English text unless it is a medical term, medicine name, or emergency phone number. Preserve the safety advice and meaning.\n\n${reply}`,
        config: { temperature: 0.2 },
      });
      reply = translatedResponse.text || getFallbackReply(responseLanguage, lastUserMessage, isEmergency);
    }

    return {
      reply: reply || getFallbackReply(responseLanguage, lastUserMessage, isEmergency),
      isEmergency,
      suggestedSpecialist: detectSpecialist(lastUserMessage),
      demoMode: false,
    };
  }

  return generateSmartFallback(lastUserMessage, isEmergency);
}

export async function translateGuidance(text: string, language: "English" | "Bengali" | "Hindi") {
  if (language === "English") return text;
  const ai = getGeminiAI();
  if (!ai) {
    if (language === "Bengali") {
      return text
        .replace(/### Cycle-stage guidance/g, "### চক্রের পর্যায়ের পরামর্শ")
        .replace(/Your logged symptoms may align with typical hormonal fluctuations during the (.*?) phase\./g, "আপনার নথিভুক্ত লক্ষণগুলি সাধারণত মাসিক চক্রের $1 পর্যায়ের হরমোনের পরিবর্তনের সঙ্গে সম্পর্কিত হতে পারে।")
        .replace(/\*\*Precautions:\*\*/g, "**সতর্কতা:**")
        .replace(/Rest and monitor symptoms\. Seek medical care for severe or worsening pain, fainting, trouble breathing, or unusual heavy bleeding\./g, "বিশ্রাম নিন এবং লক্ষণগুলি পর্যবেক্ষণ করুন। তীব্র বা বাড়তে থাকা ব্যথা, অজ্ঞান হয়ে যাওয়া, শ্বাসকষ্ট বা অস্বাভাবিক অতিরিক্ত রক্তপাত হলে চিকিৎসা নিন।")
        .replace(/\*\*Food:\*\*/g, "**খাবার:**")
        .replace(/Choose balanced meals with leafy greens, lentils, ragi, fruit, and protein\./g, "শাকসবজি, ডাল, রাগি, ফল এবং প্রোটিন দিয়ে সুষম খাবার খান।")
        .replace(/\*\*Hydration:\*\*/g, "**পানি পান:**")
        .replace(/Aim for regular fluids through the day; consider an extra glass if you are sweating or have a headache\./g, "সারাদিন নিয়মিত পানি পান করুন; ঘাম হলে বা মাথাব্যথা থাকলে অতিরিক্ত এক গ্লাস পানি পান করুন।")
        .replace(/\*\*Sleep and self-care:\*\*/g, "**ঘুম ও নিজের যত্ন:**")
        .replace(/Aim for 7-9 hours of sleep, take screen breaks, and try gentle stretching or a warm compress\./g, "৭-৯ ঘণ্টা ঘুমান, স্ক্রিন থেকে বিরতি নিন এবং হালকা স্ট্রেচিং বা গরম সেঁক চেষ্টা করুন।")
        .replace(/\*General information only - not a medical diagnosis\.\*/g, "*এটি সাধারণ তথ্য, চিকিৎসা রোগ নির্ণয় নয়।*");
    }
    return text
      .replace(/### Cycle-stage guidance/g, "### चक्र के चरण की सलाह")
      .replace(/Your logged symptoms may align with typical hormonal fluctuations during the (.*?) phase\./g, "आपके दर्ज लक्षण मासिक चक्र के $1 चरण में होने वाले सामान्य हार्मोनल बदलावों से जुड़े हो सकते हैं।")
      .replace(/\*\*Precautions:\*\*/g, "**सावधानियां:**")
      .replace(/Rest and monitor symptoms\. Seek medical care for severe or worsening pain, fainting, trouble breathing, or unusual heavy bleeding\./g, "आराम करें और लक्षणों पर ध्यान दें। तेज या बढ़ते दर्द, बेहोशी, सांस लेने में परेशानी या असामान्य भारी रक्तस्राव पर चिकित्सा सहायता लें।")
      .replace(/\*\*Food:\*\*/g, "**भोजन:**")
      .replace(/Choose balanced meals with leafy greens, lentils, ragi, fruit, and protein\./g, "हरी पत्तेदार सब्जियों, दाल, रागी, फल और प्रोटीन से भरपूर संतुलित भोजन लें।")
      .replace(/\*\*Hydration:\*\*/g, "**पानी:**")
      .replace(/Aim for regular fluids through the day; consider an extra glass if you are sweating or have a headache\./g, "दिनभर नियमित रूप से पानी पिएं; पसीना आने या सिरदर्द होने पर एक अतिरिक्त गिलास पिएं।")
      .replace(/\*\*Sleep and self-care:\*\*/g, "**नींद और स्वयं की देखभाल:**")
      .replace(/Aim for 7-9 hours of sleep, take screen breaks, and try gentle stretching or a warm compress\./g, "7-9 घंटे सोएं, स्क्रीन से विराम लें और हल्की स्ट्रेचिंग या गर्म सिकाई करें।")
      .replace(/\*General information only - not a medical diagnosis\.\*/g, "*यह केवल सामान्य जानकारी है, चिकित्सा निदान नहीं।*");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Translate this women's health guidance into ${language}. Return only the translation. Do not include any English text except medical terms, numbers, or medicine names. Preserve all safety advice and formatting.\n\n${text}`,
    config: { temperature: 0.2 },
  });
  return response.text || text;
}

export async function analyzeSymptoms(data: { symptoms: string[]; cycleDay?: number; cyclePhase?: string; notes?: string }) {
  const ai = getGeminiAI();
  const { symptoms, cycleDay, cyclePhase, notes } = data;

  if (ai) {
    const prompt = `Patient symptoms: ${symptoms.join(", ")}\nCycle Day: ${cycleDay || "N/A"}, Phase: ${cyclePhase || "N/A"}\nNotes: ${notes || "None"}\n\nProvide practical, general wellness guidance for this cycle stage and these symptoms. Include: why the symptoms may occur in this phase, precautions and warning signs, recommended foods, hydration guidance, sleep and rest guidance, and gentle self-care actions. Keep it concise but complete, use short Markdown headings or bullets, and clearly state that this is general information and not a diagnosis. Do not prescribe medication.`;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
    return { insight: response.text, demoMode: false };
  }

  let insight = `### Cycle-stage guidance\nYour logged symptoms may align with typical hormonal fluctuations during the ${cyclePhase || "current"} phase.\n\n**Precautions:** Rest and monitor symptoms. Seek medical care for severe or worsening pain, fainting, trouble breathing, or unusual heavy bleeding.\n\n**Food:** Choose balanced meals with leafy greens, lentils, ragi, fruit, and protein.\n\n**Hydration:** Aim for regular fluids through the day; consider an extra glass if you are sweating or have a headache.\n\n**Sleep and self-care:** Aim for 7-9 hours of sleep, take screen breaks, and try gentle stretching or a warm compress.\n\n*General information only - not a medical diagnosis.*`;
  if (symptoms?.includes("Cramps") || symptoms?.includes("Headache")) {
    insight = `Mild ${symptoms.join(" and ")} are often reported during the ${cyclePhase || "current"} phase. Consider a warm compress and rest. *General information only — not a diagnosis.*`;
  }
  return { insight, demoMode: true };
}

export async function analyzeHealthQuery(query: string) {
  const emergencyRegex = /(severe chest pain|cannot breathe|unconscious|heavy bleeding|stroke|emergency)/i;
  const isEmergency = emergencyRegex.test(query);
  const category = detectCategory(query);
  const specialist = detectSpecialist(query);
  const ai = getGeminiAI();

  if (ai) {
    const prompt = `Analyze this healthcare navigation query for an Indian user: "${query}"
Return JSON only with keys: problemSummary, suggestedSpecialty, urgency (low/medium/high/emergency), recommendedCategory (neurology/obgyn/cardiology/dermatology/general/urgent_care), disclaimer.
Do NOT diagnose.`;
    try {
      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...parsed, isEmergency, demoMode: false };
      }
    } catch {
      /* fallback below */
    }
  }

  return {
    problemSummary: `Based on your query about "${query.slice(0, 80)}", we can help you find suitable healthcare providers nearby.`,
    suggestedSpecialty: specialist || "General Physician",
    urgency: isEmergency ? "emergency" : "medium",
    recommendedCategory: category,
    disclaimer: "This is general health navigation assistance, not a medical diagnosis.",
    isEmergency,
    demoMode: true,
  };
}
