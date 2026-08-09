import type { Metadata } from "next";

import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "المحادثة",
  description: "تحدّث مع M9 AI بالعربية وأنجز مهامك اليومية.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const user = await requireUser();

  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, title: true, updatedAt: true },
  });

  // An id in the query string is only honoured if it belongs to this user.
  const activeId =
    c && conversations.some((conversation) => conversation.id === c) ? c : null;

  const messages = activeId
    ? await db.message.findMany({
        where: { conversationId: activeId },
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true },
      })
    : [];

  return (
    <ChatWorkspace
      conversations={conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        updatedAt: conversation.updatedAt.toISOString(),
      }))}
      activeId={activeId}
      messages={messages}
    />
  );
}
