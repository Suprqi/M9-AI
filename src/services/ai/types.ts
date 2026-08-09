export type AIRole = "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AICompletionRequest {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Passed through to the mock provider so it can shape deterministic output. */
  toolKey?: string;
  toolInput?: Record<string, string>;
}

export interface AICompletionResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
  provider: string;
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  complete(request: AICompletionRequest): Promise<AICompletionResult>;
}
