import { CandidateProfile, SkillLevel } from "../lib/types";

// Default static profile for demonstration
export const defaultProfile: CandidateProfile = {
  id: "profile-default-001",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1-555-0100",
  experience: {
    years: 5,
    months: 3,
    description:
      "Full-stack software development with expertise in modern web technologies",
    length: 5,
  },
  skills: [
    { name: "JavaScript", level: SkillLevel.ADVANCED, confidence: 0.9 },
    { name: "TypeScript", level: SkillLevel.ADVANCED, confidence: 0.85 },
    { name: "React", level: SkillLevel.EXPERT, confidence: 0.95 },
    { name: "Node.js", level: SkillLevel.ADVANCED, confidence: 0.88 },
    { name: "Python", level: SkillLevel.INTERMEDIATE, confidence: 0.75 },
    { name: "AWS", level: SkillLevel.INTERMEDIATE, confidence: 0.7 },
    { name: "PostgreSQL", level: SkillLevel.ADVANCED, confidence: 0.82 },
    { name: "Docker", level: SkillLevel.INTERMEDIATE, confidence: 0.68 },
    { name: "Git", level: SkillLevel.ADVANCED, confidence: 0.9 },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      graduationYear: 2019,
      gpa: 3.7,
      startDate: "2015-09-01",
      endDate: "2019-05-15",
      description: "Focused on software engineering and distributed systems",
    },
  ],
  interests: [
    "Open Source Contributions",
    "Tech Meetups",
    "Machine Learning",
    "System Design",
    "Mentoring Junior Developers",
  ],
  availability: {
    startDate: new Date("2024-03-01"),
    noticePeriod: 30,
    preferredSchedule: "Full-time",
  },
  salary: {
    expected: 130000,
    currency: "USD",
    negotiable: true,
  },
  salaryExpectation: "130000 USD",
  location: {
    current: "San Francisco, CA",
    willingToRelocate: false,
    preferredLocations: ["San Francisco", "Remote", "Oakland"],
  },
  confidence: 0.85,
  lastUpdated: new Date(),
  metadata: {
    source: "static",
    initialized: true,
  },
};

// Helper function to get the default profile
export const getDefaultProfile = (): CandidateProfile => {
  return {
    ...defaultProfile,
    id: `profile-${Date.now()}`,
    lastUpdated: new Date(),
  };
};
