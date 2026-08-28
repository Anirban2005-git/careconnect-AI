import crypto from "crypto";
import { seedProviders } from "../seed/providers.js";

type Id = string;

const users = new Map<Id, any>();
const demoTokens = new Map<string, Id>();
const appointments = new Map<Id, any[]>();
const symptoms = new Map<Id, any[]>();
const cycles = new Map<Id, any>();
const chatSessions = new Map<Id, any[]>();
let providers = [...seedProviders];

function uid() {
  return crypto.randomUUID();
}

export const memoryStore = {
  isMemoryMode: true,

  async seedProviders() {
    providers = [...seedProviders];
  },

  async findUserById(id: Id) {
    return users.get(id) || null;
  },

  async findUserByEmail(email: string) {
    for (const user of users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) return user;
    }
    return null;
  },

  async findUserByDemoToken(token: string) {
    const id = demoTokens.get(token);
    return id ? users.get(id) : null;
  },

  async findUserByFirebaseUid(uid: string) {
    for (const user of users.values()) {
      if (user.firebaseUid === uid) return user;
    }
    return null;
  },

  async createUser(data: Partial<any>) {
    const id = uid();
    const demoToken = `demo_${crypto.randomBytes(16).toString("hex")}`;
    const user = {
      _id: id,
      id,
      demoToken,
      email: data.email,
      fullName: data.fullName || "CareConnect User",
      phone: data.phone || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      bloodType: data.bloodType || "O+",
      city: data.city || "Kolkata, West Bengal",
      abhaId: data.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      insuranceProvider: data.insuranceProvider || "Star Health Comprehensive Optima Plan",
      policyNumber: data.policyNumber || `SHI-WB-${Math.floor(Math.random() * 90000000)}`,
      memberTier: data.memberTier || "CareConnect Premium",
      emergencyContact: data.emergencyContact || { name: "", relationship: "", phone: "" },
      preferences: data.preferences || {
        enableWomensHealth: true,
        smsReminders: true,
        emailSummaries: true,
        pushAlerts: true,
        shareVitalsWithDoctors: true,
      },
      firebaseUid: data.firebaseUid,
      location: data.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(id, user);
    demoTokens.set(demoToken, id);
    this.seedUserData(id);
    return { user, token: demoToken };
  },

  seedUserData(userId: Id) {
    if (!appointments.has(userId)) {
      appointments.set(userId, [
        {
          _id: "apt-1092",
          id: "apt-1092",
          userId,
          providerId: "dr-debashis-banerjee",
          providerName: "Dr. Debashis Banerjee, MBBS, MD, DM",
          providerSpecialty: "Neurology (Headache Specialist)",
          providerAvatar: seedProviders[0].avatarUrl,
          clinicAddress: seedProviders[0].clinicAddress,
          date: "2024-11-12",
          time: "10:30 AM",
          type: "telehealth",
          reason: "Follow-up consultation for recurring throbbing migraine and visual aura symptoms.",
          symptoms: ["Migraine", "Light Sensitivity", "Tension Headache"],
          status: "confirmed",
          consultationFee: 1200,
          insuranceCoverage: 1000,
          patientCopay: 200,
          meetingLink: "https://careconnect.health/room/apt-1092-kolkata-telehealth",
          createdAt: "2024-10-20T14:30:00Z",
        },
      ]);
    }
    if (!symptoms.has(userId)) {
      symptoms.set(userId, [
        {
          _id: "symp-01",
          id: "symp-01",
          userId,
          date: "Today, Oct 24",
          cycleDay: 14,
          symptoms: ["Mild Headache", "Energy Surge", "Mild Bloating"],
          severity: "Mild",
          severityScore: 2,
          notes: "Feeling energetic in morning, slight temple tightness in late afternoon after screen work.",
          aiInsight: "Day 14 peak estrogen surge frequently triggers mild vascular headaches.",
        },
      ]);
    }
    if (!cycles.has(userId)) {
      cycles.set(userId, {
        userId,
        currentCycleDay: 14,
        totalCycleDays: 28,
        currentPhase: "Ovulation",
        phaseDescription: "Ovulation Phase • Peak Luteinizing Hormone (LH) & Estrogen",
        fertilityStatus: "Peak / High",
        daysUntilNextPeriod: 14,
        nextPeriodDate: "Nov 07, 2024",
        lastPeriodStartDate: "Oct 11, 2024",
        averageCycleLength: 28,
        averagePeriodLength: 5,
        regularityScore: 96,
        history: [],
      });
    }
    if (!chatSessions.has(userId)) {
      chatSessions.set(userId, [
        {
          _id: "chat-migraine",
          sessionId: "chat-migraine",
          id: "chat-migraine",
          userId,
          title: "Migraine & Aura Consultation",
          createdAtLabel: "Yesterday, 4:15 PM",
          lastMessageSnippet: "Clinical advice for left eye throbbing & light sensitivity...",
          messages: [
            {
              id: "m1",
              role: "user",
              content: "I have been experiencing a pulsing headache behind my left eye with mild visual zigzag lines. What could this be?",
              timestamp: "4:15 PM",
            },
            {
              id: "m2",
              role: "assistant",
              content: "### Assessment\nThese symptoms may align with migraine with visual aura. Please consult a neurologist for proper evaluation.",
              timestamp: "4:16 PM",
              suggestedSpecialist: "Neurologist (Dr. Debashis Banerjee)",
            },
          ],
        },
      ]);
    }
  },

  async updateUser(id: Id, data: Partial<any>) {
    const existing = users.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, _id: id, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  },

  async getProviders(filters: any = {}) {
    let list = [...providers];
    if (filters.category && filters.category !== "all") {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters.specialty) {
      const s = filters.specialty.toLowerCase();
      list = list.filter((p) => p.specialty.toLowerCase().includes(s) || p.category.includes(s));
    }
    if (filters.minRating) {
      list = list.filter((p) => p.rating >= Number(filters.minRating));
    }
    if (filters.telehealth === "true") {
      list = list.filter((p) => p.telehealthAvailable);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.hospitalAffiliation.toLowerCase().includes(q)
      );
    }
    if (filters.sort === "distance") {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (filters.sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    if (filters.radiusKm && filters.lat && filters.lng) {
      const radius = Number(filters.radiusKm);
      list = list.filter((p) => p.distanceKm <= radius);
    }
    return list;
  },

  async getProviderById(providerId: string) {
    return providers.find((p) => p.providerId === providerId) || null;
  },

  async getAppointments(userId: Id) {
    return appointments.get(userId) || [];
  },

  async createAppointment(userId: Id, data: any) {
    const id = `apt-${Date.now()}`;
    const apt = { _id: id, id, userId, ...data, createdAt: new Date().toISOString() };
    const list = appointments.get(userId) || [];
    list.unshift(apt);
    appointments.set(userId, list);
    return apt;
  },

  async updateAppointment(userId: Id, aptId: string, data: any) {
    const list = appointments.get(userId) || [];
    const idx = list.findIndex((a) => a.id === aptId || a._id === aptId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    appointments.set(userId, list);
    return list[idx];
  },

  async deleteAppointment(userId: Id, aptId: string) {
    const list = (appointments.get(userId) || []).filter((a) => a.id !== aptId && a._id !== aptId);
    appointments.set(userId, list);
    return true;
  },

  async getSymptoms(userId: Id) {
    return symptoms.get(userId) || [];
  },

  async createSymptom(userId: Id, data: any) {
    const id = `symp-${Date.now()}`;
    const item = { _id: id, id, userId, ...data };
    const list = symptoms.get(userId) || [];
    list.unshift(item);
    symptoms.set(userId, list);
    return item;
  },

  async deleteSymptom(userId: Id, symptomId: string) {
    const list = (symptoms.get(userId) || []).filter((s) => s.id !== symptomId && s._id !== symptomId);
    symptoms.set(userId, list);
    return true;
  },

  async getCycle(userId: Id) {
    return cycles.get(userId) || null;
  },

  async upsertCycle(userId: Id, data: any) {
    const existing = cycles.get(userId) || { userId };
    const updated = { ...existing, ...data, userId };
    cycles.set(userId, updated);
    return updated;
  },

  async getChatSessions(userId: Id) {
    return chatSessions.get(userId) || [];
  },

  async upsertChatSession(userId: Id, session: any) {
    const list = chatSessions.get(userId) || [];
    const idx = list.findIndex((s) => s.sessionId === session.sessionId || s.id === session.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...session };
    else list.unshift(session);
    chatSessions.set(userId, list);
    return session;
  },

  async deleteChatSession(userId: Id, sessionId: string) {
    const list = (chatSessions.get(userId) || []).filter((s) => s.sessionId !== sessionId && s.id !== sessionId);
    chatSessions.set(userId, list);
    return true;
  },
};
