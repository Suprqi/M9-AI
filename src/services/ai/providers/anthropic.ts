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
/** Models that accept the server-side `fallbacks` parameter. */
const FALLBACK_CAPABLE = ["claude-opus-5", "claude-fable-5", "claude-mythos-5"];

function supportsFallbacks(model: string): boolean {
  return FALLBACK_CAPABLE.some((m) => model.startsWith(m));
}

function isUnsupportedFallbackError(error: unknown): boolean {
  return (
    error instanceof Anthropic.BadRequestError &&
    typeof error.message === "string" &&
    error.message.includes("fallbacks")
  );
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;

  private readonly client: Anthropic;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  /** SDK typings lag the beta parameters, so the payload is cast at the edge. */
  private send(params: Record<string, unknown>) {
    return this.client.beta.messages.create(
      params as unknown as Parameters<typeof this.client.beta.messages.create>[0]
    );
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    const baseParams = {
      model: this.model,
      max_tokens: request.maxTokens ?? 8000,
      system: request.system,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      output_config: { effort: "medium" },
    };

    // `fallbacks: "default"` re-runs a safety-declined request on Anthropic's
    // recommended model, but only some models accept the parameter — sending it
    // to one that doesn't is a hard 400, so it is opt-in per model.
    const params = supportsFallbacks(this.model)
      ? {
          ...baseParams,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        }
      : baseParams;

    let response;
    try {
      response = await this.send(params);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new AppError(
          "RATE_LIMITED",
          "الخدمة مشغولة حاليًا. حاول مرة أخرى بعد قليل.",
          "anthropic rate limit"
        );
      }

      // Belt-and-braces: if a future model drops `fallbacks`, degrade to a plain
      // request rather than failing the user's generation outright.
      if (isUnsupportedFallbackError(error)) {
        response = await this.send(baseParams).catch(() => {
          throw new AppError("AI_PROVIDER_ERROR", undefined, "anthropic retry failed");
        });
      } else {
        throw new AppError("AI_PROVIDER_ERROR", undefined, "anthropic request failed");
      }
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
