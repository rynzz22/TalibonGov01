/**
 * Municipality of Talibon Digital Core v2 - Future Modules Architecture Manifest
 * 
 * Provides modular extension points and feature capability flags for post-soft-launch
 * integrations without modifying or refactoring existing core services.
 */

export interface FutureModuleConfig {
  id: string;
  name: string;
  status: "planned" | "coming_soon" | "phase_2";
  description: string;
  enabled: boolean;
}

export const FUTURE_MODULES: Record<string, FutureModuleConfig> = {
  onlinePayments: {
    id: "online_payments",
    name: "Online Payments Gateway",
    status: "coming_soon",
    description: "Integrated payment processing for Xendit, LandBank, Maya, and GCash.",
    enabled: false,
  },
  smsNotifications: {
    id: "sms_notifications",
    name: "SMS Dispatch & Alerts",
    status: "coming_soon",
    description: "Automated SMS ticket tracking and disaster broadcast warnings.",
    enabled: false,
  },
  aiAssistant: {
    id: "ai_assistant",
    name: "LLM AI Municipal Assistant",
    status: "planned",
    description: "Generative AI conversational support for complex citizen inquiries.",
    enabled: false,
  },
  appointmentScheduling: {
    id: "appointment_scheduling",
    name: "Online Appointment Booking",
    status: "planned",
    description: "Direct appointment calendar for Mayor's Office, BPLO, and Assessor.",
    enabled: false,
  },
  queueMonitoring: {
    id: "queue_monitoring",
    name: "Real-time Queue Monitoring",
    status: "planned",
    description: "Live ticket queue monitoring and estimated wait times at Municipal Hall.",
    enabled: false,
  },
  digitalSignatures: {
    id: "digital_signatures",
    name: "PKI Digital Signatures",
    status: "planned",
    description: "Cryptographic digital signing for issued official certificates and permits.",
    enabled: false,
  },
  deliveryTracking: {
    id: "delivery_tracking",
    name: "Document Courier & Delivery Tracking",
    status: "planned",
    description: "Doorstep delivery dispatch tracking for claimed municipal documents.",
    enabled: false,
  },
};

export function isModuleEnabled(moduleId: keyof typeof FUTURE_MODULES): boolean {
  return FUTURE_MODULES[moduleId]?.enabled || false;
}
