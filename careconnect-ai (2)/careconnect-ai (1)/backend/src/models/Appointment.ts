import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  userId: Types.ObjectId | string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerAvatar: string;
  clinicAddress: string;
  date: string;
  time: string;
  type: "telehealth" | "in_person";
  reason: string;
  symptoms?: string[];
  status: "confirmed" | "pending" | "completed" | "cancelled";
  consultationFee: number;
  insuranceCoverage: number;
  patientCopay: number;
  rating?: number;
  meetingLink?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: String,
    providerName: String,
    providerSpecialty: String,
    providerAvatar: String,
    clinicAddress: String,
    date: String,
    time: String,
    type: { type: String, enum: ["telehealth", "in_person"] },
    reason: String,
    symptoms: [String],
    status: { type: String, enum: ["confirmed", "pending", "completed", "cancelled"], default: "confirmed" },
    consultationFee: Number,
    insuranceCoverage: Number,
    patientCopay: Number,
    rating: { type: Number, min: 1, max: 5 },
    meetingLink: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
