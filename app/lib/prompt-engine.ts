import {
  JobDescription,
  CandidateProfile,
  ConversationStage,
  ChatMessage,
  SkillLevel,
} from "./types";
import { Logger } from "./logger";

export interface PromptContext {
  jobDescription: JobDescription;
  candidateProfile?: CandidateProfile;
  conversationStage: ConversationStage;
  conversationHistory: ChatMessage[];
  extractedInfo: Record<string, any>;
  userIntent: string;
  previousResponses: string[];
  sessionMetadata: Record<string, any>;
}

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  stage: ConversationStage;
  priority: number;
  version: string;
}

export interface PromptResult {
  prompt: string;
  confidence: number;
  template: string;
  variables: Record<string, any>;
  optimization: PromptOptimization;
}

export interface PromptOptimization {
  tokenCount: number;
  clarity: number;
  specificity: number;
  relevance: number;
  overallScore: number;
}

export interface ConversationMemory {
  keyPoints: string[];
  userPreferences: Record<string, any>;
  concerns: string[];
  positiveSignals: string[];
  followUpQuestions: string[];
  lastUpdated: Date;
}

export class PromptEngine {
  private logger: Logger;
  private promptTemplates: Map<string, PromptTemplate>;
  private conversationMemories: Map<string, ConversationMemory>;
  private optimizationRules: Map<string, Function>;
  private systemPrompts: Map<string, string>;

  constructor() {
    this.logger = Logger.getInstance();
    this.promptTemplates = new Map();
    this.conversationMemories = new Map();
    this.optimizationRules = new Map();
    this.systemPrompts = new Map();

    this.initializePromptTemplates();
    this.initializeSystemPrompts();
    this.initializeOptimizationRules();

    this.logger.info(
      "PromptEngine initialized with templates and optimization rules"
    );
  }

  /**
   * Generate optimized prompt for the current conversation context
   */
  async generatePrompt(context: PromptContext): Promise<PromptResult> {
    const startTime = Date.now();

    try {
      // Select appropriate prompt template
      const template = this.selectPromptTemplate(context);

      // Build conversation memory
      const memory = this.buildConversationMemory(context);

      // Generate base prompt
      const basePrompt = this.buildBasePrompt(template, context, memory);

      // Optimize the prompt
      const optimizedPrompt = this.optimizePrompt(basePrompt, context);

      // Calculate confidence and optimization scores
      const confidence = this.calculatePromptConfidence(
        optimizedPrompt,
        context
      );
      const optimization = this.calculateOptimizationScores(
        optimizedPrompt,
        context
      );

      // Update conversation memory
      this.updateConversationMemory(
        context.sessionMetadata.sessionId || "default",
        memory
      );

      const processingTime = Date.now() - startTime;
      this.logger.info("Prompt generated successfully", {
        processingTime,
        template: template.name,
        stage: context.conversationStage,
        confidence,
        optimizationScore: optimization.overallScore,
      });

      return {
        prompt: optimizedPrompt,
        confidence,
        template: template.name,
        variables: this.extractPromptVariables(optimizedPrompt),
        optimization,
      };
    } catch (error) {
      this.logger.error("Error generating prompt", { error, context });
      throw error;
    }
  }

  /**
   * Initialize prompt templates for different conversation stages
   */
  private initializePromptTemplates(): void {
    // Greeting Stage Templates
    this.promptTemplates.set("greeting_welcome", {
      name: "greeting_welcome",
      description: "Welcome message for new candidates",
      template: `You are a professional HR chatbot representing {company}. You're engaging with a candidate for the {position} role.

Job Details:
- Position: {position}
- Company: {company}
- Type: {jobType}
- Experience: {experience} years
- Location: {location}
- Remote: {remoteStatus}

Your goal is to:
1. Welcome the candidate warmly and professionally
2. Introduce the position briefly
3. Show enthusiasm about their interest
4. Begin gathering basic information about their background
5. Set a positive, engaging tone for the conversation

Current conversation stage: {stage}

Previous conversation context: {conversationContext}

Candidate's message: "{userMessage}"

Respond in a friendly, professional manner that encourages engagement. Ask 1-2 relevant questions to learn more about their background and interest in the role.`,
      variables: [
        "company",
        "position",
        "jobType",
        "experience",
        "location",
        "remoteStatus",
        "stage",
        "conversationContext",
        "userMessage",
      ],
      stage: "greeting",
      priority: 1,
      version: "1.0",
    });

    this.promptTemplates.set("greeting_followup", {
      name: "greeting_followup",
      description:
        "Follow-up greeting for candidates who have already shown interest",
      template: `You're continuing a conversation with a candidate interested in the {position} role at {company}.

Previous conversation summary:
{conversationSummary}

Extracted candidate information:
{extractedInfo}

Your goal is to:
1. Acknowledge their continued interest
2. Build on previous information shared
3. Guide the conversation toward qualification assessment
4. Ask specific questions about their experience and skills
5. Maintain engagement and show genuine interest

Current conversation stage: {stage}

Candidate's message: "{userMessage}"

Respond by building on what they've shared and asking targeted questions about their qualifications. Show that you're listening and want to learn more.`,
      variables: [
        "position",
        "company",
        "conversationSummary",
        "extractedInfo",
        "stage",
        "userMessage",
      ],
      stage: "greeting",
      priority: 2,
      version: "1.0",
    });

    // Qualification Stage Templates
    this.promptTemplates.set("qualification_experience", {
      name: "qualification_experience",
      description: "Extract and assess candidate experience",
      template: `You're in the qualification stage with a candidate for the {position} role. Focus on understanding their experience and background.

Job Requirements:
- Required Experience: {requiredExperience} years
- Key Skills: {requiredSkills}
- Responsibilities: {keyResponsibilities}

Current Candidate Profile:
{currentProfile}

Your goal is to:
1. Gather specific details about their relevant experience
2. Assess how their background aligns with requirements
3. Identify any gaps or strengths
4. Ask probing questions about their work history
5. Maintain a conversational, interview-like tone

Current conversation stage: {stage}

Previous responses: {previousResponses}

Candidate's message: "{userMessage}"

Ask specific, targeted questions about their experience. If they mention experience, dig deeper. If they haven't, ask about their background. Focus on relevance to the role.`,
      variables: [
        "position",
        "requiredExperience",
        "requiredSkills",
        "keyResponsibilities",
        "currentProfile",
        "stage",
        "previousResponses",
        "userMessage",
      ],
      stage: "qualification",
      priority: 1,
      version: "1.0",
    });

    this.promptTemplates.set("qualification_skills", {
      name: "qualification_skills",
      description: "Assess candidate technical skills and competencies",
      template: `You're assessing the technical skills of a candidate for the {position} role. Focus on their technical competencies and how they match the job requirements.

Required Technical Skills:
{requiredSkills}

Desired Experience Levels:
{skillLevels}

Your goal is to:
1. Evaluate their technical skill level
2. Assess skill relevance to the role
3. Identify any missing critical skills
4. Ask about specific projects or work examples
5. Determine if they can handle the technical challenges

Current conversation stage: {stage}

Extracted skills so far: {extractedSkills}

Candidate's message: "{userMessage}"

Ask specific questions about their technical skills. Request examples of projects or work that demonstrates their abilities. Assess both breadth and depth of knowledge.`,
      variables: [
        "position",
        "requiredSkills",
        "skillLevels",
        "stage",
        "extractedSkills",
        "userMessage",
      ],
      stage: "qualification",
      priority: 2,
      version: "1.0",
    });

    // Assessment Stage Templates
    this.promptTemplates.set("assessment_fit", {
      name: "assessment_fit",
      description: "Assess overall candidate fit for the position",
      template: `You're in the assessment stage, evaluating how well the candidate fits the {position} role. You have gathered information about their experience, skills, and background.

Job Requirements vs. Candidate Profile:
{fitAnalysis}

Strengths Identified:
{strengths}

Areas of Concern:
{concerns}

Your goal is to:
1. Provide honest assessment of their fit
2. Address any concerns or gaps
3. Discuss potential challenges
4. Explore how they might overcome limitations
5. Determine next steps in the process

Current conversation stage: {stage}

Candidate's message: "{userMessage}"

Provide a balanced assessment. If they're a good fit, explain why and discuss next steps. If there are concerns, address them constructively and explore solutions.`,
      variables: [
        "position",
        "fitAnalysis",
        "strengths",
        "concerns",
        "stage",
        "userMessage",
      ],
      stage: "assessment",
      priority: 1,
      version: "1.0",
    });

    // Closing Stage Templates
    this.promptTemplates.set("closing_next_steps", {
      name: "closing_next_steps",
      description: "Provide clear next steps and close the conversation",
      template: `You're concluding the conversation with a candidate for the {position} role. Provide clear next steps and close professionally.

Conversation Summary:
{conversationSummary}

Candidate Fit Assessment:
{fitAssessment}

Next Steps:
{nextSteps}

Your goal is to:
1. Summarize the key points discussed
2. Provide clear next steps
3. Set expectations for the hiring process
4. Thank them for their time and interest
5. End on a positive, professional note

Current conversation stage: {stage}

Candidate's message: "{userMessage}"

Provide a clear summary and next steps. If they're moving forward, explain what happens next. If not, provide constructive feedback. Always end professionally and positively.`,
      variables: [
        "position",
        "conversationSummary",
        "fitAssessment",
        "nextSteps",
        "stage",
        "userMessage",
      ],
      stage: "closing",
      priority: 1,
      version: "1.0",
    });

    // Information Extraction Templates
    this.promptTemplates.set("extraction_skills", {
      name: "extraction_skills",
      description: "Extract technical skills from candidate responses",
      template: `Extract technical skills and competencies mentioned by the candidate. Focus on identifying specific technologies, tools, and frameworks.

Context: {context}

Your task:
1. Identify all technical skills mentioned
2. Determine skill levels (beginner, intermediate, advanced, expert)
3. Assess relevance to the job requirements
4. Note any certifications or specializations
5. Identify skill gaps or areas for development

Candidate's message: "{userMessage}"

Extract and categorize the technical skills mentioned. Be specific about skill levels and relevance.`,
      variables: ["context", "userMessage"],
      stage: "qualification",
      priority: 3,
      version: "1.0",
    });

    this.promptTemplates.set("extraction_experience", {
      name: "extraction_experience",
      description: "Extract work experience and background information",
      template: `Extract work experience, background, and professional history from the candidate's response.

Context: {context}

Your task:
1. Identify years of experience
2. Extract relevant job titles and companies
3. Note industry experience
4. Identify key projects or achievements
5. Assess experience relevance to the role

Candidate's message: "{userMessage}"

Extract all relevant experience information. Be specific about duration, roles, and achievements.`,
      variables: ["context", "userMessage"],
      stage: "qualification",
      priority: 3,
      version: "1.0",
    });
  }

  /**
   * Initialize system prompts for different purposes
   */
  private initializeSystemPrompts(): void {
    this.systemPrompts.set(
      "base_persona",
      `You are an AI-powered HR chatbot specializing in candidate engagement and qualification assessment. You represent a professional company and conduct conversations to evaluate candidate fit for specific positions.

Your core responsibilities:
1. Engage candidates professionally and warmly
2. Gather relevant information about their background and qualifications
3. Assess their fit for the specific role
4. Provide clear, helpful information about the position and company
5. Guide conversations toward qualification assessment
6. Maintain a professional, engaging tone throughout

Key principles:
- Always be professional, respectful, and engaging
- Ask specific, relevant questions to gather information
- Listen carefully to candidate responses and build on them
- Provide honest, constructive feedback when appropriate
- Maintain consistency with company values and culture
- Focus on relevant qualifications and experience
- Be encouraging while remaining professional`
    );

    this.systemPrompts.set(
      "job_specific",
      `You are conducting a conversation for a specific job position. Your responses should be tailored to this role and company.

Remember:
- Focus on qualifications relevant to this specific position
- Ask questions that help assess fit for this role
- Provide information specific to this job and company
- Maintain context about the position requirements
- Guide the conversation toward qualification assessment for this role`
    );

    this.systemPrompts.set(
      "extraction_focused",
      `Your primary goal is to extract specific, structured information from candidate responses. Focus on:

1. Technical skills and competencies
2. Work experience and background
3. Education and certifications
4. Salary expectations and availability
5. Location preferences and constraints
6. Career goals and motivations

Be thorough and specific in your extraction. Ask clarifying questions when information is unclear or incomplete.`
    );
  }

  /**
   * Initialize optimization rules for prompt improvement
   */
  private initializeOptimizationRules(): void {
    // Clarity optimization
    this.optimizationRules.set("clarity", (prompt: string) => {
      let score = 0.5;

      // Check for clear structure
      if (prompt.includes("Your goal is to:") || prompt.includes("Your task:"))
        score += 0.2;
      if (prompt.includes("1.") && prompt.includes("2.")) score += 0.1;

      // Check for specific instructions
      if (prompt.includes("Ask specific") || prompt.includes("Be specific"))
        score += 0.1;
      if (prompt.includes("Focus on") || prompt.includes("Remember:"))
        score += 0.1;

      return Math.min(1.0, score);
    });

    // Specificity optimization
    this.optimizationRules.set("specificity", (prompt: string) => {
      let score = 0.5;

      // Check for specific examples
      if (prompt.includes("{") && prompt.includes("}")) score += 0.2;
      if (prompt.includes("specific") || prompt.includes("targeted"))
        score += 0.1;
      if (prompt.includes("relevant") || prompt.includes("appropriate"))
        score += 0.1;

      // Check for concrete instructions
      if (prompt.includes("Ask 1-2") || prompt.includes("Provide clear"))
        score += 0.1;

      return Math.min(1.0, score);
    });

    // Relevance optimization
    this.optimizationRules.set(
      "relevance",
      (prompt: string, context: PromptContext) => {
        let score = 0.5;

        // Check for job-specific content
        if (prompt.includes(context.jobDescription.title)) score += 0.2;
        if (prompt.includes(context.jobDescription.company)) score += 0.1;

        // Check for stage-appropriate content
        if (prompt.includes(context.conversationStage)) score += 0.1;

        // Check for context variables
        const variableCount = (prompt.match(/\{[^}]+\}/g) || []).length;
        score += Math.min(0.1, variableCount * 0.02);

        return Math.min(1.0, score);
      }
    );
  }

  /**
   * Select appropriate prompt template based on context
   */
  private selectPromptTemplate(context: PromptContext): PromptTemplate {
    const stage = context.conversationStage;
    const userIntent = context.userIntent.toLowerCase();

    // Filter templates by stage
    const stageTemplates = Array.from(this.promptTemplates.values())
      .filter((template) => template.stage === stage)
      .sort((a, b) => b.priority - a.priority);

    // Select template based on context and intent
    if (stage === "greeting") {
      if (context.conversationHistory.length > 2) {
        return (
          stageTemplates.find((t) => t.name === "greeting_followup") ||
          stageTemplates[0]
        );
      } else {
        return (
          stageTemplates.find((t) => t.name === "greeting_welcome") ||
          stageTemplates[0]
        );
      }
    } else if (stage === "qualification") {
      if (
        userIntent.includes("experience") ||
        userIntent.includes("background")
      ) {
        return (
          stageTemplates.find((t) => t.name === "qualification_experience") ||
          stageTemplates[0]
        );
      } else if (
        userIntent.includes("skills") ||
        userIntent.includes("technical")
      ) {
        return (
          stageTemplates.find((t) => t.name === "qualification_skills") ||
          stageTemplates[0]
        );
      }
    } else if (stage === "assessment") {
      return (
        stageTemplates.find((t) => t.name === "assessment_fit") ||
        stageTemplates[0]
      );
    } else if (stage === "closing") {
      return (
        stageTemplates.find((t) => t.name === "closing_next_steps") ||
        stageTemplates[0]
      );
    }

    return stageTemplates[0];
  }

  /**
   * Build base prompt from template and context
   */
  private buildBasePrompt(
    template: PromptTemplate,
    context: PromptContext,
    memory: ConversationMemory
  ): string {
    let prompt = template.template;

    // Replace template variables with actual values
    const variables: Record<string, any> = {
      company: context.jobDescription.company,
      position: context.jobDescription.title,
      jobType: context.jobDescription.type,
      experience: context.jobDescription.experience,
      location: context.jobDescription.location,
      remoteStatus: context.jobDescription.remote ? "Yes" : "No",
      stage: context.conversationStage,
      conversationContext: this.summarizeConversationContext(context),
      userMessage: context.userIntent,
      requiredExperience: context.jobDescription.experience,
      requiredSkills: context.jobDescription.skills.join(", "),
      keyResponsibilities: context.jobDescription.responsibilities
        .slice(0, 3)
        .join("; "),
      currentProfile: this.formatCandidateProfile(context.candidateProfile),
      conversationSummary: this.summarizeConversation(
        context.conversationHistory
      ),
      extractedInfo: this.formatExtractedInfo(context.extractedInfo),
      previousResponses: context.previousResponses.slice(-3).join(" | "),
      skillLevels: this.formatSkillLevels(context.jobDescription.skills),
      extractedSkills: this.formatExtractedSkills(context.extractedInfo.skills),
      fitAnalysis: this.analyzeCandidateFit(context),
      strengths: memory.positiveSignals.join(", "),
      concerns: memory.concerns.join(", "),
      fitAssessment: this.assessCandidateFit(context),
      nextSteps: this.determineNextSteps(context),
      context: this.provideExtractionContext(context),
    };

    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      prompt = prompt.replace(
        new RegExp(placeholder, "g"),
        value || "Not specified"
      );
    }

    return prompt;
  }

  /**
   * Build conversation memory from context
   */
  private buildConversationMemory(context: PromptContext): ConversationMemory {
    const memory: ConversationMemory = {
      keyPoints: [],
      userPreferences: {},
      concerns: [],
      positiveSignals: [],
      followUpQuestions: [],
      lastUpdated: new Date(),
    };

    // Extract key points from conversation history
    const userMessages = context.conversationHistory.filter(
      (msg) => msg.role === "user"
    );
    for (const message of userMessages.slice(-5)) {
      if (
        message.content.includes("experience") ||
        message.content.includes("worked")
      ) {
        memory.keyPoints.push("Has relevant work experience");
      }
      if (
        message.content.includes("skills") ||
        message.content.includes("technologies")
      ) {
        memory.keyPoints.push("Mentioned technical skills");
      }
      if (
        message.content.includes("interested") ||
        message.content.includes("excited")
      ) {
        memory.positiveSignals.push("Shows enthusiasm for the role");
      }
      if (
        message.content.includes("concern") ||
        message.content.includes("worry")
      ) {
        memory.concerns.push("Expressed concerns about role requirements");
      }
    }

    // Extract user preferences
    if (context.extractedInfo.salaryExpectation) {
      memory.userPreferences.salary = context.extractedInfo.salaryExpectation;
    }
    if (context.extractedInfo.location) {
      memory.userPreferences.location = context.extractedInfo.location;
    }
    if (context.extractedInfo.availability) {
      memory.userPreferences.availability = context.extractedInfo.availability;
    }

    return memory;
  }

  /**
   * Optimize prompt for better performance
   */
  private optimizePrompt(prompt: string, context: PromptContext): string {
    let optimized = prompt;

    // Add system prompt if not present
    if (!optimized.includes("You are")) {
      const systemPrompt = this.systemPrompts.get("base_persona") || "";
      optimized = `${systemPrompt}\n\n${optimized}`;
    }

    // Add job-specific context if not present
    if (!optimized.includes(context.jobDescription.title)) {
      const jobPrompt = this.systemPrompts.get("job_specific") || "";
      optimized = `${optimized}\n\n${jobPrompt}`;
    }

    // Optimize for clarity and specificity
    optimized = this.optimizePromptClarity(optimized);
    optimized = this.optimizePromptSpecificity(optimized);

    return optimized;
  }

  /**
   * Optimize prompt clarity
   */
  private optimizePromptClarity(prompt: string): string {
    let optimized = prompt;

    // Add clear structure if missing
    if (
      !optimized.includes("Your goal is to:") &&
      !optimized.includes("Your task:")
    ) {
      optimized = optimized.replace(
        /(Respond.*?\.)/,
        "$1\n\nYour goal is to:\n1. Address their question or concern\n2. Gather relevant information\n3. Guide the conversation appropriately"
      );
    }

    // Add specific instructions if missing
    if (
      !optimized.includes("Ask specific") &&
      !optimized.includes("Be specific")
    ) {
      optimized = optimized.replace(
        /(Guide the conversation.*?\.)/,
        "$1\n\nBe specific in your questions and responses. Ask targeted questions to gather relevant information."
      );
    }

    return optimized;
  }

  /**
   * Optimize prompt specificity
   */
  private optimizePromptSpecificity(prompt: string): string {
    let optimized = prompt;

    // Add specific examples if missing
    if (
      !optimized.includes("For example") &&
      !optimized.includes("Specifically")
    ) {
      optimized = optimized.replace(
        /(Ask targeted questions.*?\.)/,
        "$1\n\nFor example, ask about specific technologies, projects, or experiences relevant to the role."
      );
    }

    return optimized;
  }

  /**
   * Calculate prompt confidence score
   */
  private calculatePromptConfidence(
    prompt: string,
    context: PromptContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Boost confidence for comprehensive prompts
    if (prompt.length > 500) confidence += 0.1;
    if (prompt.includes("Your goal is to:")) confidence += 0.1;
    if (prompt.includes("Remember:")) confidence += 0.05;

    // Boost confidence for context-specific content
    if (prompt.includes(context.jobDescription.title)) confidence += 0.1;
    if (prompt.includes(context.conversationStage)) confidence += 0.05;

    // Reduce confidence for generic prompts
    if (
      prompt.includes("generic response") ||
      prompt.includes("standard answer")
    )
      confidence -= 0.1;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Calculate optimization scores
   */
  private calculateOptimizationScores(
    prompt: string,
    context: PromptContext
  ): PromptOptimization {
    const tokenCount = prompt.split(/\s+/).length;

    const clarity = this.optimizationRules.get("clarity")?.(prompt) || 0.5;
    const specificity =
      this.optimizationRules.get("specificity")?.(prompt) || 0.5;
    const relevance =
      this.optimizationRules.get("relevance")?.(prompt, context) || 0.5;

    const overallScore = (clarity + specificity + relevance) / 3;

    return {
      tokenCount,
      clarity,
      specificity,
      relevance,
      overallScore,
    };
  }

  /**
   * Extract variables from prompt
   */
  private extractPromptVariables(prompt: string): Record<string, any> {
    const variables: Record<string, any> = {};
    const matches = prompt.match(/\{([^}]+)\}/g);

    if (matches) {
      for (const match of matches) {
        const key = match.slice(1, -1);
        variables[key] = "placeholder";
      }
    }

    return variables;
  }

  /**
   * Update conversation memory
   */
  private updateConversationMemory(
    sessionId: string,
    memory: ConversationMemory
  ): void {
    this.conversationMemories.set(sessionId, memory);
  }

  /**
   * Helper methods for context formatting
   */
  private summarizeConversationContext(context: PromptContext): string {
    if (context.conversationHistory.length === 0) return "New conversation";

    const recentMessages = context.conversationHistory.slice(-3);
    return recentMessages
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 50)}...`)
      .join(" | ");
  }

  private formatCandidateProfile(profile?: CandidateProfile): string {
    if (!profile) return "No profile available";

    return `Name: ${profile.name || "Not provided"}, Experience: ${
      profile.experience || "Not specified"
    } years, Skills: ${profile.skills?.join(", ") || "Not specified"}`;
  }

  private summarizeConversation(history: ChatMessage[]): string {
    if (history.length === 0) return "No previous conversation";

    const userMessages = history.filter((msg) => msg.role === "user");
    return `Conversation has ${history.length} messages, ${userMessages.length} from user`;
  }

  private formatExtractedInfo(info: Record<string, any>): string {
    if (Object.keys(info).length === 0) return "No information extracted yet";

    return Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  private formatSkillLevels(skills: string[]): string {
    return skills.map((skill) => `${skill}: Intermediate+`).join(", ");
  }

  private formatExtractedSkills(skills?: string[]): string {
    if (!skills || skills.length === 0) return "No skills extracted yet";
    return skills.join(", ");
  }

  private analyzeCandidateFit(context: PromptContext): string {
    if (!context.candidateProfile)
      return "No candidate profile available for analysis";

    const profile = context.candidateProfile;
    const requirements = context.jobDescription;

    let analysis = "";

    if (profile.experience && requirements.experience) {
      if (profile.experience >= requirements.experience) {
        analysis += "Experience requirement met. ";
      } else {
        analysis += `Experience gap: ${profile.experience} vs ${requirements.experience} required. `;
      }
    }

    if (profile.skills && profile.skills.length > 0) {
      const matchingSkills = profile.skills.filter((skill) =>
        requirements.skills.some((reqSkill) =>
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      analysis += `Skills match: ${matchingSkills.length}/${requirements.skills.length}. `;
    }

    return analysis || "Limited information available for analysis";
  }

  private assessCandidateFit(context: PromptContext): string {
    if (!context.candidateProfile)
      return "Assessment pending - need more information";

    // Simple fit calculation
    let fitScore = 0;
    const profile = context.candidateProfile;
    const requirements = context.jobDescription;

    if (profile.experience && requirements.experience) {
      if (profile.experience >= requirements.experience) fitScore += 40;
      else
        fitScore += Math.max(
          0,
          40 - (requirements.experience - profile.experience) * 10
        );
    }

    if (profile.skills && profile.skills.length > 0) {
      const matchingSkills = profile.skills.filter((skill) =>
        requirements.skills.some((reqSkill) =>
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      fitScore += (matchingSkills.length / requirements.skills.length) * 40;
    }

    if (fitScore >= 70) return "Strong candidate fit";
    else if (fitScore >= 50) return "Moderate candidate fit";
    else return "Limited candidate fit";
  }

  private determineNextSteps(context: PromptContext): string {
    const stage = context.conversationStage;

    switch (stage) {
      case "greeting":
        return "Continue gathering basic information and assess initial interest";
      case "qualification":
        return "Complete qualification assessment and identify any gaps";
      case "assessment":
        return "Provide fit assessment and discuss potential challenges";
      case "closing":
        return "Summarize conversation and provide clear next steps";
      default:
        return "Continue conversation based on current stage";
    }
  }

  private provideExtractionContext(context: PromptContext): string {
    return `Job: ${context.jobDescription.title} at ${context.jobDescription.company}, Stage: ${context.conversationStage}, Previous messages: ${context.conversationHistory.length}`;
  }

  /**
   * Get prompt engine statistics
   */
  getPromptStats(): {
    totalTemplates: number;
    totalSystemPrompts: number;
    totalOptimizationRules: number;
  } {
    return {
      totalTemplates: this.promptTemplates.size,
      totalSystemPrompts: this.systemPrompts.size,
      totalOptimizationRules: this.optimizationRules.size,
    };
  }

  /**
   * Add custom prompt template
   */
  addCustomTemplate(template: PromptTemplate): void {
    this.promptTemplates.set(template.name, template);
    this.logger.info("Custom prompt template added", {
      templateName: template.name,
    });
  }

  /**
   * Test prompt generation
   */
  async testPromptGeneration(
    testContext: PromptContext
  ): Promise<{ success: boolean; result?: PromptResult; error?: string }> {
    try {
      const result = await this.generatePrompt(testContext);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
