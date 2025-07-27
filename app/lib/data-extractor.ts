import { ChatMessage, CandidateProfile, SkillLevel } from "./types";

// ============================================================================
// DATA EXTRACTOR CLASS
// ============================================================================

export class DataExtractor {
  private extractionPatterns: Map<string, RegExp[]>;
  private confidenceThreshold: number = 0.7;

  constructor() {
    this.extractionPatterns = this.initializeExtractionPatterns();
  }

  // ========================================================================
  // MAIN EXTRACTION METHOD
  // ========================================================================

  async extractCandidateInfo(
    conversationHistory: ChatMessage[]
  ): Promise<Partial<CandidateProfile>> {
    try {
      const extractedInfo: Partial<CandidateProfile> = {};
      const fullText = this.concatenateConversation(conversationHistory);

      // Extract basic information
      extractedInfo.name = this.extractName(fullText);
      extractedInfo.email = this.extractEmail(fullText);
      extractedInfo.phone = this.extractPhone(fullText);

      // Extract experience information
      extractedInfo.experience = this.extractExperience(fullText);

      // Extract skills
      extractedInfo.skills = this.extractSkills(fullText);

      // Extract education
      extractedInfo.education = this.extractEducation(fullText);

      // Extract salary information
      extractedInfo.salary = this.extractSalary(fullText);

      // Extract location information
      extractedInfo.location = this.extractLocation(fullText);

      // Extract availability
      extractedInfo.availability = this.extractAvailability(fullText);

      // Extract interests
      extractedInfo.interests = this.extractInterests(fullText);

      // Calculate confidence score
      extractedInfo.confidence =
        this.calculateExtractionConfidence(extractedInfo);

      return extractedInfo;
    } catch (error) {
      console.error("Error extracting candidate information:", error);
      return {};
    }
  }

  // ========================================================================
  // PATTERN INITIALIZATION
  // ========================================================================

  private initializeExtractionPatterns(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    // Name patterns
    patterns.set("name", [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /(\w+) is my name/i,
    ]);

    // Email patterns
    patterns.set("email", [
      /[\w.-]+@[\w.-]+\.\w+/g,
      /email[:\s]*([\w.-]+@[\w.-]+\.\w+)/i,
      /my email is ([\w.-]+@[\w.-]+\.\w+)/i,
    ]);

    // Phone patterns
    patterns.set("phone", [
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g,
      /phone[:\s]*(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /my phone is (\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
    ]);

    // Experience patterns
    patterns.set("experience", [
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i,
      /(\d+)\s*(?:months?|mos?)\s*(?:of\s*)?experience/i,
      /experience[:\s]*(\d+)\s*(?:years?|months?)/i,
      /worked for (\d+)\s*(?:years?|months?)/i,
    ]);

    // Skills patterns
    patterns.set("skills", [
      /(?:skills?|technologies?|languages?)[:\s]*([^.!?]+)/i,
      /i know ([\w\s,]+)/i,
      /proficient in ([\w\s,]+)/i,
      /experience with ([\w\s,]+)/i,
    ]);

    // Salary patterns
    patterns.set("salary", [
      /(\d{1,3}(?:,\d{3})*)\s*(?:dollars?|usd|\$)/i,
      /salary[:\s]*(\d{1,3}(?:,\d{3})*)/i,
      /expecting (\d{1,3}(?:,\d{3})*)/i,
      /looking for (\d{1,3}(?:,\d{3})*)/i,
    ]);

    // Location patterns
    patterns.set("location", [
      /(?:live in|based in|located in)\s*([^.!?]+)/i,
      /from\s*([^.!?]+)/i,
      /location[:\s]*([^.!?]+)/i,
    ]);

    return patterns;
  }

  // ========================================================================
  // TEXT CONCATENATION
  // ========================================================================

  private concatenateConversation(conversationHistory: ChatMessage[]): string {
    return conversationHistory
      .map((message) => message.content)
      .join(" ")
      .toLowerCase();
  }

  // ========================================================================
  // EXTRACTION METHODS
  // ========================================================================

  private extractName(text: string): string | undefined {
    const patterns = this.extractionPatterns.get("name") || [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return this.capitalizeFirstLetter(match[1]);
      }
    }

    return undefined;
  }

  private extractEmail(text: string): string | undefined {
    const patterns = this.extractionPatterns.get("email") || [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }

    return undefined;
  }

  private extractPhone(text: string): string | undefined {
    const patterns = this.extractionPatterns.get("phone") || [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/[-.\s]/g, "");
      }
    }

    return undefined;
  }

  private extractExperience(text: string): CandidateProfile["experience"] {
    const patterns = this.extractionPatterns.get("experience") || [];
    let years = 0;
    let months = 0;
    let description = "";

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1]);
        if (pattern.source.includes("month")) {
          months = value;
        } else {
          years = value;
        }
      }
    }

    // Extract description
    const experienceDescMatch = text.match(/experience[:\s]*([^.!?]+)/i);
    if (experienceDescMatch && experienceDescMatch[1]) {
      description = experienceDescMatch[1].trim();
    }

    return {
      years,
      months,
      description: description || undefined,
    };
  }

  private extractSkills(text: string): CandidateProfile["skills"] {
    const patterns = this.extractionPatterns.get("skills") || [];
    const skills: CandidateProfile["skills"] = [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const skillList = match[1]
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0);

        skillList.forEach((skill) => {
          const level = this.determineSkillLevel(skill, text);
          const confidence = this.calculateSkillConfidence(skill, text);

          skills.push({
            name: skill,
            level,
            confidence,
          });
        });
      }
    }

    return skills;
  }

  private extractEducation(text: string): CandidateProfile["education"] {
    const education: CandidateProfile["education"] = [];

    // Extract degree
    const degreeMatch = text.match(
      /(?:degree|bachelor|master|phd|diploma)[:\s]*([^.!?]+)/i
    );
    if (degreeMatch && degreeMatch[1]) {
      const degree = degreeMatch[1].trim();

      // Extract institution
      const institutionMatch = text.match(
        /(?:from|at|university|college)[:\s]*([^.!?]+)/i
      );
      const institution = institutionMatch ? institutionMatch[1].trim() : "";

      // Extract graduation year
      const yearMatch = text.match(
        /(?:graduated|completed|finished)[:\s]*(\d{4})/i
      );
      const graduationYear = yearMatch ? parseInt(yearMatch[1]) : undefined;

      education.push({
        degree,
        institution,
        graduationYear,
      });
    }

    return education;
  }

  private extractSalary(text: string): CandidateProfile["salary"] {
    const patterns = this.extractionPatterns.get("salary") || [];
    let expected = 0;
    let currency = "USD";
    let negotiable = true;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        expected = parseInt(match[1].replace(/,/g, ""));
        break;
      }
    }

    // Determine if negotiable
    if (text.includes("negotiable") || text.includes("flexible")) {
      negotiable = true;
    } else if (text.includes("fixed") || text.includes("non-negotiable")) {
      negotiable = false;
    }

    return {
      expected,
      currency,
      negotiable,
    };
  }

  private extractLocation(text: string): CandidateProfile["location"] {
    const patterns = this.extractionPatterns.get("location") || [];
    let current = "";
    let willingToRelocate = false;
    const preferredLocations: string[] = [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        current = match[1].trim();
        break;
      }
    }

    // Determine relocation willingness
    if (
      text.includes("willing to relocate") ||
      text.includes("open to relocation")
    ) {
      willingToRelocate = true;
    } else if (
      text.includes("not willing to relocate") ||
      text.includes("remote only")
    ) {
      willingToRelocate = false;
    }

    // Extract preferred locations
    const locationMatch = text.match(
      /(?:prefer|interested in|looking at)[:\s]*([^.!?]+)/i
    );
    if (locationMatch && locationMatch[1]) {
      const locations = locationMatch[1]
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0);
      preferredLocations.push(...locations);
    }

    return {
      current,
      willingToRelocate,
      preferredLocations:
        preferredLocations.length > 0 ? preferredLocations : undefined,
    };
  }

  private extractAvailability(text: string): CandidateProfile["availability"] {
    let startDate: Date | undefined;
    let noticePeriod: number | undefined;
    let preferredSchedule: "Full-time" | "Part-time" | "Flexible" | undefined;

    // Extract start date
    const dateMatch = text.match(
      /(?:available|start|begin)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i
    );
    if (dateMatch && dateMatch[1]) {
      startDate = new Date(dateMatch[1]);
    }

    // Extract notice period
    const noticeMatch = text.match(/(\d+)\s*(?:weeks?|days?)\s*notice/i);
    if (noticeMatch && noticeMatch[1]) {
      noticePeriod = parseInt(noticeMatch[1]);
    }

    // Determine preferred schedule
    if (text.includes("full-time") || text.includes("full time")) {
      preferredSchedule = "Full-time";
    } else if (text.includes("part-time") || text.includes("part time")) {
      preferredSchedule = "Part-time";
    } else if (text.includes("flexible") || text.includes("flexible hours")) {
      preferredSchedule = "Flexible";
    }

    return {
      startDate,
      noticePeriod,
      preferredSchedule,
    };
  }

  private extractInterests(text: string): string[] {
    const interests: string[] = [];

    // Extract interests from conversation
    const interestMatch = text.match(
      /(?:interested in|passionate about|enjoy)[:\s]*([^.!?]+)/i
    );
    if (interestMatch && interestMatch[1]) {
      const interestList = interestMatch[1]
        .split(",")
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0);
      interests.push(...interestList);
    }

    return interests;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private determineSkillLevel(skill: string, text: string): SkillLevel {
    const skillText = text.toLowerCase();

    if (skillText.includes("expert") || skillText.includes("advanced")) {
      return "Expert";
    } else if (
      skillText.includes("intermediate") ||
      skillText.includes("proficient")
    ) {
      return "Intermediate";
    } else if (skillText.includes("beginner") || skillText.includes("basic")) {
      return "Beginner";
    } else {
      return "Intermediate"; // Default
    }
  }

  private calculateSkillConfidence(skill: string, text: string): number {
    // Simple confidence calculation based on skill mention frequency
    const skillMentions = (text.match(new RegExp(skill, "gi")) || []).length;
    return Math.min(skillMentions * 0.3, 1);
  }

  private calculateExtractionConfidence(
    extractedInfo: Partial<CandidateProfile>
  ): number {
    let confidence = 0;
    let totalFactors = 0;

    // Factor 1: Basic information (30%)
    if (extractedInfo.name) confidence += 0.1;
    if (extractedInfo.email) confidence += 0.1;
    if (extractedInfo.phone) confidence += 0.1;
    totalFactors += 0.3;

    // Factor 2: Experience information (25%)
    if (
      extractedInfo.experience &&
      (extractedInfo.experience.years > 0 ||
        extractedInfo.experience.months > 0)
    ) {
      confidence += 0.25;
    }
    totalFactors += 0.25;

    // Factor 3: Skills information (25%)
    if (extractedInfo.skills && extractedInfo.skills.length > 0) {
      confidence += 0.25;
    }
    totalFactors += 0.25;

    // Factor 4: Additional information (20%)
    if (extractedInfo.education && extractedInfo.education.length > 0)
      confidence += 0.1;
    if (extractedInfo.salary && extractedInfo.salary.expected > 0)
      confidence += 0.1;
    totalFactors += 0.2;

    return totalFactors > 0 ? confidence / totalFactors : 0;
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ========================================================================
  // PUBLIC UTILITY METHODS
  // ========================================================================

  getExtractionConfidence(): number {
    return this.confidenceThreshold;
  }

  setExtractionConfidence(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  validateExtractedInfo(extractedInfo: Partial<CandidateProfile>): boolean {
    return (
      this.calculateExtractionConfidence(extractedInfo) >=
      this.confidenceThreshold
    );
  }
}
