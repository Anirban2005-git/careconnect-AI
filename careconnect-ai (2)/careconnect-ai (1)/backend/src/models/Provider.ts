import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  providerId: string;
  name: string;
  title: string;
  specialty: string;
  category: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  hospitalAffiliation: string;
  clinicAddress: string;
  city: string;
  metroArea: string;
  distance: string;
  distanceKm: number;
  lat?: number;
  lng?: number;
  consultationFee: number;
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
  phone?: string;
  workingHours?: string;
  facilities?: string[];
}

const ProviderSchema = new Schema<IProvider>({
  providerId: { type: String, required: true, unique: true },
  name: String,
  title: String,
  specialty: String,
  category: String,
  rating: Number,
  reviewsCount: Number,
  experienceYears: Number,
  hospitalAffiliation: String,
  clinicAddress: String,
  city: String,
  metroArea: String,
  distance: String,
  distanceKm: Number,
  lat: Number,
  lng: Number,
  consultationFee: Number,
  insuranceAccepted: [String],
  avatarUrl: String,
  bio: String,
  qualifications: String,
  medicalRegistrationNumber: String,
  languagesSpoken: [String],
  nextAvailable: String,
  availableDays: [String],
  timeSlots: [String],
  telehealthAvailable: Boolean,
  inPersonAvailable: Boolean,
  aiMatchReason: String,
  isUrgentFacility: Boolean,
  emergencyWaitTime: String,
  phone: String,
  workingHours: String,
  facilities: [String],
});

export const Provider = mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema);
