import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  suggestedSpecialist?: string | null;
}

export interface IChatHistory extends Document {
  userId: Types.ObjectId | string;
  sessionId: string;
  title: string;
  createdAtLabel: string;
  lastMessageSnippet: string;
  messages: IChatMessage[];
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true },
    title: String,
    createdAtLabel: String,
    lastMessageSnippet: String,
    messages: [
      {
        id: String,
        role: String,
        content: String,
        timestamp: String,
        isEmergency: Boolean,
        suggestedSpecialist: String,
      },
    ],
  },
  { timestamps: true }
);

ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const ChatHistory = mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
