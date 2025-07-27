import { v4 as uuidv4 } from "uuid";
import {
  ConversationSession,
  ChatMessage,
  MessageRole,
  ConversationResult,
} from "./types";
import { sessionManager } from "./session-manager";

// ============================================================================
// CONVERSATION MANAGER CLASS
// ============================================================================

export class ConversationManager {
  private session: ConversationSession;
  private context: {
    conversationHistory: ChatMessage[];
    extractedInfo: any;
    conversationStage: string;
    lastActivity: Date;
  };

  constructor(session: ConversationSession) {
    this.session = session;
    this.context = {
      conversationHistory: session.messages || [],
      extractedInfo: {},
      conversationStage: "initial",
      lastActivity: new Date(),
    };
  }

  // ========================================================================
  // MESSAGE PROCESSING
  // ========================================================================

  async processMessage(
    message: string,
    dependencies: {
      llmClient: any;
      dataExtractor: any;
      sessionManager: any;
    }
  ): Promise<ConversationResult> {
    try {
      // Update context
      this.context.lastActivity = new Date();

      // Preprocess message
      const preprocessedMessage = this.preprocessMessage(message);

      // Add user message to conversation history
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: preprocessedMessage,
        role: MessageRole.USER,
        timestamp: new Date(),
        sessionId: this.session.id,
      };

      this.context.conversationHistory.push(userMessage);

      // Generate response using LLM
      const llmResponse = await this.generateResponse(
        preprocessedMessage,
        dependencies.llmClient
      );

      // Extract information from the conversation
      const extractedInfo = await this.extractInformation(
        this.context.conversationHistory,
        dependencies.dataExtractor
      );

      // Update context with extracted information
      this.context.extractedInfo = {
        ...this.context.extractedInfo,
        ...extractedInfo,
      };

      // Determine conversation stage
      this.updateConversationStage();

      // Post-process response
      const finalResponse = this.postprocessResponse(llmResponse);

      // Create result
      const result: ConversationResult = {
        messageId: uuidv4(),
        response: finalResponse,
        confidence: this.calculateConfidence(extractedInfo),
        extractedInfo: this.context.extractedInfo,
        conversationStage: this.context.conversationStage,
        processingTime: Date.now(),
      };

      return result;
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error(`Failed to process message: ${error}`);
    }
  }

  // ========================================================================
  // MESSAGE PREPROCESSING
  // ========================================================================

  private preprocessMessage(message: string): string {
    // Remove extra whitespace
    let processed = message.trim().replace(/\s+/g, " ");

    // Convert to lowercase for consistency (optional)
    // processed = processed.toLowerCase();

    // Remove special characters if needed
    // processed = processed.replace(/[^\w\s.,!?-]/g, "");

    return processed;
  }

  // ========================================================================
  // RESPONSE GENERATION
  // ========================================================================

  private async generateResponse(
    message: string,
    llmClient: any
  ): Promise<string> {
    try {
      // Create conversation context for LLM
      const conversationContext = this.buildConversationContext();

      // Generate response using LLM client
      const response = await llmClient.processMessage(
        message,
        conversationContext
      );

      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      return "I apologize, but I'm having trouble processing your message right now. Could you please try again?";
    }
  }

  // ========================================================================
  // CONTEXT BUILDING
  // ========================================================================

  private buildConversationContext(): any {
    return {
      jobContext: this.session.jobContext,
      candidateProfile: this.session.candidateProfile,
      conversationHistory: this.context.conversationHistory.slice(-10), // Last 10 messages
      conversationStage: this.context.conversationStage,
      extractedInfo: this.context.extractedInfo,
      sessionId: this.session.id,
    };
  }

  // ========================================================================
  // INFORMATION EXTRACTION
  // ========================================================================

  private async extractInformation(
    conversationHistory: ChatMessage[],
    dataExtractor: any
  ): Promise<any> {
    try {
      // Extract information using the data extractor
      const extractedInfo = await dataExtractor.extractCandidateInfo(
        conversationHistory
      );

      return extractedInfo;
    } catch (error) {
      console.error("Error extracting information:", error);
      return {};
    }
  }

  // ========================================================================
  // CONVERSATION STAGE MANAGEMENT
  // ========================================================================

  private updateConversationStage(): void {
    const messageCount = this.context.conversationHistory.length;
    const hasBasicInfo = this.hasBasicCandidateInfo();

    if (messageCount <= 2) {
      this.context.conversationStage = "greeting";
    } else if (!hasBasicInfo) {
      this.context.conversationStage = "information_gathering";
    } else if (this.hasExperienceInfo()) {
      this.context.conversationStage = "qualification_assessment";
    } else if (this.hasSalaryInfo()) {
      this.context.conversationStage = "salary_negotiation";
    } else {
      this.context.conversationStage = "wrapping_up";
    }
  }

  private hasBasicCandidateInfo(): boolean {
    const profile = this.session.candidateProfile;
    return !!(profile.name || profile.email || profile.phone);
  }

  private hasExperienceInfo(): boolean {
    const profile = this.session.candidateProfile;
    return profile.experience.years > 0 || profile.experience.months > 0;
  }

  private hasSalaryInfo(): boolean {
    const profile = this.session.candidateProfile;
    return profile.salary.expected > 0;
  }

  // ========================================================================
  // RESPONSE POST-PROCESSING
  // ========================================================================

  private postprocessResponse(response: string): string {
    // Clean up response
    let processed = response.trim();

    // Ensure response ends with proper punctuation
    if (!processed.match(/[.!?]$/)) {
      processed += ".";
    }

    // Limit response length
    if (processed.length > 1000) {
      processed = processed.substring(0, 997) + "...";
    }

    return processed;
  }

  // ========================================================================
  // CONFIDENCE CALCULATION
  // ========================================================================

  private calculateConfidence(extractedInfo: any): number {
    let confidence = 0;
    let totalFactors = 0;

    // Factor 1: Basic information completeness
    if (extractedInfo.name) {
      confidence += 0.2;
    }
    if (extractedInfo.email) {
      confidence += 0.2;
    }
    if (extractedInfo.phone) {
      confidence += 0.1;
    }
    totalFactors += 0.5;

    // Factor 2: Experience information
    if (extractedInfo.experience) {
      confidence += 0.3;
    }
    totalFactors += 0.3;

    // Factor 3: Skills information
    if (extractedInfo.skills && extractedInfo.skills.length > 0) {
      confidence += 0.2;
    }
    totalFactors += 0.2;

    return totalFactors > 0 ? Math.min(confidence / totalFactors, 1) : 0;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  getConversationHistory(): ChatMessage[] {
    return [...this.context.conversationHistory];
  }

  getConversationStage(): string {
    return this.context.conversationStage;
  }

  getExtractedInfo(): any {
    return { ...this.context.extractedInfo };
  }

  getLastActivity(): Date {
    return new Date(this.context.lastActivity);
  }

  // ========================================================================
  // CONVERSATION ANALYSIS
  // ========================================================================

  analyzeConversation(): {
    messageCount: number;
    averageResponseTime: number;
    conversationQuality: number;
    engagementLevel: number;
  } {
    const messageCount = this.context.conversationHistory.length;

    // Calculate average response time (simplified)
    const averageResponseTime = messageCount > 1 ? 5000 : 0; // Mock value

    // Calculate conversation quality based on extracted info
    const conversationQuality = this.calculateConfidence(
      this.context.extractedInfo
    );

    // Calculate engagement level based on message frequency
    const engagementLevel = Math.min(messageCount / 10, 1);

    return {
      messageCount,
      averageResponseTime,
      conversationQuality,
      engagementLevel,
    };
  }

  // ========================================================================
  // CONVERSATION RESET
  // ========================================================================

  resetConversation(): void {
    this.context = {
      conversationHistory: [],
      extractedInfo: {},
      conversationStage: "initial",
      lastActivity: new Date(),
    };
  }
}
