import { jobDescription } from "./job-description";
import {
  CandidateProfile,
  ConversationSession,
  MessageRole,
  SkillLevel,
} from "../lib/types";

// SAMPLE CANDIDATE PROFILES
export const sampleCandidateProfiles: CandidateProfile[] = [
  {
    id: "candidate-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    experience: {
      years: 6,
      months: 8,
      description: "Full-stack development with focus on React and Node.js",
    },
    skills: [
      { name: "JavaScript", level: SkillLevel.EXPERT, confidence: 0.95 },
      { name: "TypeScript", level: SkillLevel.ADVANCED, confidence: 0.9 },
      { name: "React", level: SkillLevel.EXPERT, confidence: 0.92 },
      { name: "Node.js", level: SkillLevel.ADVANCED, confidence: 0.88 },
      { name: "Python", level: SkillLevel.INTERMEDIATE, confidence: 0.75 },
      { name: "AWS", level: SkillLevel.INTERMEDIATE, confidence: 0.7 },
      { name: "PostgreSQL", level: SkillLevel.ADVANCED, confidence: 0.85 },
      { name: "Docker", level: SkillLevel.INTERMEDIATE, confidence: 0.65 },
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        graduationYear: 2018,
        gpa: 3.8,
      },
    ],
    interests: [
      "Machine Learning",
      "Open Source",
      "Tech Conferences",
      "Mentoring",
    ],
    availability: {
      startDate: new Date("2024-03-01"),
      noticePeriod: 30,
      preferredSchedule: "Full-time",
    },
    salary: {
      expected: 140000,
      currency: "USD",
      negotiable: true,
    },
    location: {
      current: "San Francisco, CA",
      willingToRelocate: false,
      preferredLocations: ["San Francisco", "Remote"],
    },
    confidence: 0.85,
    lastUpdated: new Date("2024-01-20"),
  },
  {
    id: "candidate-002",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0456",
    experience: {
      years: 4,
      months: 3,
      description: "Frontend specialist with strong UI/UX skills",
    },
    skills: [
      { name: "JavaScript", level: SkillLevel.ADVANCED, confidence: 0.88 },
      { name: "React", level: SkillLevel.EXPERT, confidence: 0.92 },
      { name: "Vue.js", level: SkillLevel.ADVANCED, confidence: 0.85 },
      { name: "CSS/SCSS", level: SkillLevel.EXPERT, confidence: 0.9 },
      { name: "TypeScript", level: SkillLevel.INTERMEDIATE, confidence: 0.7 },
      { name: "Node.js", level: SkillLevel.BEGINNER, confidence: 0.45 },
    ],
    education: [
      {
        degree: "Bachelor of Arts in Design",
        institution: "UC Berkeley",
        graduationYear: 2020,
        gpa: 3.6,
      },
    ],
    interests: ["UI/UX Design", "Animation", "Accessibility", "Performance"],
    availability: {
      startDate: new Date("2024-02-15"),
      noticePeriod: 14,
      preferredSchedule: "Full-time",
    },
    salary: {
      expected: 110000,
      currency: "USD",
      negotiable: false,
    },
    location: {
      current: "Oakland, CA",
      willingToRelocate: true,
      preferredLocations: ["San Francisco", "Oakland", "Remote"],
    },
    confidence: 0.72,
    lastUpdated: new Date("2024-01-18"),
  },
  {
    id: "candidate-003",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@email.com",
    phone: "+1-555-0789",
    experience: {
      years: 8,
      months: 0,
      description: "Senior backend engineer with microservices expertise",
    },
    skills: [
      { name: "Python", level: SkillLevel.EXPERT, confidence: 0.95 },
      { name: "Java", level: SkillLevel.ADVANCED, confidence: 0.88 },
      { name: "Go", level: SkillLevel.INTERMEDIATE, confidence: 0.75 },
      { name: "AWS", level: SkillLevel.EXPERT, confidence: 0.92 },
      { name: "Docker", level: SkillLevel.EXPERT, confidence: 0.9 },
      { name: "Kubernetes", level: SkillLevel.ADVANCED, confidence: 0.85 },
      { name: "PostgreSQL", level: SkillLevel.EXPERT, confidence: 0.88 },
      { name: "MongoDB", level: SkillLevel.ADVANCED, confidence: 0.8 },
    ],
    education: [
      {
        degree: "Master of Science in Computer Science",
        institution: "MIT",
        graduationYear: 2016,
        gpa: 3.9,
      },
    ],
    interests: [
      "System Architecture",
      "Performance Optimization",
      "DevOps",
      "Leadership",
    ],
    availability: {
      startDate: new Date("2024-04-01"),
      noticePeriod: 60,
      preferredSchedule: "Full-time",
    },
    salary: {
      expected: 160000,
      currency: "USD",
      negotiable: true,
    },
    location: {
      current: "Seattle, WA",
      willingToRelocate: true,
      preferredLocations: ["San Francisco", "Seattle", "Remote"],
    },
    confidence: 0.95,
    lastUpdated: new Date("2024-01-22"),
  },
];

// SAMPLE CONVERSATION FLOWS
export const sampleConversationFlows = {
  // Ideal candidate conversation
  idealCandidate: [
    {
      role: MessageRole.USER,
      content:
        "Hi, I'm interested in the Senior Software Engineer position. Can you tell me more about the requirements?",
      timestamp: new Date("2024-01-20T10:00:00Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Hello! I'd be happy to help you learn more about the Senior Software Engineer role at TechFlow Solutions. The main requirements include a Bachelor's degree in Computer Science or related field, 5+ years of software development experience, strong proficiency in JavaScript/TypeScript, React, and Node.js, experience with cloud platforms like AWS, and knowledge of microservices architecture. What's your background in these areas?",
      timestamp: new Date("2024-01-20T10:00:05Z"),
    },
    {
      role: MessageRole.USER,
      content:
        "I have 6 years of experience with React and Node.js, and I've worked extensively with AWS. I also have experience with Docker and microservices. What's the salary range for this position?",
      timestamp: new Date("2024-01-20T10:00:30Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Great! Your experience aligns well with our requirements. The salary range for this position is $120,000 to $160,000 annually, depending on experience and skills. We also offer comprehensive benefits including health insurance, 401(k) matching, unlimited PTO, and stock options. What's your expected salary range?",
      timestamp: new Date("2024-01-20T10:00:35Z"),
    },
    {
      role: MessageRole.USER,
      content:
        "That sounds good. I'm looking for around $140,000. I'm currently in San Francisco and prefer hybrid work. What are the day-to-day responsibilities?",
      timestamp: new Date("2024-01-20T10:01:00Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Perfect! Your salary expectation is within our range. The role is hybrid in San Francisco, which should work well for you. Day-to-day responsibilities include designing and developing scalable web applications, collaborating with cross-functional teams, writing clean and maintainable code, participating in code reviews, troubleshooting technical issues, and mentoring junior developers. You'd also contribute to technical architecture decisions and stay updated with emerging technologies. When would you be available to start?",
      timestamp: new Date("2024-01-20T10:01:05Z"),
    },
  ],

  // Underqualified candidate conversation
  underqualifiedCandidate: [
    {
      role: MessageRole.USER,
      content:
        "Hi, I'm interested in the Senior Software Engineer position. I have 2 years of experience with JavaScript.",
      timestamp: new Date("2024-01-20T11:00:00Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Hello! Thank you for your interest in the Senior Software Engineer role. While we appreciate your JavaScript experience, this position requires 5+ years of software development experience. However, we do have a Frontend Developer position that might be a better fit for your experience level. Would you like to learn more about that role instead?",
      timestamp: new Date("2024-01-20T11:00:05Z"),
    },
    {
      role: MessageRole.USER,
      content:
        "Yes, that sounds interesting. What are the requirements for the Frontend Developer position?",
      timestamp: new Date("2024-01-20T11:00:30Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "The Frontend Developer position requires 3+ years of frontend development experience, strong proficiency in React, Vue.js, or Angular, experience with modern CSS frameworks, and knowledge of responsive design principles. The salary range is $80,000 to $110,000. Would you like to tell me more about your frontend experience?",
      timestamp: new Date("2024-01-20T11:00:35Z"),
    },
  ],

  // Salary negotiation conversation
  salaryNegotiation: [
    {
      role: MessageRole.USER,
      content:
        "I'm very interested in the Senior Software Engineer role. I have 7 years of experience and I'm looking for $180,000.",
      timestamp: new Date("2024-01-20T12:00:00Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Thank you for your interest! Your experience level is excellent. However, our salary range for this position is $120,000 to $160,000. We do offer comprehensive benefits including stock options, which can significantly increase total compensation. We also have opportunities for advancement and salary growth. Would you be open to discussing the total compensation package?",
      timestamp: new Date("2024-01-20T12:00:05Z"),
    },
    {
      role: MessageRole.USER,
      content:
        "I understand. Can you tell me more about the benefits and growth opportunities?",
      timestamp: new Date("2024-01-20T12:00:30Z"),
    },
    {
      role: MessageRole.ASSISTANT,
      content:
        "Absolutely! Our benefits include comprehensive health, dental, and vision insurance, 401(k) matching up to 6%, unlimited paid time off, a $3,000 professional development budget annually, home office setup allowance, stock options, mental health programs, and regular team events. We also offer clear career progression paths with regular performance reviews and salary adjustments. Many of our engineers advance to senior and lead positions within 2-3 years. What aspects of the role and company culture are most important to you?",
      timestamp: new Date("2024-01-20T12:00:35Z"),
    },
  ],
};

// EDGE CASE SCENARIOS
export const edgeCaseScenarios = {
  // Candidate with no experience
  noExperience: {
    candidate: {
      id: "candidate-004",
      name: "Recent Graduate",
      experience: { years: 0, months: 0 },
      skills: [
        { name: "JavaScript", level: SkillLevel.BEGINNER, confidence: 0.3 },
        { name: "React", level: SkillLevel.BEGINNER, confidence: 0.25 },
      ],
      salary: { expected: 60000, currency: "USD", negotiable: true },
      confidence: 0.2,
    } as CandidateProfile,
    conversation: [
      {
        role: MessageRole.USER,
        content:
          "I just graduated from college. Do you have any entry-level positions?",
        timestamp: new Date("2024-01-20T13:00:00Z"),
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Congratulations on your graduation! While we don't currently have entry-level positions open, we do have internship opportunities that can lead to full-time roles. We also recommend gaining some experience through open source projects or smaller companies first. Would you like me to keep your information on file for future opportunities?",
        timestamp: new Date("2024-01-20T13:00:05Z"),
      },
    ],
  },

  // Overqualified candidate
  overqualified: {
    candidate: {
      id: "candidate-005",
      name: "Senior Director",
      experience: { years: 15, months: 0 },
      skills: [
        { name: "Leadership", level: SkillLevel.EXPERT, confidence: 0.95 },
        { name: "Architecture", level: SkillLevel.EXPERT, confidence: 0.9 },
        { name: "Management", level: SkillLevel.EXPERT, confidence: 0.92 },
      ],
      salary: { expected: 250000, currency: "USD", negotiable: false },
      confidence: 0.98,
    } as CandidateProfile,
    conversation: [
      {
        role: MessageRole.USER,
        content:
          "I have 15 years of experience and have been a senior director. Is this role appropriate for my level?",
        timestamp: new Date("2024-01-20T14:00:00Z"),
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "Your experience is impressive! This Senior Software Engineer role might be below your level. We do have leadership opportunities in our engineering department that could be a better fit. Would you be interested in discussing our Engineering Manager or Technical Lead positions?",
        timestamp: new Date("2024-01-20T14:00:05Z"),
      },
    ],
  },

  // Remote work preference conflict
  remoteConflict: {
    candidate: {
      id: "candidate-006",
      name: "Remote Only",
      location: {
        current: "Austin, TX",
        willingToRelocate: false,
        preferredLocations: ["Remote only"],
      },
      confidence: 0.75,
    } as CandidateProfile,
    conversation: [
      {
        role: MessageRole.USER,
        content:
          "I can only work remotely. Is that possible for this position?",
        timestamp: new Date("2024-01-20T15:00:00Z"),
      },
      {
        role: MessageRole.ASSISTANT,
        content:
          "This position is hybrid in San Francisco, requiring some in-office time. However, we do have fully remote positions available in other departments. Would you like me to connect you with our remote opportunities, or would you be open to discussing the hybrid arrangement?",
        timestamp: new Date("2024-01-20T15:00:05Z"),
      },
    ],
  },
};

// TEST SESSIONS
export const testSessions: ConversationSession[] = [
  {
    id: "session-001",
    messages: sampleConversationFlows.idealCandidate.map((msg, index) => ({
      id: `msg-${index}`,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      sessionId: "session-001",
    })),
    candidateProfile: sampleCandidateProfiles[0],
    jobContext: jobDescription,
    status: "active",
    createdAt: new Date("2024-01-20T10:00:00Z"),
    updatedAt: new Date("2024-01-20T10:01:05Z"),
    expiresAt: new Date("2024-01-27T10:00:00Z"),
  },
  {
    id: "session-002",
    messages: sampleConversationFlows.underqualifiedCandidate.map(
      (msg, index) => ({
        id: `msg-${index}`,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        sessionId: "session-002",
      })
    ),
    candidateProfile: sampleCandidateProfiles[1],
    jobContext: jobDescription,
    status: "completed",
    createdAt: new Date("2024-01-20T11:00:00Z"),
    updatedAt: new Date("2024-01-20T11:00:35Z"),
    expiresAt: new Date("2024-01-27T11:00:00Z"),
  },
];

// HELPER FUNCTIONS FOR TESTING
export const getRandomCandidate = (): CandidateProfile => {
  const randomIndex = Math.floor(
    Math.random() * sampleCandidateProfiles.length
  );
  return sampleCandidateProfiles[randomIndex];
};

export const getConversationFlow = (
  flowName: keyof typeof sampleConversationFlows
) => {
  return sampleConversationFlows[flowName];
};

export const getEdgeCase = (scenarioName: keyof typeof edgeCaseScenarios) => {
  return edgeCaseScenarios[scenarioName];
};

export const createTestSession = (
  candidateId: string,
  flowName: keyof typeof sampleConversationFlows
): ConversationSession => {
  const candidate =
    sampleCandidateProfiles.find((c) => c.id === candidateId) ||
    sampleCandidateProfiles[0];
  const messages = sampleConversationFlows[flowName].map((msg, index) => ({
    id: `test-msg-${index}`,
    content: msg.content,
    role: msg.role,
    timestamp: msg.timestamp,
    sessionId: `test-session-${Date.now()}`,
  }));

  return {
    id: `test-session-${Date.now()}`,
    messages,
    candidateProfile: candidate,
    jobContext: jobDescription,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };
};
