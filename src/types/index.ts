export type ServiceType =
  | "it-support"
  | "social-media"
  | "consulting"
  | "web-dev"
  | "system-migration"
  | "lead-generation"
  | "workshop";

export type TechLevel = "beginner" | "intermediate" | "advanced";
export type ClientType = "residential" | "smb";
export type NeedLevel = "low" | "medium" | "high" | "urgent";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export const SERVICE_LABELS: Record<string, string> = {
  "it-support": "IT Support",
  "social-media": "Social Media Mgmt",
  consulting: "Tech Consulting",
  "web-dev": "Web Development",
  "system-migration": "System Migration",
  "lead-generation": "Lead Generation",
  workshop: "Workshop / Training",
};

export const NEED_LEVEL_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TECH_LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
