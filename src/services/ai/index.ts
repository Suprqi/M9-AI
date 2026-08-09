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
  } else {
    cached = new MockProvider();
  }

  return cached;
}

export function isMockProvider(): boolean {
  return getAIProvider().name === "mock";
}
