import Anthropic from "@anthropic-ai/sdk";

import { AppError } from "@/lib/errors";
import type {
  AICompletionRequest,
  AICompletionResult,
  AIProvider,
} from "@/services/ai/types";

/**
 * Real provider, activated only when AI_API_KEY is present. The key is read
 * server-side and never serialized into any response.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;

  private readonly client: Anthropic;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    // `fallbacks: "default"` re-runs a safety-declined request on Anthropic's
    // recommended fallback model. Typed loosely because SDK typings for the
    // beta parameter can lag the API.
    const params = {
      model: this.model,
      max_tokens: request.maxTokens ?? 8000,
      system: request.system,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    };

    let response;
    try {
      response = await this.client.beta.messages.create(
        params as unknown as Parameters<typeof this.client.beta.messages.create>[0]
      );
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new AppError(
          "RATE_LIMITED",
          "الخدمة مشغولة حاليًا. حاول مرة أخرى بعد قليل.",
          "anthropic rate limit"
        );
      }
      throw new AppError("AI_PROVIDER_ERROR", undefined, "anthropic request failed");
    }

    if (!("content" in response)) {
      throw new AppError("AI_PROVIDER_ERROR", undefined, "unexpected provider response");
    }

    if (response.stop_reason === "refusal") {
      throw new AppError(
        "AI_PROVIDER_ERROR",
        "تعذر إنشاء هذا المحتوى. جرّب صياغة الطلب بشكل مختلف.",
        "provider refusal"
      );
    }

    const text = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new AppError("AI_PROVIDER_ERROR", undefined, "empty provider response");
    }

    return {
      text,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
      model: response.model,
      provider: this.name,
    };
  }
}
