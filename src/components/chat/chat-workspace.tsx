"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import {
  createConversationAction,
  deleteConversationAction,
  renameConversationAction,
  sendMessageAction,
} from "@/server/actions/chat";
import { cn, formatRelative } from "@/lib/utils";

export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}

const SUGGESTIONS = [
  "اكتب لي رسالة متابعة لعميل لم يرد على عرض السعر",
  "اقترح ٥ أفكار منشورات لمتجر عطور في الرياض",
  "لخّص لي بنود عقد إيجار تجاري بلغة بسيطة",
];

export function ChatWorkspace({
  conversations,
  activeId,
  messages,
}: {
  conversations: ChatConversation[];
  activeId: string | null;
  messages: ChatMessage[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // The optimistic bubble is derived, not synced: it only renders while the
  // send transition is in flight. Once the transition settles, `messages`
  // already contains the persisted turn, so there is nothing to clear.
  const visible = pending ? [...messages, ...optimistic] : messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible.length, pending]);

  const filtered = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  function newConversation() {
    startTransition(async () => {
      const result = await createConversationAction();
      if (!result.ok || !result.conversationId) {
        toast.error(result.message ?? "تعذر إنشاء محادثة.");
        return;
      }
      router.push(`/ai?c=${result.conversationId}`);
      router.refresh();
    });
  }

  function send(text: string) {
    const content = text.trim();
    if (!content) return;

    startTransition(async () => {
      let conversationId = activeId;

      if (!conversationId) {
        const created = await createConversationAction();
        if (!created.ok || !created.conversationId) {
          toast.error(created.message ?? "تعذر إنشاء محادثة.");
          return;
        }
        conversationId = created.conversationId;
        router.push(`/ai?c=${conversationId}`);
      }

      setDraft("");
      setOptimistic([{ id: `tmp-${Date.now()}`, role: "USER", content }]);

      const result = await sendMessageAction(conversationId, content);
      if (!result.ok) {
        setOptimistic([]);
        setDraft(content);
        toast.error(result.message ?? "حدث خطأ أثناء إنشاء المحتوى. حاول مرة أخرى.");
        return;
      }

      router.refresh();
    });
  }

  async function copy(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      toast.success("تم نسخ الرد.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("تعذر النسخ.");
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      {/* conversation list */}
      <aside className="hidden w-72 shrink-0 flex-col border-e border-line bg-ink-900/40 md:flex">
        <div className="space-y-3 p-4">
          <Button className="w-full" onClick={newConversation} disabled={pending}>
            <Plus className="h-4 w-4" />
            محادثة جديدة
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في المحادثات…"
              className="h-10 pe-10 text-sm"
              aria-label="بحث في المحادثات"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-600">
              {conversations.length === 0 ? "لا توجد محادثات بعد." : "لا توجد نتائج."}
            </p>
          ) : (
            filtered.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
              />
            ))
          )}
        </nav>
      </aside>

      {/* thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {visible.length === 0 && !pending ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300 ring-1 ring-inset ring-white/10">
                  <Sparkles className="h-6 w-6" aria-hidden />
                </div>
                <h1 className="text-xl font-bold text-slate-50">
                  اسألني عن أي شيء في عملك
                </h1>
                <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">
                  اكتب طلبك بالعربية وسأساعدك في الصياغة والتحرير والأفكار. للمهام
                  المتكررة، استخدم الأدوات الجاهزة.
                </p>

                <div className="mt-8 grid w-full max-w-lg gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-start text-sm text-slate-300 transition-colors hover:border-brand-500/40 hover:bg-white/[0.06]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {visible.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    copied={copiedId === message.id}
                    onCopy={() => copy(message)}
                  />
                ))}

                {pending ? (
                  <div className="flex gap-3">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-mint-500 text-[11px] font-bold text-white">
                      M9
                    </span>
                    <div className="flex-1 space-y-2 pt-1.5">
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                  </div>
                ) : null}

                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <div className="border-t border-line bg-ink-950/80 backdrop-blur-xl">
          <form
            className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-4 sm:px-6"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              maxLength={8000}
              placeholder="اكتب رسالتك… (Enter للإرسال، Shift+Enter لسطر جديد)"
              aria-label="رسالتك"
              className="max-h-40 min-h-[52px] flex-1 resize-none rounded-xl border border-line-strong bg-ink-900/60 px-4 py-3.5 text-sm leading-6 text-slate-100 placeholder:text-slate-500 focus:border-brand-500"
            />
            <Button
              type="submit"
              size="icon"
              className="h-[52px] w-[52px]"
              disabled={pending || !draft.trim()}
              aria-label="إرسال"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="pb-3 text-center text-[11px] text-slate-600">
            قد ترد النماذج بمعلومات غير دقيقة — راجع المحتوى قبل الاعتماد عليه.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  copied,
  onCopy,
}: {
  message: ChatMessage;
  copied: boolean;
  onCopy: () => void;
}) {
  const isUser = message.role === "USER";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
          isUser
            ? "bg-white/[0.08] text-slate-300"
            : "bg-gradient-to-br from-brand-500 to-mint-500 text-white"
        )}
        aria-hidden
      >
        {isUser ? "أنا" : "M9"}
      </span>

      <div className={cn("min-w-0 max-w-[85%]", isUser && "text-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-brand-500/15 text-slate-100"
              : "border border-line bg-white/[0.03] text-slate-300"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-7">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>

        {!isUser ? (
          <button
            type="button"
            onClick={onCopy}
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-mint-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            نسخ
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
}: {
  conversation: ChatConversation;
  active: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);

  async function rename() {
    setEditing(false);
    if (title.trim() === conversation.title) return;

    const result = await renameConversationAction(conversation.id, title);
    if (!result.ok) {
      setTitle(conversation.title);
      toast.error(result.message ?? "تعذر إعادة التسمية.");
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-xl px-2 transition-colors",
        active ? "bg-brand-500/15" : "hover:bg-white/5"
      )}
    >
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={rename}
          onKeyDown={(event) => {
            if (event.key === "Enter") rename();
            if (event.key === "Escape") {
              setTitle(conversation.title);
              setEditing(false);
            }
          }}
          maxLength={120}
          aria-label="اسم المحادثة"
          className="my-1 w-full rounded-lg bg-ink-900 px-2 py-1.5 text-sm text-slate-100 outline-none"
        />
      ) : (
        <>
          <a
            href={`/ai?c=${conversation.id}`}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5"
          >
            <MessageSquare
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-brand-300" : "text-slate-600"
              )}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate text-sm",
                  active ? "font-medium text-brand-200" : "text-slate-400"
                )}
              >
                {conversation.title}
              </span>
              <span className="block text-[11px] text-slate-600">
                {formatRelative(conversation.updatedAt)}
              </span>
            </span>
          </a>

          <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200"
              aria-label="إعادة تسمية"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <ConfirmDialog
              title="حذف المحادثة"
              description="سيتم حذف المحادثة وجميع رسائلها نهائيًا."
              confirmLabel="حذف"
              trigger={
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-slate-500 hover:text-red-300"
                  aria-label="حذف المحادثة"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              }
              onConfirm={async () => {
                const result = await deleteConversationAction(conversation.id);
                if (!result.ok) {
                  toast.error(result.message ?? "تعذر حذف المحادثة.");
                  return;
                }
                toast.success("تم حذف المحادثة.");
                if (active) router.push("/ai");
                router.refresh();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
