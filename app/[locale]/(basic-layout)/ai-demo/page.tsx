import FeatureBadge from "@/components/shared/FeatureBadge";
import { Link, Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import {
  ArrowRight,
  Bot,
  Film,
  ImageIcon,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "AIDemo",
  });

  return constructMetadata({
    title: t("title"),
    description: t("metaDescription"),
    locale: locale as Locale,
    path: `/ai-demo`,
  });
}

const features = [
  {
    key: "chat" as const,
    href: "/ai-demo/chat",
    icon: MessageSquare,
    gradient: "from-indigo-500 to-purple-600",
    glowColor: "group-hover:shadow-indigo-500/25",
    bgPattern:
      "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/80 via-transparent to-transparent dark:from-indigo-900/20",
    tags: [
      "OpenAI",
      "Anthropic",
      "Google",
      "DeepSeek",
      "xAI",
      "OpenRouter",
      "Custom Provider",
    ],
    stat: "19+",
    statLabel: "Models",
  },
  {
    key: "image" as const,
    href: "/ai-demo/image",
    icon: ImageIcon,
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "group-hover:shadow-emerald-500/25",
    bgPattern:
      "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/80 via-transparent to-transparent dark:from-emerald-900/20",
    tags: ["GPT Image", "Nano Banana", "Grok", "Flux", "KIE"],
    stat: "10+",
    statLabel: "Models",
  },
  {
    key: "video" as const,
    href: "/ai-demo/video",
    icon: Film,
    gradient: "from-rose-500 to-orange-600",
    glowColor: "group-hover:shadow-rose-500/25",
    bgPattern:
      "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/80 via-transparent to-transparent dark:from-rose-900/20",
    tags: ["Seedance", "Kling", "Wan", "Grok", "KIE"],
    stat: "14+",
    statLabel: "Models",
  },
];

export default async function AIHubPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "AIDemo",
  });

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-16 space-y-4">
        <FeatureBadge
          label="AI SDK"
          text="Powered by Vercel AI SDK"
          className="justify-center"
        />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("description")}
        </p>

        {/* Stats + Tagline */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">10</strong> Providers
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">43+</strong> Models
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">3</strong> Modalities
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/70">{t("hub.tagline")}</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((feature) => {
          const Icon = feature.icon;
          const titleKey = `hub.${feature.key}Title` as any;
          const descKey = `hub.${feature.key}Description` as any;

          return (
            <Link
              key={feature.key}
              href={feature.href}
              className={`group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${feature.glowColor}`}
            >
              {/* Gradient top bar */}
              <div
                className={`h-1 w-full bg-linear-to-r ${feature.gradient}`}
              />

              {/* Background pattern */}
              <div
                className={`absolute inset-0 ${feature.bgPattern} pointer-events-none opacity-60`}
              />

              <div className="relative flex flex-col flex-1 p-6">
                {/* Icon + Stat */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-br ${feature.gradient} text-white shadow-lg shadow-black/10`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight">
                      {feature.stat}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {feature.statLabel}
                    </div>
                  </div>
                </div>

                {/* Title + Desc */}
                <h2 className="text-lg font-semibold mb-2">{t(titleKey)}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {t(descKey)}
                </p>

                {/* Provider Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 mt-5 text-sm font-medium text-primary">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
