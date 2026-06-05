"use client";

import { Badge } from "@/components/ui/badge";
import { AI_PROVIDERS } from "@/config/ai-providers";

interface ProviderBadgeProps {
  provider: string;
  className?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  deepseek: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  xai: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  openrouter: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  replicate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  fal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function ProviderBadge({ provider, className }: ProviderBadgeProps) {
  const name = AI_PROVIDERS[provider]?.name || provider;
  const colorClass = PROVIDER_COLORS[provider] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <Badge variant="outline" className={`text-xs font-medium border-0 ${colorClass} ${className || ""}`}>
      {name}
    </Badge>
  );
}
