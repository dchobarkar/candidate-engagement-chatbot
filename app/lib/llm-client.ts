import OpenAI from "openai";
import {
  ChatMessage,
  JobDescription,
  CandidateProfile,
  ConversationStage,
} from "./types";
import { Logger } from "./logger";

export interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  maxRetries: number;
  retryDelay: number;
}

export interface ConversationContext {
  messages: ChatMessage[];
  jobDescription: JobDescription;
  candidateProfile?: CandidateProfile;
  stage: ConversationStage;
  extractedInfo: Record<string, any>;
}

export interface LLMResponse {
  content: string;
  confidence: number;
  extractedData?: Record<string, any>;
  suggestedStage?: ConversationStage;
  followUpQuestions?: string[];
}

export class LLMClient {
  private client: OpenAI;
  private config: LLMConfig;
  private logger: Logger;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: LLMConfig) {
    this.config = config;
    this.logger = Logger.getInstance();

    if (!config.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: false, // Ensure API key is not exposed to browser
    });

    this.logger.info("LLMClient initialized", { model: config.model });
  }

  /**
   * Process a user message and generate a contextual response
   */
  async processMessage(
    userMessage: string,
    context: ConversationContext
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Check rate limiting
      this.checkRateLimit();

      // Build the prompt based on context
      const prompt = this.buildPrompt(userMessage, context);

      // Generate response from OpenAI
      const response = await this.generateResponse(prompt, context);

      // Post-process the response
      const processedResponse = this.postProcessResponse(response, context);

      const processingTime = Date.now() - startTime;
      this.logger.info("Message processed successfully", {
        processingTime,
        messageLength: userMessage.length,
        responseLength: processedResponse.content.length,
        confidence: processedResponse.confidence,
      });

      return processedResponse;
    } catch (error) {
      this.logger.error("Error processing message", { error, userMessage });

      // Return fallback response
      return this.generateFallbackResponse(userMessage, context, error);
    }
  }

  /**
   * Build context-aware prompt for the LLM
   */
  private buildPrompt(
    userMessage: string,
    context: ConversationContext
  ): string {
    const { jobDescription, candidateProfile, stage, extractedInfo } = context;

    let prompt = `You are a professional HR chatbot specializing in candidate engagement for the position of ${
      jobDescription.title
    } at ${jobDescription.company}.

Job Requirements:
- Title: ${jobDescription.title}
- Company: ${jobDescription.company}
- Type: ${jobDescription.type}
- Experience: ${jobDescription.experience} years
- Skills: ${jobDescription.skills.join(", ")}
- Salary: ${jobDescription.salary.min}-${jobDescription.salary.max} ${
      jobDescription.salary.currency
    }
- Location: ${jobDescription.location}
- Remote: ${jobDescription.remote ? "Yes" : "No"}

Current Conversation Stage: ${stage}

`;

    // Add candidate profile if available
    if (candidateProfile) {
      prompt += `Candidate Information:
- Name: ${candidateProfile.name || "Not provided"}
- Experience: ${candidateProfile.experience || "Not specified"}
- Skills: ${candidateProfile.skills?.join(", ") || "Not specified"}
- Education: ${candidateProfile.education || "Not specified"}
- Salary Expectation: ${candidateProfile.salaryExpectation || "Not specified"}

`;
    }

    // Add extracted information
    if (Object.keys(extractedInfo).length > 0) {
      prompt += `Previously Extracted Information:
${Object.entries(extractedInfo)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

`;
    }

    // Add stage-specific instructions
    prompt += this.getStageSpecificInstructions(stage);

    // Add the user message
    prompt += `\nUser Message: "${userMessage}"

Please provide a helpful, professional response that:
1. Addresses the user's question or concern
2. Provides relevant information about the job
3. Extracts any candidate information mentioned
4. Maintains a conversational, engaging tone
5. Guides the conversation toward qualification assessment

Response:`;

    return prompt;
  }

  /**
   * Get stage-specific instructions for the LLM
   */
  private getStageSpecificInstructions(stage: ConversationStage): string {
    switch (stage) {
      case "greeting":
        return `\nInstructions for Greeting Stage:
- Welcome the candidate warmly
- Introduce the position briefly
- Ask about their interest in the role
- Begin gathering basic information\n`;

      case "qualification":
        return `\nInstructions for Qualification Stage:
- Ask specific questions about experience and skills
- Probe for relevant background information
- Assess fit for the position
- Gather detailed qualifications\n`;

      case "assessment":
        return `\nInstructions for Assessment Stage:
- Evaluate candidate fit based on gathered information
- Ask clarifying questions if needed
- Provide feedback on qualifications
- Suggest next steps\n`;

      case "closing":
        return `\nInstructions for Closing Stage:
- Summarize the conversation
- Provide clear next steps
- Thank the candidate
- Offer to answer any final questions\n`;

      default:
        return `\nInstructions for General Stage:
- Be helpful and informative
- Extract relevant candidate information
- Guide the conversation appropriately
- Maintain professional engagement\n`;
    }
  }

  /**
   * Generate response from OpenAI API
   */
  private async generateResponse(
    prompt: string,
    context: ConversationContext
  ): Promise<OpenAI.Chat.ChatCompletion> {
    const maxRetries = this.config.maxRetries;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.requestCount++;
        this.lastRequestTime = Date.now();

        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content:
                "You are a professional HR chatbot. Respond concisely and professionally.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        return response;
      } catch (error: any) {
        lastError = error;

        if (error.status === 429) {
          // Rate limit error
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          this.logger.warn(`Rate limited, retrying in ${delay}ms`, {
            attempt,
            delay,
          });
          await this.delay(delay);
        } else if (error.status >= 500) {
          // Server error
          const delay = this.config.retryDelay * attempt;
          this.logger.warn(`Server error, retrying in ${delay}ms`, {
            attempt,
            delay,
          });
          await this.delay(delay);
        } else {
          // Non-retryable error
          break;
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  /**
   * Post-process the LLM response
   */
  private postProcessResponse(
    response: OpenAI.Chat.ChatCompletion,
    context: ConversationContext
  ): LLMResponse {
    const content =
      response.choices[0]?.message?.content ||
      "I apologize, but I'm experiencing technical difficulties.";

    // Calculate confidence based on response quality
    const confidence = this.calculateConfidence(content, context);

    // Extract any structured data mentioned
    const extractedData = this.extractStructuredData(content);

    // Determine suggested next stage
    const suggestedStage = this.suggestNextStage(content, context.stage);

    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(content, context);

    return {
      content,
      confidence,
      extractedData,
      suggestedStage,
      followUpQuestions,
    };
  }

  /**
   * Calculate confidence score for the response
   */
  private calculateConfidence(
    content: string,
    context: ConversationContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for longer, more detailed responses
    if (content.length > 100) confidence += 0.1;
    if (content.length > 200) confidence += 0.1;

    // Increase confidence for job-specific content
    if (
      content.toLowerCase().includes(context.jobDescription.title.toLowerCase())
    )
      confidence += 0.1;
    if (
      content
        .toLowerCase()
        .includes(context.jobDescription.company.toLowerCase())
    )
      confidence += 0.1;

    // Increase confidence for professional tone
    const professionalWords = [
      "experience",
      "skills",
      "qualifications",
      "position",
      "role",
      "company",
    ];
    const professionalCount = professionalWords.filter((word) =>
      content.toLowerCase().includes(word)
    ).length;
    confidence += professionalCount * 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract structured data from response content
   */
  private extractStructuredData(content: string): Record<string, any> {
    const data: Record<string, any> = {};

    // Extract email addresses
    const emailMatch = content.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    );
    if (emailMatch) data.email = emailMatch[0];

    // Extract phone numbers
    const phoneMatch = content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) data.phone = phoneMatch[0];

    // Extract years of experience
    const experienceMatch = content.match(
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i
    );
    if (experienceMatch) data.experience = parseInt(experienceMatch[1]);

    // Extract salary expectations
    const salaryMatch = content.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)/i);
    if (salaryMatch) data.salaryExpectation = salaryMatch[0];

    return data;
  }

  /**
   * Suggest the next conversation stage
   */
  private suggestNextStage(
    content: string,
    currentStage: ConversationStage
  ): ConversationStage {
    const contentLower = content.toLowerCase();

    // Analyze content to suggest next stage
    if (currentStage === "greeting") {
      if (
        contentLower.includes("experience") ||
        contentLower.includes("skills")
      ) {
        return "qualification";
      }
    } else if (currentStage === "qualification") {
      if (
        contentLower.includes("assess") ||
        contentLower.includes("evaluate")
      ) {
        return "assessment";
      }
    } else if (currentStage === "assessment") {
      if (
        contentLower.includes("next step") ||
        contentLower.includes("follow up")
      ) {
        return "closing";
      }
    }

    return currentStage; // Stay in current stage if unclear
  }

  /**
   * Generate follow-up questions based on response
   */
  private generateFollowUpQuestions(
    content: string,
    context: ConversationContext
  ): string[] {
    const questions: string[] = [];
    const contentLower = content.toLowerCase();

    // Generate questions based on missing information
    if (
      !context.candidateProfile?.experience &&
      !contentLower.includes("experience")
    ) {
      questions.push("How many years of experience do you have in this field?");
    }

    if (!context.candidateProfile?.skills && !contentLower.includes("skills")) {
      questions.push("What are your key technical skills?");
    }

    if (
      !context.candidateProfile?.education &&
      !contentLower.includes("education")
    ) {
      questions.push("What is your educational background?");
    }

    if (
      !context.candidateProfile?.salaryExpectation &&
      !contentLower.includes("salary")
    ) {
      questions.push("What are your salary expectations for this role?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }

  /**
   * Generate fallback response when API fails
   */
  private generateFallbackResponse(
    userMessage: string,
    context: ConversationContext,
    error: any
  ): LLMResponse {
    this.logger.warn("Using fallback response", { error: error.message });

    let fallbackContent =
      "I apologize, but I'm experiencing technical difficulties. ";

    // Provide basic fallback based on context
    if (context.stage === "greeting") {
      fallbackContent += `Welcome! I\'m here to help you learn more about the ${context.jobDescription.title} position at ${context.jobDescription.company}. How can I assist you today?`;
    } else if (context.stage === "qualification") {
      fallbackContent += `I\'d like to learn more about your background. Could you tell me about your experience and skills?`;
    } else {
      fallbackContent += `I\'m here to help. Could you please rephrase your question?`;
    }

    return {
      content: fallbackContent,
      confidence: 0.3, // Low confidence for fallback
      followUpQuestions: ["Could you please rephrase your question?"],
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Simple rate limiting: max 10 requests per minute
    if (timeSinceLastRequest < 6000 && this.requestCount > 10) {
      throw new Error(
        "Rate limit exceeded. Please wait before making another request."
      );
    }

    // Reset counter if more than a minute has passed
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info("LLM configuration updated", { newConfig });
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      this.logger.info("OpenAI API connection successful");
      return true;
    } catch (error) {
      this.logger.error("OpenAI API connection failed", { error });
      return false;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };
  }
}

// Default configuration
export const defaultLLMConfig: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-3.5-turbo",
  maxTokens: 500,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};

// Create singleton instance
let llmClientInstance: LLMClient | null = null;

export function getLLMClient(config?: Partial<LLMConfig>): LLMClient {
  if (!llmClientInstance) {
    const finalConfig = { ...defaultLLMConfig, ...config };
    llmClientInstance = new LLMClient(finalConfig);
  }
  return llmClientInstance;
}
