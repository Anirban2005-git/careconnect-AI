import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISymptom extends Document {
  userId: Types.ObjectId | string;
  date: string;
  cycleDay?: number;
  symptoms: string[];
  severity: "Mild" | "Moderate" | "Severe";
  severityScore: number;
  notes?: string;
  aiInsight?: string;
  createdAt: Date;
}

const SymptomSchema = new Schema<ISymptom>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: String,
    cycleDay: Number,
    symptoms: [String],
    severity: { type: String, enum: ["Mild", "Moderate", "Severe"] },
    severityScore: Number,
    notes: String,
    aiInsight: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Symptom = mongoose.models.Symptom || mongoose.model<ISymptom>("Symptom", SymptomSchema);
