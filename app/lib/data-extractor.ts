import { CandidateProfile, SkillLevel, JobDescription } from "./types";
import { Logger } from "./logger";

export interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  experience?: number;
  skills?: string[];
  education?: string;
  salaryExpectation?: string;
  location?: string;
  availability?: string;
  interests?: string[];
  [key: string]: any;
}

export interface ExtractionResult {
  data: ExtractedData;
  confidence: number;
  extractionMethod: string;
  timestamp: Date;
  source: string;
}

export interface ExtractionPattern {
  name: string;
  pattern: RegExp;
  confidence: number;
  transform?: (match: RegExpMatchArray) => any;
  validation?: (value: any) => boolean;
}

export interface SkillMatch {
  skill: string;
  confidence: number;
  level: SkillLevel;
  context: string;
  relevance: number;
}

export class DataExtractor {
  private logger: Logger;
  private patterns: ExtractionPattern[];
  private skillKeywords: Map<string, string[]>;
  private educationKeywords: Map<string, string[]>;
  private locationKeywords: Map<string, string[]>;

  constructor() {
    this.logger = Logger.getInstance();
    this.patterns = this.initializeExtractionPatterns();
    this.skillKeywords = this.initializeSkillKeywords();
    this.educationKeywords = this.initializeEducationKeywords();
    this.locationKeywords = this.initializeLocationKeywords();

    this.logger.info("DataExtractor initialized with extraction patterns");
  }

  /**
   * Extract candidate information from conversation text
   */
  async extractCandidateInfo(conversationText: string): Promise<ExtractedData> {
    const startTime = Date.now();

    try {
      this.logger.debug("Starting information extraction", {
        textLength: conversationText.length,
        hasUrls: /https?:\/\/[^\s]+/.test(conversationText),
        hasEmails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          conversationText
        ),
      });

      const extractedData: ExtractedData = {};

      // Extract basic information using regex patterns
      const basicInfo = this.extractBasicInformation(conversationText);
      Object.assign(extractedData, basicInfo);

      // Extract skills using NLP-based detection
      const skills = await this.extractSkills(conversationText);
      if (skills.length > 0) {
        extractedData.skills = skills.map((skill) => skill.skill);
      }

      // Extract education information
      const education = this.extractEducation(conversationText);
      if (education) {
        extractedData.education = education;
      }

      // Extract location and availability
      const location = this.extractLocation(conversationText);
      if (location) {
        extractedData.location = location;
      }

      const availability = this.extractAvailability(conversationText);
      if (availability) {
        extractedData.availability = availability;
      }

      // Extract interests and motivations
      const interests = this.extractInterests(conversationText);
      if (interests.length > 0) {
        extractedData.interests = interests;
      }

      // Post-process and validate extracted data
      const processedData = this.postProcessExtractedData(extractedData);

      const processingTime = Date.now() - startTime;
      this.logger.info("Information extraction completed", {
        processingTime,
        extractedFields: Object.keys(processedData).length,
        confidence: this.calculateOverallConfidence(processedData),
      });

      return processedData;
    } catch (error) {
      this.logger.error("Error during information extraction", {
        error,
        conversationText,
      });
      return {};
    }
  }

  /**
   * Initialize extraction patterns for different data types
   */
  private initializeExtractionPatterns(): ExtractionPattern[] {
    return [
      // Name patterns
      {
        name: "fullName",
        pattern:
          /\b(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        confidence: 0.9,
        transform: (match) => match[1].trim(),
        validation: (value) => value.length > 2 && value.split(" ").length >= 2,
      },
      {
        name: "firstName",
        pattern: /\b(?:i'm|i am)\s+([A-Z][a-z]+)/i,
        confidence: 0.7,
        transform: (match) => match[1].trim(),
        validation: (value) => value.length > 1,
      },

      // Email patterns
      {
        name: "email",
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
        confidence: 0.95,
        transform: (match) => match[0].toLowerCase(),
        validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      },

      // Phone patterns
      {
        name: "phone",
        pattern:
          /\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/,
        confidence: 0.9,
        transform: (match) => `(${match[1]}) ${match[2]}-${match[3]}`,
        validation: (value) => /^\(\d{3}\)\s\d{3}-\d{4}$/.test(value),
      },

      // Experience patterns
      {
        name: "experience",
        pattern:
          /\b(?:i have|i've been|worked for|experience of)\s+(\d+(?:\.\d+)?)\s+(?:years?|yrs?)\b/i,
        confidence: 0.85,
        transform: (match) => parseFloat(match[1]),
        validation: (value) =>
          typeof value === "number" && value >= 0 && value <= 50,
      },
      {
        name: "experienceRange",
        pattern:
          /\b(?:experience|worked)\s+(?:of|for)\s+(\d+)-(\d+)\s+(?:years?|yrs?)\b/i,
        confidence: 0.8,
        transform: (match) =>
          Math.round((parseInt(match[1]) + parseInt(match[2])) / 2),
        validation: (value) =>
          typeof value === "number" && value >= 0 && value <= 50,
      },

      // Salary patterns
      {
        name: "salaryExpectation",
        pattern:
          /\b(?:salary|pay|compensation)\s+(?:expectation|range|requirement)?\s*(?:of|is|around)?\s*\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\b/i,
        confidence: 0.8,
        transform: (match) => match[1],
        validation: (value) => value.length > 0,
      },
      {
        name: "salaryRange",
        pattern:
          /\b(?:salary|pay)\s+(?:range|expectation)?\s*\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*-\s*\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\b/i,
        confidence: 0.75,
        transform: (match) => `${match[1]}-${match[2]}`,
        validation: (value) => value.includes("-"),
      },

      // Location patterns
      {
        name: "location",
        pattern:
          /\b(?:i'm in|i live in|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i,
        confidence: 0.8,
        transform: (match) => match[1].trim(),
        validation: (value) => value.length > 2,
      },

      // Availability patterns
      {
        name: "availability",
        pattern:
          /\b(?:available|start|begin|ready)\s+(?:to|for)?\s+(?:immediately|asap|next month|in \d+ weeks?)\b/i,
        confidence: 0.85,
        transform: (match) => match[0].trim(),
        validation: (value) => value.length > 0,
      },
    ];
  }

  /**
   * Initialize skill keywords for NLP-based detection
   */
  private initializeSkillKeywords(): Map<string, string[]> {
    const skillMap = new Map<string, string[]>();

    // Programming Languages
    skillMap.set("JavaScript", [
      "javascript",
      "js",
      "ecmascript",
      "es6",
      "es2015",
    ]);
    skillMap.set("TypeScript", ["typescript", "ts", "typed javascript"]);
    skillMap.set("Python", ["python", "py", "python3", "python2"]);
    skillMap.set("Java", ["java", "jdk", "jre", "jvm"]);
    skillMap.set("C#", ["c#", "csharp", ".net", "dotnet"]);
    skillMap.set("C++", ["c++", "cpp", "c plus plus"]);
    skillMap.set("Go", ["go", "golang"]);
    skillMap.set("Rust", ["rust", "rustlang"]);
    skillMap.set("PHP", ["php", "hypertext preprocessor"]);
    skillMap.set("Ruby", ["ruby", "ruby on rails", "rails"]);

    // Frameworks and Libraries
    skillMap.set("React", ["react", "reactjs", "react.js", "facebook react"]);
    skillMap.set("Vue.js", ["vue", "vuejs", "vue.js", "vue 3"]);
    skillMap.set("Angular", ["angular", "angularjs", "angular.js"]);
    skillMap.set("Node.js", ["node", "nodejs", "node.js", "express"]);
    skillMap.set("Express.js", ["express", "expressjs", "express.js"]);
    skillMap.set("Next.js", ["next", "nextjs", "next.js", "nextjs 13"]);
    skillMap.set("Django", ["django", "python django"]);
    skillMap.set("Flask", ["flask", "python flask"]);
    skillMap.set("Spring", ["spring", "spring boot", "spring framework"]);
    skillMap.set("Laravel", ["laravel", "php laravel"]);

    // Databases
    skillMap.set("PostgreSQL", ["postgresql", "postgres", "psql"]);
    skillMap.set("MySQL", ["mysql", "mariadb"]);
    skillMap.set("MongoDB", ["mongodb", "mongo", "nosql"]);
    skillMap.set("Redis", ["redis", "cache", "key-value store"]);
    skillMap.set("SQLite", ["sqlite", "sqlite3"]);

    // Cloud and DevOps
    skillMap.set("AWS", ["aws", "amazon web services", "ec2", "s3", "lambda"]);
    skillMap.set("Azure", ["azure", "microsoft azure", "cloud services"]);
    skillMap.set("GCP", ["gcp", "google cloud", "google cloud platform"]);
    skillMap.set("Docker", ["docker", "containerization", "containers"]);
    skillMap.set("Kubernetes", [
      "kubernetes",
      "k8s",
      "container orchestration",
    ]);
    skillMap.set("CI/CD", [
      "ci/cd",
      "continuous integration",
      "continuous deployment",
      "jenkins",
      "github actions",
    ]);

    // Tools and Technologies
    skillMap.set("Git", [
      "git",
      "version control",
      "github",
      "gitlab",
      "bitbucket",
    ]);
    skillMap.set("Linux", ["linux", "unix", "ubuntu", "centos", "debian"]);
    skillMap.set("REST API", ["rest", "rest api", "api design", "http api"]);
    skillMap.set("GraphQL", ["graphql", "api query language"]);
    skillMap.set("Microservices", [
      "microservices",
      "microservice architecture",
      "service-oriented",
    ]);

    return skillMap;
  }

  /**
   * Initialize education keywords
   */
  private initializeEducationKeywords(): Map<string, string[]> {
    const educationMap = new Map<string, string[]>();

    // Degrees
    educationMap.set("Bachelor's", [
      "bachelor",
      "bachelor's",
      "bachelors",
      "bs",
      "ba",
      "b.s.",
      "b.a.",
    ]);
    educationMap.set("Master's", [
      "master",
      "master's",
      "masters",
      "ms",
      "ma",
      "m.s.",
      "m.a.",
    ]);
    educationMap.set("PhD", [
      "phd",
      "doctorate",
      "doctor of philosophy",
      "ph.d.",
    ]);
    educationMap.set("Associate's", [
      "associate",
      "associate's",
      "associates",
      "aa",
      "as",
      "a.a.",
      "a.s.",
    ]);

    // Fields of Study
    educationMap.set("Computer Science", [
      "computer science",
      "cs",
      "computing",
      "software engineering",
    ]);
    educationMap.set("Information Technology", [
      "it",
      "information technology",
      "information systems",
    ]);
    educationMap.set("Engineering", [
      "engineering",
      "software engineering",
      "computer engineering",
    ]);
    educationMap.set("Mathematics", [
      "mathematics",
      "math",
      "applied mathematics",
    ]);
    educationMap.set("Physics", ["physics", "applied physics"]);

    return educationMap;
  }

  /**
   * Initialize location keywords
   */
  private initializeLocationKeywords(): Map<string, string[]> {
    const locationMap = new Map<string, string[]>();

    // Major Cities
    locationMap.set("New York", [
      "new york",
      "nyc",
      "manhattan",
      "brooklyn",
      "queens",
    ]);
    locationMap.set("San Francisco", [
      "san francisco",
      "sf",
      "bay area",
      "silicon valley",
    ]);
    locationMap.set("Los Angeles", [
      "los angeles",
      "la",
      "hollywood",
      "santa monica",
    ]);
    locationMap.set("Chicago", ["chicago", "windy city", "illinois"]);
    locationMap.set("Seattle", ["seattle", "pacific northwest", "washington"]);
    locationMap.set("Austin", ["austin", "texas", "atx"]);
    locationMap.set("Boston", ["boston", "massachusetts", "cambridge"]);
    locationMap.set("Denver", ["denver", "colorado", "mile high city"]);

    // Remote/Relocation
    locationMap.set("Remote", [
      "remote",
      "work from home",
      "wfh",
      "telecommute",
      "virtual",
    ]);
    locationMap.set("Relocation", [
      "relocation",
      "relocate",
      "willing to move",
      "open to relocation",
    ]);

    return locationMap;
  }

  /**
   * Extract basic information using regex patterns
   */
  private extractBasicInformation(text: string): ExtractedData {
    const extractedData: ExtractedData = {};

    for (const pattern of this.patterns) {
      const matches = text.match(pattern.pattern);
      if (matches) {
        try {
          let value = pattern.transform
            ? pattern.transform(matches)
            : matches[0];

          // Validate the extracted value
          if (pattern.validation && pattern.validation(value)) {
            extractedData[pattern.name] = value;
            this.logger.debug(`Extracted ${pattern.name}`, {
              value,
              confidence: pattern.confidence,
            });
          }
        } catch (error) {
          this.logger.warn(`Error processing pattern ${pattern.name}`, {
            error,
            matches,
          });
        }
      }
    }

    return extractedData;
  }

  /**
   * Extract skills using NLP-based detection
   */
  private async extractSkills(text: string): Promise<SkillMatch[]> {
    const skillMatches: SkillMatch[] = [];
    const lowerText = text.toLowerCase();

    for (const [skillName, keywords] of this.skillKeywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          // Calculate confidence based on context
          const confidence = this.calculateSkillConfidence(
            text,
            keyword,
            skillName
          );

          // Determine skill level based on context
          const level = this.determineSkillLevel(text, keyword);

          // Calculate relevance score
          const relevance = this.calculateSkillRelevance(text, keyword);

          if (confidence > 0.3) {
            // Only include skills with reasonable confidence
            skillMatches.push({
              skill: skillName,
              confidence,
              level,
              context: this.extractSkillContext(text, keyword),
              relevance,
            });
          }
        }
      }
    }

    // Sort by confidence and relevance
    skillMatches.sort((a, b) => {
      const scoreA = a.confidence * 0.7 + a.relevance * 0.3;
      const scoreB = b.confidence * 0.7 + b.relevance * 0.3;
      return scoreB - scoreA;
    });

    // Remove duplicates and keep highest confidence
    const uniqueSkills = new Map<string, SkillMatch>();
    for (const match of skillMatches) {
      if (
        !uniqueSkills.has(match.skill) ||
        uniqueSkills.get(match.skill)!.confidence < match.confidence
      ) {
        uniqueSkills.set(match.skill, match);
      }
    }

    return Array.from(uniqueSkills.values());
  }

  /**
   * Calculate confidence for skill extraction
   */
  private calculateSkillConfidence(
    text: string,
    keyword: string,
    skillName: string
  ): number {
    let confidence = 0.5; // Base confidence

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Boost confidence for exact matches
    if (lowerText.includes(lowerKeyword)) {
      confidence += 0.2;
    }

    // Boost confidence for skill-specific context
    if (
      lowerText.includes("experience with") ||
      lowerText.includes("worked with") ||
      lowerText.includes("proficient in")
    ) {
      confidence += 0.15;
    }

    // Boost confidence for years of experience
    const yearPattern = new RegExp(
      `(\\d+)\\s*(?:years?|yrs?)\\s*(?:of\\s+)?(?:experience\\s+with\\s+)?${lowerKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}`,
      "i"
    );
    if (yearPattern.test(text)) {
      confidence += 0.2;
    }

    // Boost confidence for project mentions
    if (
      lowerText.includes("project") ||
      lowerText.includes("built") ||
      lowerText.includes("developed")
    ) {
      confidence += 0.1;
    }

    // Reduce confidence for generic mentions
    if (
      lowerText.includes("heard of") ||
      lowerText.includes("interested in") ||
      lowerText.includes("want to learn")
    ) {
      confidence -= 0.2;
    }

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Determine skill level based on context
   */
  private determineSkillLevel(text: string, keyword: string): SkillLevel {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Expert level indicators
    if (
      lowerText.includes("expert") ||
      lowerText.includes("senior") ||
      lowerText.includes("lead") ||
      lowerText.includes("architect") ||
      lowerText.includes("principal")
    ) {
      return "expert";
    }

    // Advanced level indicators
    if (
      lowerText.includes("advanced") ||
      lowerText.includes("proficient") ||
      lowerText.includes("strong") ||
      lowerText.includes("extensive") ||
      lowerText.includes("deep")
    ) {
      return "advanced";
    }

    // Intermediate level indicators
    if (
      lowerText.includes("intermediate") ||
      lowerText.includes("moderate") ||
      lowerText.includes("some") ||
      lowerText.includes("familiar") ||
      lowerText.includes("comfortable")
    ) {
      return "intermediate";
    }

    // Beginner level indicators
    if (
      lowerText.includes("beginner") ||
      lowerText.includes("basic") ||
      lowerText.includes("learning") ||
      lowerText.includes("new to") ||
      lowerText.includes("just started")
    ) {
      return "beginner";
    }

    // Default to intermediate if no clear indicators
    return "intermediate";
  }

  /**
   * Calculate skill relevance score
   */
  private calculateSkillRelevance(text: string, keyword: string): number {
    let relevance = 0.5; // Base relevance

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Boost relevance for job-related context
    if (
      lowerText.includes("job") ||
      lowerText.includes("position") ||
      lowerText.includes("role") ||
      lowerText.includes("career") ||
      lowerText.includes("professional")
    ) {
      relevance += 0.2;
    }

    // Boost relevance for technical discussions
    if (
      lowerText.includes("technical") ||
      lowerText.includes("development") ||
      lowerText.includes("coding") ||
      lowerText.includes("programming") ||
      lowerText.includes("software")
    ) {
      relevance += 0.15;
    }

    // Boost relevance for experience discussions
    if (
      lowerText.includes("experience") ||
      lowerText.includes("background") ||
      lowerText.includes("skills") ||
      lowerText.includes("qualifications") ||
      lowerText.includes("expertise")
    ) {
      relevance += 0.15;
    }

    return Math.min(1.0, Math.max(0.0, relevance));
  }

  /**
   * Extract context around skill mention
   */
  private extractSkillContext(text: string, keyword: string): string {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return "";

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    return text.substring(start, end).trim();
  }

  /**
   * Extract education information
   */
  private extractEducation(text: string): string | undefined {
    const lowerText = text.toLowerCase();

    for (const [degree, keywords] of this.educationKeywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          // Look for field of study
          for (const [field, fieldKeywords] of this.educationKeywords) {
            if (field !== degree) {
              // Skip degree keywords
              for (const fieldKeyword of fieldKeywords) {
                if (lowerText.includes(fieldKeyword.toLowerCase())) {
                  return `${degree} in ${field}`;
                }
              }
            }
          }

          // Return just the degree if no field found
          return degree;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract location information
   */
  private extractLocation(text: string): string | undefined {
    const lowerText = text.toLowerCase();

    for (const [location, keywords] of this.locationKeywords) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return location;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract availability information
   */
  private extractAvailability(text: string): string | undefined {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("immediately") || lowerText.includes("asap")) {
      return "Immediately";
    } else if (
      lowerText.includes("next month") ||
      lowerText.includes("in 4 weeks")
    ) {
      return "Next month";
    } else if (lowerText.includes("in 2 weeks")) {
      return "In 2 weeks";
    } else if (
      lowerText.includes("notice period") ||
      lowerText.includes("2 weeks notice")
    ) {
      return "2 weeks notice";
    } else if (
      lowerText.includes("flexible") ||
      lowerText.includes("open to discussion")
    ) {
      return "Flexible";
    }

    return undefined;
  }

  /**
   * Extract interests and motivations
   */
  private extractInterests(text: string): string[] {
    const interests: string[] = [];
    const lowerText = text.toLowerCase();

    // Career interests
    if (
      lowerText.includes("career growth") ||
      lowerText.includes("advancement")
    ) {
      interests.push("Career Growth");
    }
    if (lowerText.includes("learning") || lowerText.includes("development")) {
      interests.push("Learning & Development");
    }
    if (lowerText.includes("challenge") || lowerText.includes("challenging")) {
      interests.push("Challenging Work");
    }
    if (
      lowerText.includes("innovation") ||
      lowerText.includes("cutting edge")
    ) {
      interests.push("Innovation");
    }
    if (lowerText.includes("team") || lowerText.includes("collaboration")) {
      interests.push("Team Collaboration");
    }
    if (lowerText.includes("remote") || lowerText.includes("flexibility")) {
      interests.push("Remote Work");
    }
    if (lowerText.includes("startup") || lowerText.includes("fast-paced")) {
      interests.push("Startup Environment");
    }
    if (lowerText.includes("stability") || lowerText.includes("established")) {
      interests.push("Company Stability");
    }

    return interests;
  }

  /**
   * Post-process extracted data for consistency and validation
   */
  private postProcessExtractedData(data: ExtractedData): ExtractedData {
    const processed = { ...data };

    // Normalize name
    if (processed.name) {
      processed.name = processed.name.replace(/\s+/g, " ").trim();
    }

    // Normalize email
    if (processed.email) {
      processed.email = processed.email.toLowerCase().trim();
    }

    // Normalize phone
    if (processed.phone) {
      // Ensure consistent phone format
      const phoneMatch = processed.phone.match(/\d/g);
      if (phoneMatch && phoneMatch.length === 10) {
        processed.phone = `(${phoneMatch.slice(0, 3).join("")}) ${phoneMatch
          .slice(3, 6)
          .join("")}-${phoneMatch.slice(6).join("")}`;
      }
    }

    // Normalize experience
    if (processed.experience && typeof processed.experience === "number") {
      processed.experience = Math.round(processed.experience * 10) / 10; // Round to 1 decimal place
    }

    // Normalize skills
    if (processed.skills && Array.isArray(processed.skills)) {
      processed.skills = processed.skills
        .filter((skill) => skill && skill.trim().length > 0)
        .map((skill) => skill.trim())
        .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates
    }

    // Normalize location
    if (processed.location) {
      processed.location = processed.location.replace(/\s+/g, " ").trim();
    }

    return processed;
  }

  /**
   * Calculate overall confidence for extracted data
   */
  private calculateOverallConfidence(data: ExtractedData): number {
    if (Object.keys(data).length === 0) return 0;

    let totalConfidence = 0;
    let fieldCount = 0;

    // Base confidence for each field type
    const fieldConfidences: Record<string, number> = {
      name: 0.8,
      email: 0.95,
      phone: 0.9,
      experience: 0.85,
      skills: 0.75,
      education: 0.8,
      salaryExpectation: 0.8,
      location: 0.8,
      availability: 0.85,
      interests: 0.7,
    };

    for (const [field, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        const baseConfidence = fieldConfidences[field] || 0.7;

        // Adjust confidence based on value quality
        let adjustedConfidence = baseConfidence;

        if (typeof value === "string") {
          if (value.length === 0) adjustedConfidence *= 0.5;
          else if (value.length > 50) adjustedConfidence *= 1.1;
        } else if (Array.isArray(value)) {
          if (value.length === 0) adjustedConfidence *= 0.5;
          else if (value.length > 5) adjustedConfidence *= 1.1;
        }

        totalConfidence += adjustedConfidence;
        fieldCount++;
      }
    }

    return fieldCount > 0 ? totalConfidence / fieldCount : 0;
  }

  /**
   * Get extraction statistics
   */
  getExtractionStats(): {
    totalPatterns: number;
    skillKeywords: number;
    educationKeywords: number;
    locationKeywords: number;
  } {
    return {
      totalPatterns: this.patterns.length,
      skillKeywords: this.skillKeywords.size,
      educationKeywords: this.educationKeywords.size,
      locationKeywords: this.locationKeywords.size,
    };
  }

  /**
   * Add custom extraction pattern
   */
  addCustomPattern(pattern: ExtractionPattern): void {
    this.patterns.push(pattern);
    this.logger.info("Custom extraction pattern added", {
      patternName: pattern.name,
    });
  }

  /**
   * Add custom skill keyword
   */
  addCustomSkill(skillName: string, keywords: string[]): void {
    this.skillKeywords.set(skillName, keywords);
    this.logger.info("Custom skill added", { skillName, keywords });
  }

  /**
   * Test extraction with sample text
   */
  async testExtraction(
    sampleText: string
  ): Promise<{ data: ExtractedData; confidence: number; patterns: string[] }> {
    const data = await this.extractCandidateInfo(sampleText);
    const confidence = this.calculateOverallConfidence(data);
    const patterns = this.patterns.map((p) => p.name);

    return { data, confidence, patterns };
  }
}
