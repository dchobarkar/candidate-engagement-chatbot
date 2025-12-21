import { JobDescription } from "../lib/types";

// Complete job listings
export const jobs: JobDescription[] = [
  {
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
    experienceDetails: {},
    education: {},
    postedDate: new Date("2024-01-15"),
    summary: "Join our engineering team to build cutting-edge solutions that impact millions of users worldwide.",
  },
  {
    id: "fe-2024-002",
    title: "Frontend Developer",
    company: "TechFlow Solutions",
    location: "Remote",
    type: "Full-time",
    requirements: [
      "3+ years of frontend development experience",
      "Strong proficiency in React, Vue.js, or Angular",
      "Experience with modern CSS frameworks (Tailwind, Bootstrap)",
      "Knowledge of responsive design principles",
      "Understanding of state management (Redux, Zustand, or similar)",
      "Experience with testing frameworks (Jest, React Testing Library)",
      "Familiarity with build tools (Webpack, Vite, or similar)",
      "Strong attention to detail and design aesthetics",
      "Experience with version control (Git)",
      "Good communication skills and ability to work in a team",
    ],
    responsibilities: [
      "Develop responsive and interactive user interfaces",
      "Collaborate with designers to implement UI/UX designs",
      "Optimize applications for maximum speed and scalability",
      "Ensure cross-browser compatibility",
      "Write clean, maintainable, and reusable code",
      "Participate in code reviews and team discussions",
      "Work closely with backend developers to integrate APIs",
      "Stay updated with frontend technologies and best practices",
      "Contribute to design system and component library",
      "Debug and fix frontend issues",
    ],
    benefits: [
      "Competitive salary: $80,000 - $110,000 annually",
      "Fully remote work option",
      "Health, dental, and vision insurance",
      "401(k) matching up to 5%",
      "Flexible working hours",
      "Professional development opportunities",
      "Home office stipend",
      "Annual team retreats",
      "Learning budget ($2,000/year)",
    ],
    salary: {
      min: 80000,
      max: 110000,
      currency: "USD",
    },
    experience: {
      min: 3,
      max: 5,
      unit: "years",
    },
    skills: [
      "React",
      "Vue.js",
      "TypeScript",
      "JavaScript",
      "CSS/SCSS",
      "Tailwind CSS",
      "Redux",
      "GraphQL",
      "Webpack",
      "Jest",
      "Git",
    ],
    department: "Engineering",
    remote: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    experienceDetails: {},
    education: {},
    postedDate: new Date("2024-01-20"),
    summary: "Create beautiful and intuitive user experiences that delight our customers.",
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
      "Knowledge of API design and microservices architecture",
      "Familiarity with cloud platforms (AWS, GCP, or Azure)",
      "Experience with containerization (Docker, Kubernetes)",
      "Understanding of RESTful and GraphQL APIs",
      "Knowledge of message queues and event-driven architecture",
      "Strong problem-solving and debugging skills",
      "Experience with testing and CI/CD pipelines",
    ],
    responsibilities: [
      "Design and develop scalable backend services",
      "Build and maintain RESTful and GraphQL APIs",
      "Optimize database queries and improve performance",
      "Implement microservices architecture",
      "Ensure system reliability and scalability",
      "Collaborate with frontend teams on API integration",
      "Write comprehensive tests and documentation",
      "Participate in code reviews and technical discussions",
      "Monitor and troubleshoot production systems",
      "Contribute to architecture and design decisions",
    ],
    benefits: [
      "Competitive salary: $100,000 - $140,000 annually",
      "Health, dental, and vision insurance",
      "401(k) matching up to 6%",
      "Hybrid work model (3 days in office)",
      "Flexible PTO policy",
      "Professional development budget",
      "Stock options",
      "Commuter benefits",
      "Gym membership reimbursement",
    ],
    salary: {
      min: 100000,
      max: 140000,
      currency: "USD",
    },
    experience: {
      min: 4,
      max: 7,
      unit: "years",
    },
    skills: [
      "Python",
      "Java",
      "Go",
      "Node.js",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Docker",
      "Kubernetes",
      "AWS",
      "GraphQL",
      "REST APIs",
      "Microservices",
    ],
    department: "Engineering",
    remote: false,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
    experienceDetails: {},
    education: {},
    postedDate: new Date("2024-01-25"),
    summary: "Build robust and scalable backend systems that power our platform.",
  },
  {
    id: "ds-2024-004",
    title: "Data Scientist",
    company: "TechFlow Solutions",
    location: "Seattle, WA (Hybrid)",
    type: "Full-time",
    requirements: [
      "Master's degree in Data Science, Statistics, or related field",
      "3+ years of experience in data science or machine learning",
      "Strong proficiency in Python and R",
      "Experience with machine learning frameworks (TensorFlow, PyTorch)",
      "Knowledge of statistical analysis and modeling",
      "Experience with data visualization tools",
      "Familiarity with SQL and database systems",
      "Strong analytical and problem-solving skills",
      "Experience with cloud ML platforms",
      "Excellent communication skills",
    ],
    responsibilities: [
      "Develop and deploy machine learning models",
      "Analyze large datasets to extract insights",
      "Collaborate with cross-functional teams on data-driven solutions",
      "Create data visualizations and reports",
      "Build and maintain data pipelines",
      "Conduct statistical analysis and A/B testing",
      "Stay current with ML/AI research and trends",
      "Present findings to stakeholders",
      "Optimize model performance and accuracy",
    ],
    benefits: [
      "Competitive salary: $110,000 - $150,000 annually",
      "Comprehensive health benefits",
      "401(k) matching",
      "Hybrid work model",
      "Research and conference budget",
      "Access to cutting-edge ML tools",
      "Professional development opportunities",
    ],
    salary: {
      min: 110000,
      max: 150000,
      currency: "USD",
    },
    experience: {
      min: 3,
      max: 6,
      unit: "years",
    },
    skills: [
      "Python",
      "R",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "Data Visualization",
      "Machine Learning",
      "Statistics",
    ],
    department: "Data Science",
    remote: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    experienceDetails: {},
    education: {},
    postedDate: new Date("2024-02-01"),
    summary: "Transform data into actionable insights that drive business decisions.",
  },
];

// Helper function to get job by ID
export const getJobById = (id: string): JobDescription | undefined => {
  return jobs.find((job) => job.id === id);
};

// Helper function to get all jobs
export const getAllJobs = (): JobDescription[] => {
  return jobs;
};

// Helper function to filter jobs
export const filterJobs = (filters: {
  location?: string;
  type?: string;
  department?: string;
  remote?: boolean;
}): JobDescription[] => {
  return jobs.filter((job) => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.type && job.type !== filters.type) {
      return false;
    }
    if (filters.department && job.department !== filters.department) {
      return false;
    }
    if (filters.remote !== undefined && job.remote !== filters.remote) {
      return false;
    }
    return true;
  });
};

