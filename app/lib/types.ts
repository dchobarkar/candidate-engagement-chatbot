// CORE INTERFACES
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience: {
    min: number;
    max: number;
    unit: "years" | "months";
  };
  skills: string[];
  department?: string;
  remote?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  experience: {
    years: number;
    months: number;
    description?: string;
  };
  skills: Array<{
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    confidence: number; // 0-1
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear?: number;
    gpa?: number;
  }>;
  interests: string[];
  availability: {
    startDate?: Date;
    noticePeriod?: number; // in days
    preferredSchedule?: "Full-time" | "Part-time" | "Flexible";
  };
  salary: {
    expected: number;
    currency: string;
    negotiable: boolean;
  };
  location: {
    current: string;
    willingToRelocate: boolean;
    preferredLocations?: string[];
  };
  confidence: number; // Overall confidence score 0-1
  lastUpdated: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  metadata?: {
    messageType?: "text" | "image" | "file";
    extractedInfo?: Partial<CandidateProfile>;
    confidence?: number;
    processingTime?: number;
  };
  sessionId: string;
}

export interface ConversationSession {
  id: string;
  messages: ChatMessage[];
  candidateProfile: CandidateProfile;
  jobContext: JobDescription;
  status: "active" | "completed" | "expired";
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// API REQUEST/RESPONSE INTERFACES
export interface ChatRequest {
  message: string;
  sessionId: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  candidateProfile: CandidateProfile;
  extractedInfo?: Partial<CandidateProfile>;
  confidence: number;
  suggestions?: string[];
}

export interface SessionRequest {
  jobId?: string;
  candidateInfo?: Partial<CandidateProfile>;
}

export interface SessionResponse {
  sessionId: string;
  jobContext: JobDescription;
  candidateProfile: CandidateProfile;
  expiresAt: Date;
}

export interface ProfileUpdateRequest {
  sessionId: string;
  profile: Partial<CandidateProfile>;
}

export interface ProfileUpdateResponse {
  profile: CandidateProfile;
  confidence: number;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    confidence: number;
  }>;
}

// ERROR INTERFACES
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// STATE MANAGEMENT INTERFACES
export interface ChatState {
  messages: ChatMessage[];
  currentSession: ConversationSession | null;
  isLoading: boolean;
  error: ApiError | null;
  candidateProfile: CandidateProfile;
  jobContext: JobDescription | null;
}

export interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  updateProfile: (profile: Partial<CandidateProfile>) => void;
  setSession: (session: ConversationSession) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ApiError | null) => void;
  resetChat: () => void;
}

// UTILITY INTERFACES
export interface ConfidenceScore {
  overall: number;
  breakdown: {
    experience: number;
    skills: number;
    education: number;
    availability: number;
    salary: number;
  };
}

export interface ExtractionResult {
  field: string;
  value: any;
  confidence: number;
  source: string; // Which message or context this was extracted from
}

export interface ConversationContext {
  sessionId: string;
  jobContext: JobDescription;
  conversationHistory: ChatMessage[];
  extractedInfo: ExtractionResult[];
  currentProfile: CandidateProfile;
}

// ENUM TYPES
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum JobType {
  FULL_TIME = "Full-time",
  PART_TIME = "Part-time",
  CONTRACT = "Contract",
  INTERNSHIP = "Internship",
}

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert",
}

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

// TYPE GUARDS
export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.content === "string" &&
    ["user", "assistant", "system"].includes(obj.role) &&
    obj.timestamp instanceof Date
  );
}

export function isCandidateProfile(obj: any): obj is CandidateProfile {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.confidence === "number" &&
    obj.confidence >= 0 &&
    obj.confidence <= 1
  );
}

export function isJobDescription(obj: any): obj is JobDescription {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.company === "string" &&
    Array.isArray(obj.requirements) &&
    Array.isArray(obj.responsibilities)
  );
}
