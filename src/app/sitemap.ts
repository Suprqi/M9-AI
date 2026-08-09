import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/env";
import { TOOLS } from "@/services/ai/tools/definitions";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/login", "/register"].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const toolAnchors = TOOLS.map((tool) => ({
    url: `${APP_URL}/#tool-${tool.key}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...toolAnchors];
}
