import "server-only";

import { getEnv } from "@/lib/env";
import type { AIProvider } from "@/services/ai/types";

import { AnthropicProvider } from "./providers/anthropic";
import { MockProvider } from "./providers/mock";

let cached: AIProvider | null = null;

/**
 * Provider selection lives behind this single function — swapping vendors means
 * adding a class here, not touching any route or component.
 * Falls back to the mock provider whenever a real key is absent, so the whole
 * product runs offline.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const env = getEnv();

  if (env.AI_PROVIDER === "anthropic" && env.AI_API_KEY) {
    cached = new AnthropicProvider(env.AI_API_KEY, env.AI_MODEL);
    return cached;
  }

  // A configured key that goes unused is almost always a mistake, and silently
  // serving mock output makes it look like the model is simply answering badly.
  if (env.AI_API_KEY && env.AI_PROVIDER !== "anthropic") {
    console.warn(
      JSON.stringify({
        level: "warn",
        message:
          'AI_API_KEY is set but AI_PROVIDER is not "anthropic" — falling back to the mock provider. Set AI_PROVIDER="anthropic" to use the real one.',
        timestamp: new Date().toISOString(),
      })
    );
  }

  cached = new MockProvider();
  return cached;
}

export function isMockProvider(): boolean {
  return getAIProvider().name === "mock";
}
