import crypto from "crypto";
import { isDbConnected } from "../config/db.js";
import { User } from "../models/User.js";
import { Provider } from "../models/Provider.js";
import { Appointment } from "../models/Appointment.js";
import { Symptom } from "../models/Symptom.js";
import { MenstrualCycle } from "../models/MenstrualCycle.js";
import { ChatHistory } from "../models/ChatHistory.js";
import { memoryStore } from "../store/memoryStore.js";
import { seedProviders } from "../seed/providers.js";

const UserModel = User as any;
const ProviderModel = Provider as any;
const AppointmentModel = Appointment as any;
const SymptomModel = Symptom as any;
const MenstrualCycleModel = MenstrualCycle as any;
const ChatHistoryModel = ChatHistory as any;

function useMongo() {
  return isDbConnected();
}

export function formatUser(user: any) {
  const id = user._id?.toString?.() || user.id || user._id;
  return {
    id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    bloodType: user.bloodType || "",
    city: user.city || "",
    abhaId: user.abhaId || "",
    insuranceProvider: user.insuranceProvider || "",
    policyNumber: user.policyNumber || "",
    memberTier: user.memberTier || "Standard",
    emergencyContact: user.emergencyContact || { name: "", relationship: "", phone: "" },
    preferences: user.preferences || {
      enableWomensHealth: true,
      smsReminders: true,
      emailSummaries: true,
      pushAlerts: true,
      shareVitalsWithDoctors: true,
    },
    location: user.location,
  };
}

export function formatProvider(p: any) {
  const providerId = p.providerId || p.id;
  const avatarUrl = providerId === "dr-rajiv-mehta"
    ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
    : providerId === "dr-sneha-mukherjee"
    ? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
    : p.avatarUrl;

  return {
    id: providerId,
    name: p.name,
    title: p.title,
    specialty: p.specialty,
    category: p.category,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    experienceYears: p.experienceYears,
    hospitalAffiliation: p.hospitalAffiliation,
    clinicAddress: p.clinicAddress,
    city: p.city,
    metroArea: p.metroArea,
    distance: p.distance,
    consultationFee: p.consultationFee,
    insuranceAccepted: p.insuranceAccepted || [],
    avatarUrl,
    bio: p.bio,
    qualifications: p.qualifications,
    medicalRegistrationNumber: p.medicalRegistrationNumber,
    languagesSpoken: p.languagesSpoken || [],
    nextAvailable: p.nextAvailable,
    availableDays: p.availableDays || [],
    timeSlots: p.timeSlots || [],
    telehealthAvailable: p.telehealthAvailable,
    inPersonAvailable: p.inPersonAvailable,
    aiMatchReason: p.aiMatchReason,
    isUrgentFacility: p.isUrgentFacility,
    emergencyWaitTime: p.emergencyWaitTime,
    phone: p.phone,
    workingHours: p.workingHours,
    facilities: p.facilities,
  };
}

export const repository = {
  async seedProvidersIfEmpty() {
    if (useMongo()) {
      const count = await ProviderModel.countDocuments();
      if (count === 0) await ProviderModel.insertMany(seedProviders);
    } else {
      await memoryStore.seedProviders();
    }
  },

  async findUserById(id: string) {
    if (useMongo()) {
      const user = await UserModel.findById(id);
      return user ? formatUser(user.toObject()) : null;
    }
    const user = await memoryStore.findUserById(id);
    return user ? formatUser(user) : null;
  },

  async findUserByEmail(email: string) {
    if (useMongo()) {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user ? formatUser(user.toObject()) : null;
    }
    const user = await memoryStore.findUserByEmail(email);
    return user ? formatUser(user) : null;
  },

  async findUserByDemoToken(token: string) {
    if (useMongo()) {
      const user = await UserModel.findOne({ demoToken: token });
      return user ? formatUser(user.toObject()) : null;
    }
    const user = await memoryStore.findUserByDemoToken(token);
    return user ? formatUser(user) : null;
  },

  async findUserByFirebaseUid(uid: string) {
    if (useMongo()) {
      const user = await UserModel.findOne({ firebaseUid: uid });
      return user ? formatUser(user.toObject()) : null;
    }
    const user = await memoryStore.findUserByFirebaseUid(uid);
    return user ? formatUser(user) : null;
  },

  async createUser(data: any) {
    if (useMongo()) {
      const demoToken = data.demoToken || `demo_${crypto.randomBytes(16).toString("hex")}`;
      const user = await UserModel.create({ ...data, demoToken, email: data.email.toLowerCase() });
      return { user: formatUser(user.toObject()), token: demoToken };
    }
    return memoryStore.createUser(data).then(({ user, token }) => ({
      user: formatUser(user),
      token,
    }));
  },

  async getTokenForUser(userId: string) {
    if (useMongo()) {
      const user = await UserModel.findById(userId).select("demoToken");
      return user?.demoToken || null;
    }
    const user = await memoryStore.findUserById(userId);
    return user?.demoToken || null;
  },

  async getTokenByEmail(email: string) {
    if (useMongo()) {
      const user = await UserModel.findOne({ email: email.toLowerCase() }).select("demoToken");
      return user?.demoToken || null;
    }
    const user = await memoryStore.findUserByEmail(email);
    return user?.demoToken || null;
  },

  async updateUser(id: string, data: any) {
    if (useMongo()) {
      const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
      return user ? formatUser(user.toObject()) : null;
    }
    const user = await memoryStore.updateUser(id, data);
    return user ? formatUser(user) : null;
  },

  async getProviders(filters: Record<string, string> = {}) {
    if (useMongo()) {
      let query: any = {};
      if (filters.category && filters.category !== "all") query.category = filters.category;
      if (filters.minRating) query.rating = { $gte: Number(filters.minRating) };
      if (filters.telehealth === "true") query.telehealthAvailable = true;
      if (filters.search) {
        const q = filters.search;
        query.$or = [
          { name: { $regex: q, $options: "i" } },
          { specialty: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
        ];
      }
      let list = await ProviderModel.find(query).lean();
      if (filters.sort === "rating") list.sort((a, b) => b.rating - a.rating);
      else if (filters.sort === "distance") list.sort((a, b) => a.distanceKm - b.distanceKm);
      return list.map(formatProvider);
    }
    const list = await memoryStore.getProviders(filters);
    return list.map(formatProvider);
  },

  async getProviderById(providerId: string) {
    if (useMongo()) {
      const p = await ProviderModel.findOne({ providerId }).lean();
      return p ? formatProvider(p) : null;
    }
    const p = await memoryStore.getProviderById(providerId);
    return p ? formatProvider(p) : null;
  },

  async getAppointments(userId: string) {
    if (useMongo()) {
      const list = await AppointmentModel.find({ userId }).sort({ createdAt: -1 }).lean();
      return list.map((a) => ({ ...a, id: a._id.toString() }));
    }
    return memoryStore.getAppointments(userId);
  },

  async createAppointment(userId: string, data: any) {
    if (useMongo()) {
      const apt = await AppointmentModel.create({ ...data, userId });
      return { ...apt.toObject(), id: apt._id.toString() };
    }
    return memoryStore.createAppointment(userId, data);
  },

  async updateAppointment(userId: string, aptId: string, data: any) {
    if (useMongo()) {
      const apt = await AppointmentModel.findOneAndUpdate({ _id: aptId, userId }, data, { new: true });
      return apt ? { ...apt.toObject(), id: apt._id.toString() } : null;
    }
    return memoryStore.updateAppointment(userId, aptId, data);
  },

  async deleteAppointment(userId: string, aptId: string) {
    if (useMongo()) {
      await AppointmentModel.deleteOne({ _id: aptId, userId });
      return true;
    }
    return memoryStore.deleteAppointment(userId, aptId);
  },

  async getSymptoms(userId: string) {
    if (useMongo()) {
      const list = await SymptomModel.find({ userId }).sort({ createdAt: -1 }).lean();
      return list.map((s) => ({ ...s, id: s._id.toString() }));
    }
    return memoryStore.getSymptoms(userId);
  },

  async createSymptom(userId: string, data: any) {
    if (useMongo()) {
      const item = await SymptomModel.create({ ...data, userId });
      return { ...item.toObject(), id: item._id.toString() };
    }
    return memoryStore.createSymptom(userId, data);
  },

  async deleteSymptom(userId: string, symptomId: string) {
    if (useMongo()) {
      await SymptomModel.deleteOne({ _id: symptomId, userId });
      return true;
    }
    return memoryStore.deleteSymptom(userId, symptomId);
  },

  async getCycle(userId: string) {
    if (useMongo()) {
      const cycle = await MenstrualCycleModel.findOne({ userId }).lean();
      return cycle;
    }
    return memoryStore.getCycle(userId);
  },

  async upsertCycle(userId: string, data: any) {
    if (useMongo()) {
      const cycle = await MenstrualCycleModel.findOneAndUpdate({ userId }, data, { upsert: true, new: true });
      return cycle?.toObject();
    }
    return memoryStore.upsertCycle(userId, data);
  },

  async getChatSessions(userId: string) {
    if (useMongo()) {
      const list = await ChatHistoryModel.find({ userId }).sort({ updatedAt: -1 }).lean();
      return list.map((s) => ({
        id: s.sessionId,
        title: s.title,
        createdAt: s.createdAtLabel,
        lastMessageSnippet: s.lastMessageSnippet,
        messages: s.messages,
      }));
    }
    const list = await memoryStore.getChatSessions(userId);
    return list.map((s: any) => ({
      id: s.sessionId || s.id,
      title: s.title,
      createdAt: s.createdAtLabel || s.createdAt,
      lastMessageSnippet: s.lastMessageSnippet,
      messages: s.messages,
    }));
  },

  async upsertChatSession(userId: string, session: any) {
    if (useMongo()) {
      await ChatHistoryModel.findOneAndUpdate(
        { userId, sessionId: session.id || session.sessionId },
        {
          userId,
          sessionId: session.id || session.sessionId,
          title: session.title,
          createdAtLabel: session.createdAt,
          lastMessageSnippet: session.lastMessageSnippet,
          messages: session.messages,
        },
        { upsert: true, new: true }
      );
      return session;
    }
    return memoryStore.upsertChatSession(userId, {
      ...session,
      sessionId: session.id || session.sessionId,
      createdAtLabel: session.createdAt,
    });
  },

  async deleteChatSession(userId: string, sessionId: string) {
    if (useMongo()) {
      await ChatHistoryModel.deleteOne({ userId, sessionId });
      return true;
    }
    return memoryStore.deleteChatSession(userId, sessionId);
  },
};
