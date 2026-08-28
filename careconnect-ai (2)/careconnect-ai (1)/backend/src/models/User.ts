import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firebaseUid?: string;
  demoToken?: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  city: string;
  abhaId: string;
  insuranceProvider: string;
  policyNumber: string;
  memberTier: "Standard" | "CareConnect Premium";
  emergencyContact: { name: string; relationship: string; phone: string };
  preferences: {
    enableWomensHealth: boolean;
    smsReminders: boolean;
    emailSummaries: boolean;
    pushAlerts: boolean;
    shareVitalsWithDoctors: boolean;
  };
  location?: { lat: number; lng: number; label?: string };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, unique: true, sparse: true },
    demoToken: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    bloodType: { type: String, default: "" },
    city: { type: String, default: "Kolkata, West Bengal" },
    abhaId: { type: String, default: "" },
    insuranceProvider: { type: String, default: "" },
    policyNumber: { type: String, default: "" },
    memberTier: { type: String, enum: ["Standard", "CareConnect Premium"], default: "Standard" },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    preferences: {
      enableWomensHealth: { type: Boolean, default: true },
      smsReminders: { type: Boolean, default: true },
      emailSummaries: { type: Boolean, default: true },
      pushAlerts: { type: Boolean, default: true },
      shareVitalsWithDoctors: { type: Boolean, default: true },
    },
    location: {
      lat: Number,
      lng: Number,
      label: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
