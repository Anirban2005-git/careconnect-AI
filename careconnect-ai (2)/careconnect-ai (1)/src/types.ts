export type NavTab = 
  | 'find_healthcare' 
  | 'ai_chatbot' 
  | 'womens_health' 
  | 'health_diet'
  | 'appointments' 
  | 'health_history' 
  | 'account_settings';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  city: string;
  abhaId: string;
  insuranceProvider: string;
  policyNumber: string;
  memberTier: 'Standard' | 'CareConnect Premium';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences: {
    enableWomensHealth: boolean;
    smsReminders: boolean;
    emailSummaries: boolean;
    pushAlerts: boolean;
    shareVitalsWithDoctors: boolean;
  };
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  category: 'neurology' | 'cardiology' | 'obgyn' | 'general' | 'urgent_care' | 'dermatology';
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  hospitalAffiliation: string;
  clinicAddress: string;
  city: string;
  metroArea: string;
  distance: string;
  consultationFee: number; // in INR ₹
  insuranceAccepted: string[];
  avatarUrl: string;
  bio: string;
  qualifications: string;
  medicalRegistrationNumber?: string;
  languagesSpoken: string[];
  nextAvailable: string;
  availableDays: string[];
  timeSlots: string[];
  telehealthAvailable: boolean;
  inPersonAvailable: boolean;
  aiMatchReason?: string;
  isUrgentFacility?: boolean;
  emergencyWaitTime?: string;
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerAvatar: string;
  clinicAddress: string;
  date: string; // e.g. "2024-11-12"
  time: string; // e.g. "10:15 AM"
  type: 'telehealth' | 'in_person';
  reason: string;
  symptoms?: string[];
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  consultationFee: number; // in INR ₹
  insuranceCoverage: number; // in INR ₹
  patientCopay: number; // in INR ₹
  rating?: number;
  meetingLink?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  suggestedSpecialist?: string | null;
  attachments?: { name: string; type: string; url?: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastMessageSnippet: string;
  messages: ChatMessage[];
}

export interface SymptomLog {
  id: string;
  date: string;
  cycleDay?: number;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  severityScore: number; // 1-5
  notes?: string;
  aiInsight?: string;
}

export interface CycleData {
  currentCycleDay: number;
  totalCycleDays: number;
  currentPhase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';
  phaseDescription: string;
  fertilityStatus: 'Low' | 'Medium' | 'Peak / High';
  daysUntilNextPeriod: number;
  nextPeriodDate: string;
  lastPeriodStartDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  regularityScore: number; // 0 - 100%
}

export interface RecipeRecommendation {
  id: string;
  name: string;
  category: string;
  phaseMatch: string;
  benefit: string;
  imageUrl: string;
  calories: number;
  ironMg: number;
  proteinG: number;
  ingredients: string[];
  instructions: string[];
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: 'hospital' | 'urgent_care' | 'hotline' | 'trauma';
  phone: string;
  address?: string;
  distance?: string;
  eta?: string;
  waitTime?: string;
  open247: boolean;
  notes: string;
}
