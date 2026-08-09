import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { assertWithinQuota, recordUsage } from "@/lib/usage";
import { getAIProvider } from "@/services/ai";
import { buildChatSystemPrompt } from "@/services/ai/tools/prompts";
import { loadPromptContext } from "@/services/generation";
import type { AIMessage } from "@/services/ai/types";

/** How many prior turns are replayed to the provider. */
const HISTORY_LIMIT = 20;

export async function assertConversationOwner(
  conversationId: string,
  userId: string
): Promise<void> {
  const found = await db.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true },
  });
  if (!found) throw new AppError("NOT_FOUND", "المحادثة غير موجودة.");
}

export interface SendMessageResult {
  reply: string;
  conversationId: string;
}

export async function sendChatMessage(
  userId: string,
  conversationId: string,
  content: string
): Promise<SendMessageResult> {
  await checkRateLimit(`chat:${userId}`, RATE_LIMITS.ai, "ai");
  await assertConversationOwner(conversationId, userId);
  await assertWithinQuota(userId, "chatMessages");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 8000) {
    throw new AppError("VALIDATION_ERROR", "الرسالة فارغة أو أطول من المسموح.");
  }

  const history = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { role: true, content: true },
  });

  const messages: AIMessage[] = history
    .reverse()
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  messages.push({ role: "user", content: trimmed });

  await db.message.create({
    data: { conversationId, role: "USER", content: trimmed },
  });

  const context = await loadPromptContext(userId);
  const provider = getAIProvider();

  const result = await provider.complete({
    system: buildChatSystemPrompt(context),
    messages,
    maxTokens: 4000,
  });

  await db.$transaction([
    db.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: result.text,
        tokens: result.tokensOut,
      },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  // The first exchange names the conversation so the sidebar is scannable.
  const count = await db.message.count({ where: { conversationId } });
  if (count <= 2) {
    await db.conversation.update({
      where: { id: conversationId },
      data: { title: trimmed.slice(0, 60) },
    });
  }

  await recordUsage(userId, "chatMessages", result.tokensIn + result.tokensOut);

  return { reply: result.text, conversationId };
}
