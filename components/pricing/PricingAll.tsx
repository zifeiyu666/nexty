import { getPublicPricingPlans } from "@/actions/prices/public";
import PricingCTA from "@/components/pricing/PricingCTA";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import type { UnlockSongContext } from "@/lib/ai/song-unlock-after-payment";
import { pricingPlans as pricingPlansSchema } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { PricingPlanFeature, PricingPlanLangJsonb } from "@/types/pricing";
import {
  Check,
  Download,
  Headphones,
  ImageIcon,
  RefreshCw,
  ShieldCheck,
  Video,
  X
} from "lucide-react";
import { getLocale } from "next-intl/server";

type PricingPlan = typeof pricingPlansSchema.$inferSelect;

type DisplayPlan = {
  buttonText: string;
  cardDescription: string;
  cardTitle: string;
  displayPrice: string;
  features: PricingPlanFeature[];
  highlightText?: string;
  id: string;
  isHighlighted?: boolean | null;
  originalPrice?: string | null;
  paymentType?: string | null;
  priceSuffix?: string | null;
  staticCta?: string;
  tone: "single" | "pro" | "platinum";
};

const fallbackPlans: DisplayPlan[] = [
  {
    buttonText: "Start with one song",
    cardDescription: "One song, one occasion, no subscription.",
    displayPrice: "$29.99",
    features: [
      { description: "One song only", included: true, bold: true },
      {
        description: "Personalised lyrics crafted for your occasion",
        included: true,
      },
      { description: "Personalised sharing page", included: true },
      { description: "MP3 Download", included: false },
      { description: "Video gift", included: false },
      { description: "Wall art", included: false },
    ],
    id: "fallback-single-song",
    cardTitle: "Single Song",
    paymentType: "one_time",
    priceSuffix: "one-time",
    staticCta: "One-time payment",
    tone: "single",
  },
  {
    buttonText: "Go Pro",
    cardDescription: "Monthly songs & video gifts, studio quality.",
    displayPrice: "$39.99",
    features: [
      { description: "Create 3 songs monthly", included: true, bold: true },
      { description: "2 video styles per month", included: true },
      { description: "2 wall art per month", included: true },
      { description: "Download songs in MP3 format", included: true },
      { description: "Studio-quality vocals & production", included: true },
      {
        description: "Personalised lyrics crafted for your occasion",
        included: true,
      },
      { description: "Personalised sharing page", included: true },
      { description: "Unique album artwork", included: true },
      { description: "Cancel anytime", included: true },
    ],
    highlightText: "Most Popular",
    id: "fallback-pro",
    isHighlighted: true,
    cardTitle: "Pro",
    paymentType: "recurring",
    priceSuffix: "month",
    staticCta: "Go Pro",
    tone: "pro",
  },
  {
    buttonText: "Go Platinum - Best Value",
    cardDescription: "Unlimited songs + videos. Everything in Pro, and more.",
    displayPrice: "$199.99",
    features: [
      { description: "Create Unlimited songs", included: true, bold: true },
      { description: "10 video styles per month", included: true },
      { description: "10 wall art per month", included: true },
      { description: "Download songs in MP3 format", included: true },
      { description: "Studio-quality vocals & production", included: true },
      {
        description: "Personalised lyrics crafted for your occasion",
        included: true,
      },
      { description: "Personalised sharing page", included: true },
      { description: "Unique album artwork", included: true },
    ],
    highlightText: "Best Value",
    id: "fallback-platinum",
    cardTitle: "Platinum",
    paymentType: "recurring",
    priceSuffix: "year",
    staticCta: "Go Platinum - Best Value",
    tone: "platinum",
  },
];

const addOns = [
  {
    description:
      "Transform your custom song into a breathtaking visual story with your own memories. ",
    icon: Video,
    price: "From $23.99",
    suffix: "per video",
    title: "Cinematic Music Video",
  },
  {
    description:
      "A high-resolution digital design of your custom song lyrics. Ready to download, print, and frame",
    icon: ImageIcon,
    price: "From $7.99",
    suffix: "per print",
    title: "Digital Lyrics Wall Art",
  },
  {
    description:
      "Get a high-quality MP3 download of your custom song . Keep it offline and play it on any device forever.",
    icon: Download,
    price: "From $7",
    suffix: "per song",
    title: "Studio-Quality MP3",
  },
];

const trustItems = [
  {
    description: "Safe and instant verification via Creem",
    icon: ShieldCheck,
    title: "Secure Checkout",
  },
  {
    description: "Tweak your track for free until you’re completely satisfied.",
    icon: RefreshCw,
    title: "100% Satisfaction",
  },
  {
    description: "We're always here if you need a hand along the way",
    icon: Headphones,
    title: "Dedicated Support",
  },
];

export default async function PricingAll({
  unlockSongContext,
}: {
  unlockSongContext?: UnlockSongContext | null;
} = {}) {
  const locale = await getLocale();
  const result = await getPublicPricingPlans();
  const dbPlans = result.success ? result.data || [] : [];

  if (!result.success) {
    console.error("Failed to fetch public pricing plans:", result.error);
  }

  const displayPlans = dbPlans.length
    ? dbPlans.slice(0, 3).map((plan, index) =>
        toDisplayPlan(plan, locale, index)
      )
    : fallbackPlans;

  return (
    <section id="pricing" className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {displayPlans.map((plan) => (
            <PricingGiftCard
              key={plan.id}
              plan={plan}
              unlockSongContext={unlockSongContext}
            />
          ))}
        </div>

        <section className="mt-10 py-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-black tracking-normal text-foreground md:text-3xl">
              限时免费
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Buy these one-off on any song, on any plan. Pro & Platinum
              subscribers already get video styles every month. These are for
              everyone else, or for anything extra.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {addOns.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm"
                  key={item.title}
                >
                  <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-4 min-h-20 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-5 border-t border-border pt-4">
                    <span className="text-2xl font-black text-foreground">
                      {item.price}
                    </span>
                    <span className="ml-2 text-xs font-bold text-muted-foreground">
                      {item.suffix}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="flex items-start gap-3" key={item.title}>
                <Icon className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </section>
  );
}

function toDisplayPlan(
  plan: PricingPlan,
  locale: string,
  index: number
): DisplayPlan & { rawPlan: PricingPlan } {
  const localized =
    (plan.langJsonb as PricingPlanLangJsonb)?.[locale] ||
    (plan.langJsonb as PricingPlanLangJsonb)?.[DEFAULT_LOCALE];
  const fallbackTone = index === 0 ? "single" : index === 1 ? "pro" : "platinum";
  const planFeatures = Array.isArray(plan.features)
    ? (plan.features as PricingPlanFeature[])
    : [];

  return {
    buttonText: localized?.buttonText || plan.buttonText || "Get started",
    cardDescription:
      localized?.cardDescription || plan.cardDescription || "",
    cardTitle: localized?.cardTitle || plan.cardTitle || "Plan",
    displayPrice: localized?.displayPrice || plan.displayPrice || "",
    features: localized?.features || planFeatures,
    highlightText: localized?.highlightText || plan.highlightText || undefined,
    id: plan.id,
    isHighlighted: plan.isHighlighted,
    originalPrice: localized?.originalPrice || plan.originalPrice,
    paymentType: plan.paymentType,
    priceSuffix:
      localized?.priceSuffix?.replace(/^\/+/, "") ||
      plan.priceSuffix?.replace(/^\/+/, ""),
    rawPlan: plan,
    tone: plan.isHighlighted ? "pro" : fallbackTone,
  };
}

function PricingGiftCard({
  plan,
  unlockSongContext,
}: {
  plan: DisplayPlan & { rawPlan?: PricingPlan };
  unlockSongContext?: UnlockSongContext | null;
}) {
  const isPro = plan.tone === "pro";
  const isPlatinum = plan.tone === "platinum";
  const includedFeatures = plan.features.filter((feature) => feature.included);
  const excludedFeatures = plan.features.filter((feature) => !feature.included);

  return (
    <article
      className={cn(
        "relative flex min-h-[560px] flex-col rounded-2xl border p-5 shadow-sm",
        isPro
          ? "border-foreground bg-foreground text-primary-foreground"
          : isPlatinum
            ? "border-primary/30 bg-card"
            : "border-border bg-card"
      )}
    >
      {plan.highlightText && (
        <div
          className={cn(
            "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em]",
            isPro
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {plan.highlightText}
        </div>
      )}

      <p
        className={cn(
          "text-xs font-black uppercase tracking-[0.12em]",
          isPro ? "text-accent" : isPlatinum ? "text-primary" : "text-primary"
        )}
      >
        {plan.cardTitle}
      </p>
      <h3
        className={cn(
          "mt-4 min-h-20 text-xl font-black leading-tight",
          isPro ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {plan.cardDescription}
      </h3>

      <div
        className={cn(
          "my-5 border-t",
          isPro ? "border-primary-foreground/15" : "border-border"
        )}
      />

      <div>
        <span
          className={cn(
            "text-4xl font-black tracking-tight",
            isPro ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {plan.displayPrice}
        </span>
        {plan.priceSuffix && (
          <span
            className={cn(
              "ml-2 text-xs font-bold",
              isPro ? "text-primary-foreground/60" : "text-muted-foreground"
            )}
          >
            / {plan.priceSuffix}
          </span>
        )}
      </div>

      <div
        className={cn(
          "my-5 border-t",
          isPro ? "border-primary-foreground/15" : "border-border"
        )}
      />

      {plan.staticCta && (
        <span
          className={cn(
            "mb-5 inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em]",
            isPro
              ? "bg-primary-foreground/10 text-accent"
              : "bg-primary/10 text-primary"
          )}
        >
          {plan.staticCta}
        </span>
      )}

      <ul className="space-y-3">
        {includedFeatures.map((feature, index) => (
          <FeatureLine
            feature={feature}
            isPro={isPro}
            key={`${feature.description}-${index}`}
          />
        ))}
      </ul>

      {excludedFeatures.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            Not included
          </p>
          <ul className="space-y-2.5">
            {excludedFeatures.map((feature, index) => (
              <FeatureLine
                feature={feature}
                isExcluded
                isPro={isPro}
                key={`${feature.description}-${index}`}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-6">
        {plan.rawPlan ? (
          <PricingCTA
            buttonClassName={cn(
              "h-10 rounded-full text-sm font-black",
              isPro
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : isPlatinum
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-foreground text-primary-foreground hover:bg-foreground/90"
            )}
            localizedPlan={{
              buttonText: plan.buttonText,
            }}
            plan={plan.rawPlan}
            unlockSongContext={unlockSongContext}
          />
        ) : (
          <button
            className={cn(
              "inline-flex h-10 w-full items-center justify-center rounded-full text-sm font-black",
              isPro
                ? "bg-accent text-accent-foreground"
                : "bg-foreground text-primary-foreground"
            )}
            type="button"
          >
            {plan.buttonText}
          </button>
        )}
      </div>
    </article>
  );
}

function FeatureLine({
  feature,
  isExcluded = false,
  isPro,
}: {
  feature: PricingPlanFeature;
  isExcluded?: boolean;
  isPro: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 text-xs font-bold leading-5",
        isExcluded
          ? "text-muted-foreground line-through"
          : isPro
            ? "text-accent"
            : "text-foreground"
      )}
    >
      {isExcluded ? (
        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : (
        <Check
          className={cn(
            "mt-0.5 size-4 shrink-0",
            isPro ? "text-accent" : "text-primary"
          )}
        />
      )}
      <span className={feature.bold ? "font-black" : ""}>
        {feature.description}
      </span>
    </li>
  );
}
