export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserSummary {
  userId: string;
  email: string;
  userCategory: string;
  status: string;
}

export interface Provider {
  providerId: string;
  user?: UserSummary;
  providerName: string;
  category: string | null;
  specialty: string | null;
  location: string | null;
  region: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  rates: number | null;
}

export interface ProviderAvailability {
  availabilityId: string;
  provider?: Provider;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  startTime: string; // "HH:mm:ss"
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface AvailableSlot {
  startTime: string; // ISO offset datetime
  durationMinutes: number;
}

export interface Profile {
  profileId: string;
  surname: string;
  otherNames: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone1: string | null;
  residence: string | null;
  region: string | null;
  relation: string | null;
  isPrimary: boolean;
}

export interface Appointment {
  appointmentId: string;
  patientProfile: Profile;
  provider: Provider;
  scheduledAt: string;
  durationSlot: number;
  status: "pending" | "completed" | "cancelled" | string;
  attended: boolean;
}

export interface Consultation {
  consultationId: string;
  patientProfile: Profile;
  provider: Provider;
  callType: "video" | "audio" | "chat" | string;
  startedAt: string | null;
  endedAt: string | null;
  amountCharged: number | null;
  status: "scheduled" | "completed" | "cancelled" | string;
}

export interface Review {
  reviewId: string;
  reviewerProfile: Profile;
  provider: Provider;
  ratingQuality: number;
  ratingHelpful: number;
  ratingTimely: number;
  ratingCare: number;
  reviewText: string | null;
}

export interface Wallet {
  walletId: string;
  user?: UserSummary;
  balanceKes: number;
  updatedAt: string;
}

export interface Transaction {
  transactionId: string;
  wallet?: Wallet;
  amount: number;
  type: "top_up" | "debit" | "refund" | string;
  paymentMethod: string | null;
  mpesaReference: string | null;
  status: "pending" | "completed" | "failed" | string;
  createdAt: string;
}

export interface HealthInfo {
  healthInfoId: string;
  profile?: Profile;
  identifier: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  mentalConditions: string | null;
  longTermMeds: string | null;
  familyHistory: string | null;
  drugUse: string | null;
}

export interface Document {
  documentId: string;
  ownerProfile?: Profile;
  docType: string | null;
  fileUrl: string;
  fileName: string | null;
  sharedWith: string | null;
  createdAt: string;
}

export interface MedicalRequest {
  requestId: string;
  consultation?: Consultation;
  requestType: "prescription" | "referral" | "lab_order" | string;
  content: string | null;
  sentToProvider?: Provider;
  createdAt: string;
}

export interface Notification {
  notificationId: string;
  user?: UserSummary;
  title: string;
  body: string | null;
  notifType: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Insurance {
  insuranceId: string;
  profile?: Profile;
  insurerName: string;
  policyNumber: string | null;
  phone1: string | null;
  phone2: string | null;
}

export interface EmergencyContact {
  contactId: string;
  profile?: Profile;
  name: string;
  phone1: string;
  phone2: string | null;
  priority: number;
  emergencyType: string | null;
}
