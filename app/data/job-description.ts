import { JobDescription } from "../lib/types";

// Comprehensive job description for a Senior Software Engineer position
// This data is structured for easy access by conversation logic and enables meaningful conversations

export const jobDescription: JobDescription = {
  id: "se-2024-001",
  title: "Senior Software Engineer",
  company: "TechFlow Solutions",
  location: "San Francisco, CA (Hybrid)",
  type: "Full-time",
  requirements: [
    "Bachelor's degree in Computer Science, Engineering, or related field",
    "5+ years of experience in software development",
    "Strong proficiency in JavaScript/TypeScript, React, and Node.js",
    "Experience with cloud platforms (AWS, Azure, or GCP)",
    "Knowledge of database design and SQL",
    "Experience with microservices architecture",
    "Familiarity with CI/CD pipelines and DevOps practices",
    "Strong problem-solving and analytical skills",
    "Excellent communication and teamwork abilities",
    "Experience with Agile/Scrum methodologies",
  ],
  responsibilities: [
    "Design, develop, and maintain scalable web applications",
    "Collaborate with cross-functional teams to define and implement new features",
    "Write clean, maintainable, and well-documented code",
    "Participate in code reviews and provide constructive feedback",
    "Troubleshoot and debug complex technical issues",
    "Optimize application performance and user experience",
    "Mentor junior developers and share best practices",
    "Contribute to technical architecture decisions",
    "Stay up-to-date with emerging technologies and industry trends",
    "Participate in agile ceremonies and sprint planning",
  ],
  benefits: [
    "Competitive salary: $120,000 - $160,000 annually",
    "Comprehensive health, dental, and vision insurance",
    "401(k) matching up to 6%",
    "Flexible work arrangements (hybrid/remote options)",
    "Unlimited paid time off",
    "Professional development budget ($3,000/year)",
    "Home office setup allowance",
    "Stock options and equity participation",
    "Mental health and wellness programs",
    "Regular team events and social activities",
    "Learning and certification opportunities",
    "Flexible working hours",
  ],
  salary: {
    min: 120000,
    max: 160000,
    currency: "USD",
  },
  experience: {
    min: 5,
    max: 8,
    unit: "years",
  },
  skills: [
    "JavaScript/TypeScript",
    "React.js",
    "Node.js",
    "Python",
    "AWS/Cloud Services",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "MongoDB",
    "GraphQL",
    "REST APIs",
    "Git",
    "CI/CD",
    "Microservices",
    "Agile/Scrum",
  ],
  department: "Engineering",
  remote: true,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

// Additional job data for different positions (for future expansion)
export const additionalJobs: Partial<JobDescription>[] = [
  {
    id: "fe-2024-002",
    title: "Frontend Developer",
    company: "TechFlow Solutions",
    location: "Remote",
    type: "Full-time",
    requirements: [
      "3+ years of frontend development experience",
      "Strong proficiency in React, Vue.js, or Angular",
      "Experience with modern CSS frameworks",
      "Knowledge of responsive design principles",
    ],
    salary: {
      min: 80000,
      max: 110000,
      currency: "USD",
    },
  },
  {
    id: "be-2024-003",
    title: "Backend Developer",
    company: "TechFlow Solutions",
    location: "New York, NY",
    type: "Full-time",
    requirements: [
      "4+ years of backend development experience",
      "Strong proficiency in Python, Java, or Go",
      "Experience with database design and optimization",
      "Knowledge of API design and microservices",
    ],
    salary: {
      min: 100000,
      max: 140000,
      currency: "USD",
    },
  },
];

// Helper functions for job data access
export const getJobById = (id: string): JobDescription | undefined => {
  if (id === jobDescription.id) {
    return jobDescription;
  }
  return additionalJobs.find((job) => job.id === id) as
    | JobDescription
    | undefined;
};

export const getJobRequirements = (): string[] => {
  return jobDescription.requirements;
};

export const getJobBenefits = (): string[] => {
  return jobDescription.benefits;
};

export const getJobResponsibilities = (): string[] => {
  return jobDescription.responsibilities;
};

export const getJobSkills = (): string[] => {
  return jobDescription.skills;
};

export const getSalaryRange = (): {
  min: number;
  max: number;
  currency: string;
} => {
  return jobDescription.salary!;
};

export const getExperienceRange = (): {
  min: number;
  max: number;
  unit: "years" | "months";
} => {
  return jobDescription.experience;
};

// Job-specific conversation prompts
export const jobConversationPrompts = {
  requirements: "What are the main requirements for this position?",
  benefits: "What benefits and perks does this role offer?",
  responsibilities: "What would my day-to-day responsibilities be?",
  salary: "What is the salary range for this position?",
  experience: "How much experience is required for this role?",
  skills: "What technical skills are most important for this position?",
  location: "Is this position remote, hybrid, or on-site?",
  team: "What is the team structure and culture like?",
  growth: "What opportunities for growth and advancement are available?",
};
