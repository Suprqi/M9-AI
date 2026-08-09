import {
  FileText,
  Mail,
  Megaphone,
  MessageCircle,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { ToolIconKey } from "@/services/ai/tools/definitions";

const ICONS: Record<ToolIconKey, LucideIcon> = {
  "file-text": FileText,
  scale: Scale,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  mail: Mail,
  sparkles: Sparkles,
};

export function ToolIcon({
  name,
  className,
}: {
  name: ToolIconKey;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
