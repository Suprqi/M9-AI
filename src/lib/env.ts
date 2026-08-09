import { z } from "zod";

/**
 * Server-only environment contract. Importing this from a Client Component is a
 * build error by design — secrets must never cross the network boundary.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  AI_PROVIDER: z.enum(["mock", "anthropic"]).default("mock"),
  AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("claude-opus-5"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AI_PROVIDER: process.env.AI_PROVIDER || "mock",
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    // Only the failing variable *names* are surfaced — never their values.
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration: ${missing}`);
  }

  cached = parsed.data;
  return cached;
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
