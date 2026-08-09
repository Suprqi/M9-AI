"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { assertConversationOwner, sendChatMessage } from "@/services/chat";

export interface ConversationResult {
  ok: boolean;
  conversationId?: string;
  message?: string;
}

export async function createConversationAction(): Promise<ConversationResult> {
  try {
    const user = await requireUser();
    await checkRateLimit(`conv:${user.id}`, RATE_LIMITS.write, "write");

    const conversation = await db.conversation.create({
      data: { userId: user.id },
      select: { id: true },
    });

    revalidatePath("/ai");
    return { ok: true, conversationId: conversation.id };
  } catch (error) {
    const safe = toPublicError(error, "createConversationAction");
    return { ok: false, message: safe.message };
  }
}

export async function deleteConversationAction(
  conversationId: string
): Promise<ConversationResult> {
  try {
    const user = await requireUser();
    await assertConversationOwner(conversationId, user.id);

    await db.conversation.delete({ where: { id: conversationId } });

    revalidatePath("/ai");
    return { ok: true };
  } catch (error) {
    const safe = toPublicError(error, "deleteConversationAction");
    return { ok: false, message: safe.message };
  }
}

const titleSchema = z.string().trim().min(1).max(120);

export async function renameConversationAction(
  conversationId: string,
  title: string
): Promise<ConversationResult> {
  try {
    const user = await requireUser();
    await assertConversationOwner(conversationId, user.id);

    const parsed = titleSchema.safeParse(title);
    if (!parsed.success) {
      return { ok: false, message: "أدخل عنوانًا صالحًا." };
    }

    await db.conversation.update({
      where: { id: conversationId },
      data: { title: parsed.data },
    });

    revalidatePath("/ai");
    return { ok: true, conversationId };
  } catch (error) {
    const safe = toPublicError(error, "renameConversationAction");
    return { ok: false, message: safe.message };
  }
}

export interface SendResult {
  ok: boolean;
  reply?: string;
  message?: string;
  requestId?: string;
}

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<SendResult> {
  let userId: string | undefined;
  try {
    const user = await requireUser();
    userId = user.id;

    const result = await sendChatMessage(user.id, conversationId, content);
    revalidatePath("/ai");
    return { ok: true, reply: result.reply };
  } catch (error) {
    const safe = toPublicError(error, "sendMessageAction", userId);
    return { ok: false, message: safe.message, requestId: safe.requestId };
  }
}
