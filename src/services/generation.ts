import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { assertWithinQuota, recordUsage } from "@/lib/usage";
import { PLANS, type PlanKey } from "@/config/plans";
import { getAIProvider } from "@/services/ai";
import { buildPrompt, type PromptContext } from "@/services/ai/tools/prompts";
import { getTool } from "@/services/ai/tools/definitions";
import { validateToolInput } from "@/services/ai/tools/schema";

export async function loadPromptContext(userId: string): Promise<PromptContext> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      company: { select: { name: true, industry: true, tone: true } },
      aiPreference: {
        select: { writingStyle: true, responseTone: true, customContext: true },
      },
    },
  });

  return {
    companyName: user?.company?.name ?? null,
    companyIndustry: user?.company?.industry ?? null,
    companyTone: user?.company?.tone ?? null,
    writingStyle: user?.aiPreference?.writingStyle,
    responseTone: user?.aiPreference?.responseTone,
    customContext: user?.aiPreference?.customContext ?? null,
  };
}

export interface RunToolParams {
  userId: string;
  plan: PlanKey;
  toolKey: string;
  rawInput: unknown;
  projectId?: string | null;
}

export interface RunToolResult {
  generationId: string;
  output: string;
  provider: string;
  model: string;
}

/**
 * The single entry point for tool generation. Every guard — rate limit, plan
 * gate, quota — runs here on the server before the provider is touched.
 */
export async function runTool(params: RunToolParams): Promise<RunToolResult> {
  const tool = getTool(params.toolKey);
  if (!tool) throw new AppError("NOT_FOUND", "الأداة المطلوبة غير موجودة.");

  await checkRateLimit(`ai:${params.userId}`, RATE_LIMITS.ai, "ai");

  if (tool.proOnly && !PLANS[params.plan].limits.allTools) {
    throw new AppError(
      "QUOTA_EXCEEDED",
      `أداة "${tool.name}" متاحة في خطة احترافي وما فوق.`
    );
  }

  const validated = validateToolInput(params.toolKey, params.rawInput);
  if (!validated.ok) {
    throw new AppError("VALIDATION_ERROR", "تحقق من الحقول المطلوبة ثم حاول مرة أخرى.");
  }

  await assertWithinQuota(params.userId, "generations");

  if (params.projectId) {
    const owns = await db.project.findFirst({
      where: { id: params.projectId, ownerId: params.userId },
      select: { id: true },
    });
    if (!owns) throw new AppError("FORBIDDEN");
  }

  const context = await loadPromptContext(params.userId);
  const { system, user } = buildPrompt(tool, validated.data, context);
  const provider = getAIProvider();

  const startedAt = Date.now();
  try {
    const result = await provider.complete({
      system,
      messages: [{ role: "user", content: user }],
      toolKey: tool.key,
      toolInput: validated.data,
      maxTokens: 8000,
    });

    const generation = await db.generation.create({
      data: {
        toolKey: tool.key,
        status: "SUCCESS",
        provider: result.provider,
        model: result.model,
        input: validated.data,
        output: result.text,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        durationMs: Date.now() - startedAt,
        userId: params.userId,
        projectId: params.projectId ?? null,
      },
      select: { id: true },
    });

    await recordUsage(params.userId, "generations", result.tokensIn + result.tokensOut);

    return {
      generationId: generation.id,
      output: result.text,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    await db.generation
      .create({
        data: {
          toolKey: tool.key,
          status: "FAILED",
          provider: provider.name,
          model: provider.model,
          input: validated.data,
          output: "",
          errorCode: error instanceof AppError ? error.code : "INTERNAL_ERROR",
          durationMs: Date.now() - startedAt,
          userId: params.userId,
          projectId: params.projectId ?? null,
        },
      })
      .catch(() => undefined);

    throw error;
  }
}
