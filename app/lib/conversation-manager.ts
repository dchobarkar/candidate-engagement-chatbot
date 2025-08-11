import {
  ChatMessage,
  JobDescription,
  CandidateProfile,
  ConversationStage,
  MessageRole,
  ConversationSession,
} from "./types";
import { LLMClient, ConversationContext, LLMResponse } from "./llm-client";
import { DataExtractor } from "./data-extractor";
import { Logger } from "./logger";

export interface ConversationState {
  currentStage: ConversationStage;
  stageProgress: number; // 0-100
  extractedInfo: Record<string, any>;
  confidenceScores: Record<string, number>;
  conversationFlow: ConversationFlow[];
  lastActivity: Date;
  isActive: boolean;
}

export interface ConversationFlow {
  stage: ConversationStage;
  messages: ChatMessage[];
  extractedData: Record<string, any>;
  confidence: number;
  timestamp: Date;
  duration: number; // in seconds
}

export interface ConversationMetrics {
  totalMessages: number;
  averageResponseTime: number;
  stageTransitions: number;
  informationExtractionRate: number;
  userEngagementScore: number;
  completionRate: number;
}

export interface ConversationAnalysis {
  candidateFit: number; // 0-100
  qualificationGaps: string[];
  strengths: string[];
  areasOfConcern: string[];
  recommendedActions: string[];
  nextSteps: string[];
}

export class ConversationManager {
  private llmClient: LLMClient;
  private dataExtractor: DataExtractor;
  private logger: Logger;
  private state: ConversationState;
  private session: ConversationSession;
  private jobDescription: JobDescription;

  constructor(
    llmClient: LLMClient,
    dataExtractor: DataExtractor,
    session: ConversationSession,
    jobDescription: JobDescription
  ) {
    this.llmClient = llmClient;
    this.dataExtractor = dataExtractor;
    this.logger = Logger.getInstance();
    this.session = session;
    this.jobDescription = jobDescription;

    this.state = this.initializeConversationState();

    this.logger.info("ConversationManager initialized", {
      sessionId: session.id,
      jobTitle: jobDescription.title,
      initialStage: this.state.currentStage,
    });
  }

  /**
   * Initialize conversation state
   */
  private initializeConversationState(): ConversationState {
    return {
      currentStage: "greeting",
      stageProgress: 0,
      extractedInfo: {},
      confidenceScores: {},
      conversationFlow: [],
      lastActivity: new Date(),
      isActive: true,
    };
  }

  /**
   * Process a user message through the conversation pipeline
   */
  async processUserMessage(
    userMessage: string,
    candidateProfile?: CandidateProfile
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Preprocess the message
      const preprocessedMessage = this.preprocessMessage(userMessage);

      // Update conversation state
      this.updateConversationState(preprocessedMessage);

      // Build conversation context
      const context = this.buildConversationContext(
        preprocessedMessage,
        candidateProfile
      );

      // Generate LLM response
      const response = await this.llmClient.processMessage(
        preprocessedMessage,
        context
      );

      // Post-process the response
      const postProcessedResponse = this.postProcessResponse(response, context);

      // Extract information from the conversation
      const extractedData = await this.extractInformationFromConversation(
        preprocessedMessage,
        postProcessedResponse.content
      );

      // Update extracted information
      this.updateExtractedInfo(extractedData);

      // Analyze conversation progress
      this.analyzeConversationProgress();

      // Update conversation flow
      this.updateConversationFlow(
        preprocessedMessage,
        postProcessedResponse,
        extractedData
      );

      const processingTime = Date.now() - startTime;
      this.logger.info("User message processed successfully", {
        processingTime,
        messageLength: userMessage.length,
        stage: this.state.currentStage,
        stageProgress: this.state.stageProgress,
      });

      return postProcessedResponse;
    } catch (error) {
      this.logger.error("Error processing user message", {
        error,
        userMessage,
      });
      throw error;
    }
  }

  /**
   * Preprocess user message
   */
  private preprocessMessage(message: string): string {
    // Clean and normalize the message
    let processedMessage = message.trim();

    // Remove excessive whitespace
    processedMessage = processedMessage.replace(/\s+/g, " ");

    // Convert to lowercase for analysis (but preserve original for context)
    const lowerMessage = processedMessage.toLowerCase();

    // Detect message intent
    const intent = this.detectMessageIntent(lowerMessage);

    // Log preprocessing results
    this.logger.debug("Message preprocessed", {
      originalLength: message.length,
      processedLength: processedMessage.length,
      intent,
      hasUrls: /https?:\/\/[^\s]+/.test(processedMessage),
      hasEmails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
        processedMessage
      ),
    });

    return processedMessage;
  }

  /**
   * Detect message intent
   */
  private detectMessageIntent(message: string): string {
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      return "greeting";
    } else if (
      message.includes("experience") ||
      message.includes("background") ||
      message.includes("skills")
    ) {
      return "qualification";
    } else if (
      message.includes("salary") ||
      message.includes("pay") ||
      message.includes("compensation")
    ) {
      return "compensation";
    } else if (
      message.includes("benefits") ||
      message.includes("perks") ||
      message.includes("advantages")
    ) {
      return "benefits";
    } else if (
      message.includes("location") ||
      message.includes("remote") ||
      message.includes("office")
    ) {
      return "location";
    } else if (
      message.includes("next") ||
      message.includes("step") ||
      message.includes("process")
    ) {
      return "process";
    } else if (
      message.includes("thank") ||
      message.includes("bye") ||
      message.includes("goodbye")
    ) {
      return "closing";
    } else {
      return "general";
    }
  }

  /**
   * Update conversation state based on message
   */
  private updateConversationState(message: string): void {
    this.state.lastActivity = new Date();

    // Update stage progress based on message content
    const progressIncrement = this.calculateProgressIncrement(message);
    this.state.stageProgress = Math.min(
      100,
      this.state.stageProgress + progressIncrement
    );

    // Check if stage should transition
    if (this.state.stageProgress >= 100) {
      this.transitionToNextStage();
    }
  }

  /**
   * Calculate progress increment for current stage
   */
  private calculateProgressIncrement(message: string): number {
    const lowerMessage = message.toLowerCase();

    switch (this.state.currentStage) {
      case "greeting":
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi"))
          return 25;
        if (
          lowerMessage.includes("interested") ||
          lowerMessage.includes("position")
        )
          return 50;
        return 10;

      case "qualification":
        if (
          lowerMessage.includes("experience") ||
          lowerMessage.includes("years")
        )
          return 20;
        if (
          lowerMessage.includes("skills") ||
          lowerMessage.includes("technologies")
        )
          return 20;
        if (
          lowerMessage.includes("education") ||
          lowerMessage.includes("degree")
        )
          return 20;
        if (lowerMessage.includes("projects") || lowerMessage.includes("work"))
          return 20;
        return 5;

      case "assessment":
        if (lowerMessage.includes("fit") || lowerMessage.includes("suitable"))
          return 30;
        if (
          lowerMessage.includes("concern") ||
          lowerMessage.includes("question")
        )
          return 20;
        if (lowerMessage.includes("ready") || lowerMessage.includes("proceed"))
          return 50;
        return 10;

      case "closing":
        if (lowerMessage.includes("thank") || lowerMessage.includes("bye"))
          return 100;
        if (lowerMessage.includes("next") || lowerMessage.includes("step"))
          return 50;
        return 25;

      default:
        return 10;
    }
  }

  /**
   * Transition to next conversation stage
   */
  private transitionToNextStage(): void {
    const currentStage = this.state.currentStage;
    let nextStage: ConversationStage;

    switch (currentStage) {
      case "greeting":
        nextStage = "qualification";
        break;
      case "qualification":
        nextStage = "assessment";
        break;
      case "assessment":
        nextStage = "closing";
        break;
      case "closing":
        nextStage = "completed";
        break;
      default:
        nextStage = "completed";
    }

    if (nextStage !== currentStage) {
      this.state.currentStage = nextStage;
      this.state.stageProgress = 0;
      this.state.stageTransitions = (this.state.stageTransitions || 0) + 1;

      this.logger.info("Conversation stage transitioned", {
        from: currentStage,
        to: nextStage,
        sessionId: this.session.id,
      });
    }
  }

  /**
   * Build conversation context for LLM
   */
  private buildConversationContext(
    message: string,
    candidateProfile?: CandidateProfile
  ): ConversationContext {
    // Get recent conversation history (last 10 messages)
    const recentMessages = this.session.messages.slice(-10);

    return {
      messages: recentMessages,
      jobDescription: this.jobDescription,
      candidateProfile,
      stage: this.state.currentStage,
      extractedInfo: this.state.extractedInfo,
    };
  }

  /**
   * Post-process LLM response
   */
  private postProcessResponse(
    response: LLMResponse,
    context: ConversationContext
  ): LLMResponse {
    let processedResponse = { ...response };

    // Enhance response based on conversation stage
    processedResponse.content = this.enhanceResponseForStage(
      response.content,
      this.state.currentStage
    );

    // Add stage-specific follow-up questions if none provided
    if (
      !processedResponse.followUpQuestions ||
      processedResponse.followUpQuestions.length === 0
    ) {
      processedResponse.followUpQuestions = this.generateStageSpecificQuestions(
        this.state.currentStage
      );
    }

    // Update confidence based on stage context
    processedResponse.confidence = this.adjustConfidenceForStage(
      response.confidence,
      this.state.currentStage
    );

    return processedResponse;
  }

  /**
   * Enhance response content for specific conversation stage
   */
  private enhanceResponseForStage(
    content: string,
    stage: ConversationStage
  ): string {
    let enhancedContent = content;

    switch (stage) {
      case "greeting":
        if (!enhancedContent.includes(this.jobDescription.title)) {
          enhancedContent += `\n\nI'd love to learn more about your background and how it aligns with our ${this.jobDescription.title} position.`;
        }
        break;

      case "qualification":
        if (
          !enhancedContent.includes("experience") &&
          !enhancedContent.includes("skills")
        ) {
          enhancedContent += `\n\nCould you tell me more about your relevant experience and technical skills?`;
        }
        break;

      case "assessment":
        if (
          !enhancedContent.includes("fit") &&
          !enhancedContent.includes("qualifications")
        ) {
          enhancedContent += `\n\nBased on what you've shared, I'd like to understand how your background fits our requirements.`;
        }
        break;

      case "closing":
        if (
          !enhancedContent.includes("next step") &&
          !enhancedContent.includes("follow up")
        ) {
          enhancedContent += `\n\nWhat would you like to know about the next steps in our process?`;
        }
        break;
    }

    return enhancedContent;
  }

  /**
   * Generate stage-specific follow-up questions
   */
  private generateStageSpecificQuestions(stage: ConversationStage): string[] {
    switch (stage) {
      case "greeting":
        return [
          "What interests you about this position?",
          "Could you tell me about your background?",
        ];

      case "qualification":
        return [
          "How many years of experience do you have?",
          "What are your key technical skills?",
          "Tell me about your most relevant project.",
        ];

      case "assessment":
        return [
          "How do you think your experience matches our requirements?",
          "What challenges do you anticipate in this role?",
          "What questions do you have about the position?",
        ];

      case "closing":
        return [
          "What would you like to know about next steps?",
          "Do you have any other questions?",
          "When would you be available for a follow-up?",
        ];

      default:
        return ["Is there anything else you'd like to discuss?"];
    }
  }

  /**
   * Adjust confidence score based on conversation stage
   */
  private adjustConfidenceForStage(
    confidence: number,
    stage: ConversationStage
  ): number {
    let adjustedConfidence = confidence;

    // Boost confidence for early stages where responses are more predictable
    switch (stage) {
      case "greeting":
        adjustedConfidence = Math.min(1.0, confidence + 0.1);
        break;
      case "qualification":
        adjustedConfidence = Math.min(1.0, confidence + 0.05);
        break;
      case "assessment":
        // Keep confidence as is for assessment stage
        break;
      case "closing":
        adjustedConfidence = Math.min(1.0, confidence + 0.1);
        break;
    }

    return adjustedConfidence;
  }

  /**
   * Extract information from conversation using DataExtractor
   */
  private async extractInformationFromConversation(
    userMessage: string,
    assistantResponse: string
  ): Promise<Record<string, any>> {
    try {
      const conversationText = `${userMessage} ${assistantResponse}`;
      const extractedData = await this.dataExtractor.extractCandidateInfo(
        conversationText
      );

      return extractedData;
    } catch (error) {
      this.logger.warn("Failed to extract information from conversation", {
        error,
      });
      return {};
    }
  }

  /**
   * Update extracted information and confidence scores
   */
  private updateExtractedInfo(newData: Record<string, any>): void {
    // Merge new data with existing data
    for (const [key, value] of Object.entries(newData)) {
      if (value !== undefined && value !== null) {
        this.state.extractedInfo[key] = value;

        // Update confidence score for this piece of information
        this.state.confidenceScores[key] = this.calculateInformationConfidence(
          key,
          value
        );
      }
    }
  }

  /**
   * Calculate confidence score for extracted information
   */
  private calculateInformationConfidence(key: string, value: any): number {
    let confidence = 0.7; // Base confidence

    // Boost confidence for well-structured data
    if (typeof value === "string" && value.length > 0) {
      confidence += 0.1;

      // Higher confidence for specific data types
      if (
        key === "email" &&
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)
      ) {
        confidence += 0.2;
      } else if (
        key === "phone" &&
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(value)
      ) {
        confidence += 0.2;
      } else if (
        key === "experience" &&
        typeof value === "number" &&
        value > 0
      ) {
        confidence += 0.2;
      }
    } else if (Array.isArray(value) && value.length > 0) {
      confidence += 0.15;
    } else if (typeof value === "number" && value > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Analyze conversation progress and provide insights
   */
  private analyzeConversationProgress(): void {
    const progress = this.state.stageProgress;
    const stage = this.state.currentStage;

    // Log progress milestones
    if (progress >= 25 && progress < 50) {
      this.logger.info("Conversation progressing well", { stage, progress });
    } else if (progress >= 50 && progress < 75) {
      this.logger.info("Conversation reaching completion for current stage", {
        stage,
        progress,
      });
    } else if (progress >= 75) {
      this.logger.info("Conversation stage nearly complete", {
        stage,
        progress,
      });
    }
  }

  /**
   * Update conversation flow tracking
   */
  private updateConversationFlow(
    userMessage: string,
    response: LLMResponse,
    extractedData: Record<string, any>
  ): void {
    const flowEntry: ConversationFlow = {
      stage: this.state.currentStage,
      messages: [
        { role: MessageRole.USER, content: userMessage, timestamp: new Date() },
        {
          role: MessageRole.ASSISTANT,
          content: response.content,
          timestamp: new Date(),
        },
      ],
      extractedData,
      confidence: response.confidence,
      timestamp: new Date(),
      duration: 0, // Will be calculated when next message arrives
    };

    // Calculate duration for previous flow entry if exists
    if (this.state.conversationFlow.length > 0) {
      const lastEntry =
        this.state.conversationFlow[this.state.conversationFlow.length - 1];
      const duration =
        (flowEntry.timestamp.getTime() - lastEntry.timestamp.getTime()) / 1000;
      lastEntry.duration = duration;
    }

    this.state.conversationFlow.push(flowEntry);

    // Keep only last 20 flow entries to prevent memory bloat
    if (this.state.conversationFlow.length > 20) {
      this.state.conversationFlow = this.state.conversationFlow.slice(-20);
    }
  }

  /**
   * Get conversation analysis and insights
   */
  getConversationAnalysis(): ConversationAnalysis {
    const extractedInfo = this.state.extractedInfo;
    const jobRequirements = this.jobDescription;

    // Calculate candidate fit based on extracted information
    let candidateFit = 0;
    let qualificationGaps: string[] = [];
    let strengths: string[] = [];
    let areasOfConcern: string[] = [];

    // Analyze experience fit
    if (extractedInfo.experience) {
      const requiredExp = jobRequirements.experience;
      const candidateExp = extractedInfo.experience;

      if (candidateExp >= requiredExp) {
        candidateFit += 25;
        strengths.push(`Strong experience (${candidateExp} years)`);
      } else {
        qualificationGaps.push(
          `Experience gap: ${candidateExp} years vs ${requiredExp} required`
        );
      }
    }

    // Analyze skills fit
    if (extractedInfo.skills && Array.isArray(extractedInfo.skills)) {
      const requiredSkills = jobRequirements.skills;
      const candidateSkills = extractedInfo.skills;

      const matchingSkills = candidateSkills.filter((skill) =>
        requiredSkills.some(
          (reqSkill) =>
            reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      );

      const skillMatchPercentage =
        (matchingSkills.length / requiredSkills.length) * 100;
      candidateFit += skillMatchPercentage * 0.4; // Skills worth 40% of total fit

      if (matchingSkills.length > 0) {
        strengths.push(`Matching skills: ${matchingSkills.join(", ")}`);
      }

      if (skillMatchPercentage < 50) {
        areasOfConcern.push(`Limited skill overlap with requirements`);
      }
    }

    // Analyze education fit
    if (extractedInfo.education) {
      candidateFit += 15;
      strengths.push(`Education: ${extractedInfo.education}`);
    }

    // Analyze salary expectations
    if (extractedInfo.salaryExpectation) {
      const candidateSalary = this.parseSalary(extractedInfo.salaryExpectation);
      const jobRange = jobRequirements.salary;

      if (candidateSalary >= jobRange.min && candidateSalary <= jobRange.max) {
        candidateFit += 20;
        strengths.push("Salary expectations within range");
      } else if (candidateSalary > jobRange.max) {
        areasOfConcern.push("Salary expectations above range");
      }
    }

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(
      candidateFit,
      qualificationGaps
    );

    // Determine next steps
    const nextSteps = this.determineNextSteps(
      candidateFit,
      this.state.currentStage
    );

    return {
      candidateFit: Math.min(100, Math.max(0, candidateFit)),
      qualificationGaps,
      strengths,
      areasOfConcern,
      recommendedActions,
      nextSteps,
    };
  }

  /**
   * Parse salary string to number
   */
  private parseSalary(salaryStr: string): number {
    const match = salaryStr.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)/i);
    if (match) {
      let value = parseInt(match[1].replace(/,/g, ""));
      if (salaryStr.toLowerCase().includes("k")) {
        value *= 1000;
      }
      return value;
    }
    return 0;
  }

  /**
   * Generate recommended actions based on analysis
   */
  private generateRecommendedActions(
    candidateFit: number,
    gaps: string[]
  ): string[] {
    const actions: string[] = [];

    if (candidateFit >= 80) {
      actions.push("Schedule technical interview");
      actions.push("Request portfolio or work samples");
      actions.push("Discuss next steps in hiring process");
    } else if (candidateFit >= 60) {
      actions.push("Schedule screening call to discuss gaps");
      actions.push("Request additional information about experience");
      actions.push("Consider if gaps can be addressed through training");
    } else {
      actions.push("Politely decline and suggest other opportunities");
      actions.push("Provide feedback on qualification gaps");
      actions.push("Keep candidate in database for future roles");
    }

    return actions;
  }

  /**
   * Determine next steps based on fit and stage
   */
  private determineNextSteps(
    candidateFit: number,
    currentStage: ConversationStage
  ): string[] {
    const nextSteps: string[] = [];

    if (currentStage === "closing" || currentStage === "completed") {
      if (candidateFit >= 70) {
        nextSteps.push("Schedule follow-up interview");
        nextSteps.push("Request references");
        nextSteps.push("Begin background check process");
      } else {
        nextSteps.push("Send polite rejection email");
        nextSteps.push("Provide constructive feedback");
        nextSteps.push("Suggest alternative opportunities");
      }
    } else {
      nextSteps.push("Continue qualification assessment");
      nextSteps.push("Gather additional information");
      nextSteps.push("Address any concerns or questions");
    }

    return nextSteps;
  }

  /**
   * Get conversation metrics
   */
  getConversationMetrics(): ConversationMetrics {
    const totalMessages = this.session.messages.length;
    const stageTransitions = this.state.stageTransitions || 0;

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < this.session.messages.length; i += 2) {
      if (this.session.messages[i] && this.session.messages[i - 1]) {
        const responseTime =
          this.session.messages[i].timestamp.getTime() -
          this.session.messages[i - 1].timestamp.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }

    const averageResponseTime =
      responseCount > 0 ? totalResponseTime / responseCount : 0;

    // Calculate information extraction rate
    const extractedFields = Object.keys(this.state.extractedInfo).length;
    const totalPossibleFields = 10; // Approximate number of fields we try to extract
    const informationExtractionRate =
      (extractedFields / totalPossibleFields) * 100;

    // Calculate user engagement score
    const userMessages = this.session.messages.filter(
      (msg) => msg.role === MessageRole.USER
    );
    const averageMessageLength =
      userMessages.reduce((sum, msg) => sum + msg.content.length, 0) /
      userMessages.length;
    const userEngagementScore = Math.min(100, averageMessageLength / 2); // Normalize to 0-100

    // Calculate completion rate
    const completionRate =
      this.state.currentStage === "completed"
        ? 100
        : this.state.stageProgress +
          this.getStageIndex(this.state.currentStage) * 25;

    return {
      totalMessages,
      averageResponseTime,
      stageTransitions,
      informationExtractionRate,
      userEngagementScore,
      completionRate,
    };
  }

  /**
   * Get stage index for progress calculation
   */
  private getStageIndex(stage: ConversationStage): number {
    const stages: ConversationStage[] = [
      "greeting",
      "qualification",
      "assessment",
      "closing",
      "completed",
    ];
    return stages.indexOf(stage);
  }

  /**
   * Get current conversation state
   */
  getCurrentState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Update conversation state
   */
  updateState(updates: Partial<ConversationState>): void {
    this.state = { ...this.state, ...updates };
    this.logger.info("Conversation state updated", { updates });
  }

  /**
   * Reset conversation to initial state
   */
  resetConversation(): void {
    this.state = this.initializeConversationState();
    this.logger.info("Conversation reset to initial state");
  }

  /**
   * Check if conversation is complete
   */
  isConversationComplete(): boolean {
    return (
      this.state.currentStage === "completed" || this.state.stageProgress >= 100
    );
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(): string {
    const analysis = this.getConversationAnalysis();
    const metrics = this.getConversationMetrics();

    return `Conversation Summary:
- Stage: ${this.state.currentStage} (${this.state.stageProgress}% complete)
- Candidate Fit: ${analysis.candidateFit}%
- Messages: ${metrics.totalMessages}
- Extracted Information: ${Object.keys(this.state.extractedInfo).length} fields
- Strengths: ${analysis.strengths.join(", ")}
- Areas of Concern: ${analysis.areasOfConcern.join(", ")}
- Next Steps: ${analysis.nextSteps.join(", ")}`;
  }
}
