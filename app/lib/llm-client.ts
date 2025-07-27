import OpenAI from "openai";
import { ConversationContext, LLMResponse } from "./types";

// ============================================================================
// LLM CLIENT CLASS
// ============================================================================

export class LLMClient {
  private openai: OpenAI;
  private model: string = "gpt-4o-mini";
  private maxTokens: number = 1000;
  private temperature: number = 0.7;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  // ========================================================================
  // MAIN MESSAGE PROCESSING
  // ========================================================================

  async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<string> {
    try {
      // Build the conversation prompt
      const prompt = this.buildPrompt(message, context);

      // Generate response using OpenAI
      const response = await this.generateResponse(prompt);

      return response;
    } catch (error) {
      console.error("Error processing message with LLM:", error);
      return this.getFallbackResponse(message, context);
    }
  }

  // ========================================================================
  // PROMPT ENGINEERING
  // ========================================================================

  private buildPrompt(message: string, context: ConversationContext): string {
    const jobContext = context.jobContext;
    const candidateProfile = context.candidateProfile;
    const conversationHistory = context.conversationHistory;
    const conversationStage = context.conversationStage;

    // System prompt for job-specific responses
    const systemPrompt = this.buildSystemPrompt(jobContext, conversationStage);

    // Conversation history
    const conversationContext =
      this.buildConversationContext(conversationHistory);

    // Candidate profile context
    const profileContext = this.buildProfileContext(candidateProfile);

    // Current message
    const currentMessage = `User: ${message}`;

    // Combine all parts
    const fullPrompt = `${systemPrompt}

${profileContext}

${conversationContext}

${currentMessage}

Assistant:`;

    return fullPrompt;
  }

  private buildSystemPrompt(
    jobContext: any,
    conversationStage: string
  ): string {
    const jobTitle = jobContext.title;
    const company = jobContext.company;
    const requirements = jobContext.requirements.join(", ");
    const responsibilities = jobContext.responsibilities.join(", ");

    let stageSpecificInstructions = "";

    switch (conversationStage) {
      case "greeting":
        stageSpecificInstructions = `
- Greet the candidate warmly and introduce yourself as a recruitment assistant
- Briefly mention the job opportunity (${jobTitle} at ${company})
- Ask how they heard about the position
- Keep the tone friendly and professional`;
        break;

      case "information_gathering":
        stageSpecificInstructions = `
- Ask for their name and contact information
- Inquire about their current role and experience
- Ask about their key skills and technologies they work with
- Be conversational and make them feel comfortable`;
        break;

      case "qualification_assessment":
        stageSpecificInstructions = `
- Ask specific questions about their experience with required technologies
- Inquire about their experience with similar responsibilities
- Ask about their achievements and projects
- Assess their fit for the role requirements`;
        break;

      case "salary_negotiation":
        stageSpecificInstructions = `
- Ask about their salary expectations
- Discuss the salary range for the position
- Inquire about their notice period and availability
- Be transparent about compensation details`;
        break;

      case "wrapping_up":
        stageSpecificInstructions = `
- Summarize the key points discussed
- Ask if they have any questions about the role
- Provide next steps in the hiring process
- Thank them for their time and interest`;
        break;

      default:
        stageSpecificInstructions = `
- Engage naturally with the candidate
- Ask relevant questions based on the conversation flow
- Provide helpful information about the role
- Maintain a professional yet friendly tone`;
    }

    return `You are a recruitment assistant for ${company}, helping to engage with candidates for the ${jobTitle} position.

Job Requirements: ${requirements}
Key Responsibilities: ${responsibilities}

Your role is to:
- Engage candidates in natural conversation
- Extract relevant information about their qualifications
- Provide information about the job opportunity
- Assess candidate fit for the position
- Maintain a professional and friendly tone

${stageSpecificInstructions}

Important guidelines:
- Be conversational and engaging
- Ask one question at a time
- Listen to their responses and ask follow-up questions
- Provide relevant information about the role when appropriate
- Keep responses concise but informative
- Always be professional and respectful`;
  }

  private buildConversationContext(conversationHistory: any[]): string {
    if (conversationHistory.length === 0) {
      return "This is the beginning of the conversation.";
    }

    const recentMessages = conversationHistory.slice(-6); // Last 6 messages
    const context = recentMessages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    return `Recent conversation:
${context}`;
  }

  private buildProfileContext(candidateProfile: any): string {
    const profile = candidateProfile;
    let context = "Candidate Profile:";

    if (profile.name) context += `\n- Name: ${profile.name}`;
    if (profile.email) context += `\n- Email: ${profile.email}`;
    if (
      profile.experience &&
      (profile.experience.years > 0 || profile.experience.months > 0)
    ) {
      context += `\n- Experience: ${profile.experience.years} years, ${profile.experience.months} months`;
    }
    if (profile.skills && profile.skills.length > 0) {
      const skills = profile.skills.map((s: any) => s.name).join(", ");
      context += `\n- Skills: ${skills}`;
    }
    if (profile.location && profile.location.current) {
      context += `\n- Location: ${profile.location.current}`;
    }

    return context;
  }

  // ========================================================================
  // OPENAI API INTEGRATION
  // ========================================================================

  private async generateResponse(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful recruitment assistant. Respond naturally and conversationally.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response received from OpenAI");
      }

      return response.trim();
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  // ========================================================================
  // FALLBACK RESPONSES
  // ========================================================================

  private getFallbackResponse(
    message: string,
    context: ConversationContext
  ): string {
    const conversationStage = context.conversationStage;

    switch (conversationStage) {
      case "greeting":
        return "Hello! Thank you for your interest in the position. I'm here to help you learn more about the role and answer any questions you might have. How did you hear about this opportunity?";

      case "information_gathering":
        return "I'd love to learn more about your background. Could you tell me a bit about your current role and experience?";

      case "qualification_assessment":
        return "That's great to hear about your experience. Could you tell me more about your technical skills and the technologies you work with?";

      case "salary_negotiation":
        return "Thank you for sharing that information. What are your salary expectations for this role?";

      case "wrapping_up":
        return "Thank you for taking the time to speak with me today. Do you have any questions about the role or the next steps in the process?";

      default:
        return "I appreciate your message. Could you tell me a bit more about your background and what interests you about this position?";
    }
  }

  // ========================================================================
  // CONFIGURATION METHODS
  // ========================================================================

  setModel(model: string): void {
    this.model = model;
  }

  setMaxTokens(maxTokens: number): void {
    this.maxTokens = Math.max(1, Math.min(4000, maxTokens));
  }

  setTemperature(temperature: number): void {
    this.temperature = Math.max(0, Math.min(2, temperature));
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async testConnection(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      return false;
    }
  }

  getUsageInfo(): {
    model: string;
    maxTokens: number;
    temperature: number;
  } {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    };
  }

  // ========================================================================
  // RATE LIMITING AND RETRY LOGIC
  // ========================================================================

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.code === "invalid_api_key" ||
          error.code === "insufficient_quota"
        ) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // ========================================================================
  // PROMPT OPTIMIZATION
  // ========================================================================

  optimizePrompt(prompt: string): string {
    // Remove extra whitespace
    let optimized = prompt.replace(/\s+/g, " ").trim();

    // Ensure prompt doesn't exceed token limits
    const estimatedTokens = Math.ceil(optimized.length / 4);
    if (estimatedTokens > 3000) {
      optimized = optimized.substring(0, 12000); // Approximate character limit
    }

    return optimized;
  }
}
