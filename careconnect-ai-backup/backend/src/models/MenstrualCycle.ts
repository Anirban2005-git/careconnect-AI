import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMenstrualCycle extends Document {
  userId: Types.ObjectId | string;
  currentCycleDay: number;
  totalCycleDays: number;
  currentPhase: "Menstrual" | "Follicular" | "Ovulation" | "Luteal";
  phaseDescription: string;
  fertilityStatus: "Low" | "Medium" | "Peak / High";
  daysUntilNextPeriod: number;
  nextPeriodDate: string;
  lastPeriodStartDate: string;
  lastPeriodEndDate?: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  regularityScore: number;
  flowLevel?: "Light" | "Moderate" | "Heavy";
  history?: Array<{ startDate: string; endDate?: string; cycleLength?: number; flowLevel?: string }>;
}

const MenstrualCycleSchema = new Schema<IMenstrualCycle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentCycleDay: { type: Number, default: 1 },
    totalCycleDays: { type: Number, default: 28 },
    currentPhase: { type: String, default: "Follicular" },
    phaseDescription: String,
    fertilityStatus: { type: String, default: "Low" },
    daysUntilNextPeriod: Number,
    nextPeriodDate: String,
    lastPeriodStartDate: String,
    lastPeriodEndDate: String,
    averageCycleLength: { type: Number, default: 28 },
    averagePeriodLength: { type: Number, default: 5 },
    regularityScore: { type: Number, default: 90 },
    flowLevel: String,
    history: [{ startDate: String, endDate: String, cycleLength: Number, flowLevel: String }],
  },
  { timestamps: true }
);

export const MenstrualCycle = mongoose.models.MenstrualCycle || mongoose.model<IMenstrualCycle>("MenstrualCycle", MenstrualCycleSchema);
