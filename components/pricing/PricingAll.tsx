import { getPublicPricingPlans } from "@/actions/prices/public";
import PricingCTA from "@/components/pricing/PricingCTA";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { MusicVideoStudioCta } from "@/components/song/MusicVideoStudioCta";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { WallArtStudioCta } from "@/components/song/WallArtStudioCta";
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
import { getLocale, getTranslations } from "next-intl/server";

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

type InteractiveAddOn = {
  ctaLabel: string;
  description: string;
  icon: typeof Video;
  originalPrice: string;
  promoLabel: string;
  suffix: string;
  title: string;
  trigger: "music-video" | "wall-art";
};

type StaticAddOn = {
  description: string;
  icon: typeof Video;
  originalPrice: string;
  promoLabel: string;
  suffix: string;
  title: string;
};

function isInteractiveAddOn(
  item: InteractiveAddOn | StaticAddOn,
): item is InteractiveAddOn {
  return "trigger" in item;
}

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

const addOns: Array<InteractiveAddOn | StaticAddOn> = [
  {
    description:
      "Transform your custom song into a breathtaking visual story with your own memories. ",
    ctaLabel: "Open video studio",
    icon: Video,
    originalPrice: "$23.99",
    promoLabel: "FREE ADD-ON",
    suffix: "per video",
    title: "Cinematic Music Video",
    trigger: "music-video",
  },
  {
    description:
      "A high-resolution digital design of your custom song lyrics. Ready to download, print, and frame",
    ctaLabel: "Open wall art studio",
    icon: ImageIcon,
    originalPrice: "$7.99",
    promoLabel: "FREE ADD-ON",
    suffix: "per print",
    title: "Digital Lyrics Wall Art",
    trigger: "wall-art",
  },
  {
    description:
      "Get a high-quality MP3 download of your custom song . Keep it offline and play it on any device forever.",
    icon: Download,
    originalPrice: "$7",
    promoLabel: "FREE ADD-ON",
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
  isAuthenticated = false,
  musicVideoSongOptions = [],
  unlockSongContext,
  wallArtSongOptions = [],
}: {
  isAuthenticated?: boolean;
  musicVideoSongOptions?: FinalSongPlayerData[];
  unlockSongContext?: UnlockSongContext | null;
  wallArtSongOptions?: WallArtSongOption[];
} = {}) {
  const locale = await getLocale();
  const t = await getTranslations("Pricing");
  const featureList = (key: "single" | "pro" | "platinum") =>
    (t.raw(`fallbackPlans.${key}.features`) as string[]).map((description, index) => ({
      description,
      included: key === "single" ? index < 3 : true,
      bold: index === 0,
    }));
  const localizedFallbackPlans: DisplayPlan[] = [
    { ...fallbackPlans[0], cardTitle:t("fallbackPlans.single.title"), cardDescription:t("fallbackPlans.single.description"), buttonText:t("fallbackPlans.single.button"), priceSuffix:t("fallbackPlans.single.suffix"), staticCta:t("fallbackPlans.single.cta"), features:featureList("single") },
    { ...fallbackPlans[1], cardTitle:t("fallbackPlans.pro.title"), cardDescription:t("fallbackPlans.pro.description"), buttonText:t("fallbackPlans.pro.button"), priceSuffix:t("fallbackPlans.pro.suffix"), staticCta:t("fallbackPlans.pro.cta"), highlightText:t("fallbackPlans.pro.highlight"), features:featureList("pro") },
    { ...fallbackPlans[2], cardTitle:t("fallbackPlans.platinum.title"), cardDescription:t("fallbackPlans.platinum.description"), buttonText:t("fallbackPlans.platinum.button"), priceSuffix:t("fallbackPlans.platinum.suffix"), staticCta:t("fallbackPlans.platinum.cta"), highlightText:t("fallbackPlans.platinum.highlight"), features:featureList("platinum") },
  ];
  const localizedAddOns: Array<InteractiveAddOn | StaticAddOn> = [
    { ...addOns[0], title:t("addOns.video.title"), description:t("addOns.video.description"), ctaLabel:t("addOns.video.cta"), suffix:t("addOns.video.suffix"), promoLabel:t("addOns.video.promo") } as InteractiveAddOn,
    { ...addOns[1], title:t("addOns.wallArt.title"), description:t("addOns.wallArt.description"), ctaLabel:t("addOns.wallArt.cta"), suffix:t("addOns.wallArt.suffix"), promoLabel:t("addOns.wallArt.promo") } as InteractiveAddOn,
    { ...addOns[2], title:t("addOns.mp3.title"), description:t("addOns.mp3.description"), suffix:t("addOns.mp3.suffix"), promoLabel:t("addOns.mp3.promo") },
  ];
  const localizedTrustItems = [
    { ...trustItems[0], title:t("trust.checkout.title"), description:t("trust.checkout.description") },
    { ...trustItems[1], title:t("trust.satisfaction.title"), description:t("trust.satisfaction.description") },
    { ...trustItems[2], title:t("trust.support.title"), description:t("trust.support.description") },
  ];
  const result = await getPublicPricingPlans();
  const dbPlans = result.success ? result.data || [] : [];

  if (process.env.NODE_ENV !== "production" && locale === "ja") {
    for (const plan of dbPlans) {
      if (!(plan.langJsonb as PricingPlanLangJsonb)?.ja) {
        console.warn(`[pricing] Missing langJsonb.ja for public plan ${plan.id}`);
      }
    }
  }

  if (!result.success) {
    console.error("Failed to fetch public pricing plans:", result.error);
  }

  const displayPlans = dbPlans.length
    ? dbPlans.slice(0, 3).map((plan, index) =>
        toDisplayPlan(plan, locale, index)
      )
    : localizedFallbackPlans;

  return (
    <section id="pricing" className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {displayPlans.map((plan) => (
            <PricingGiftCard
              key={plan.id}
              notIncludedLabel={t("notIncluded")}
              plan={plan}
              unlockSongContext={unlockSongContext}
            />
          ))}
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.12),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(255,247,245,0.92))] px-4 py-10 shadow-[0_24px_80px_-48px_rgba(251,113,133,0.7)] sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-primary/15 bg-background/80 px-4 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
              {t("promotion.badge")}
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("promotion.title")} <span className="text-primary">{t("promotion.titleAccent")}</span>
            </h2>
            <p className="mt-3 text-lg font-bold text-primary sm:text-xl">
              {t("promotion.lead")}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("promotion.description")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {localizedAddOns.map((item) => {
              const Icon = item.icon;
              const hasOverlayCta = isInteractiveAddOn(item);

              return (
                <article
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-background/95 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18),0_10px_24px_-18px_rgba(251,113,133,0.35)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-background hover:shadow-[0_28px_55px_-30px_rgba(15,23,42,0.22),0_18px_36px_-22px_rgba(251,113,133,0.42)]"
                  key={item.title}
                >
                  {hasOverlayCta && (
                    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center bg-[linear-gradient(180deg,rgba(255,248,245,0)_0%,rgba(255,248,245,0.72)_45%,rgba(255,248,245,0.92)_100%)] px-5 pb-6 pt-16 opacity-100 transition duration-300 sm:px-6 sm:pb-7 sm:pt-20 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <div className="pointer-events-auto flex w-full justify-center sm:translate-y-3 sm:transition sm:duration-300 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0">
                        {item.trigger === "music-video" ? (
                          <MusicVideoStudioCta
                            className="inline-flex items-center justify-center gap-2 text-base font-black text-[#170A1E] transition hover:text-primary"
                            isAuthenticated={isAuthenticated}
                            label={item.ctaLabel}
                            songOptions={musicVideoSongOptions}
                          />
                        ) : (
                          <WallArtStudioCta
                            className="inline-flex items-center justify-center gap-2 text-base font-black text-[#170A1E] transition hover:text-primary"
                            isAuthenticated={isAuthenticated}
                            label={item.ctaLabel}
                            songOptions={wallArtSongOptions}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute right-[-3.5rem] top-6 z-10 rotate-45 bg-gradient-to-r from-orange-400 via-primary to-rose-500 px-14 py-2 text-sm font-black uppercase tracking-[0.08em] text-white shadow-lg">
                    {t("promotion.freeNow")}
                  </div>

                  <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:scale-110">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="pr-16 text-2xl font-black leading-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-4 min-h-24 text-base leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-8 border-t border-primary/10 pt-5">
                    <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                      <span className="text-xl font-black tracking-tight text-muted-foreground/75 line-through">
                        {t("promotion.from")} {item.originalPrice}
                      </span>
                      <span className="text-4xl font-black leading-none tracking-[-0.06em] text-foreground">
                        $0
                      </span>
                      <span className="pb-1 text-sm font-bold text-foreground">
                        {item.suffix}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-primary">
                      ({item.promoLabel})
                    </p>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-400 via-primary to-rose-500 transition-all duration-500 group-hover:w-full" />
                    </div>
                    {hasOverlayCta ? (
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {t("promotion.interactiveHint")}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {t("promotion.automaticHint")}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
          {localizedTrustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="group cursor-pointer rounded-xl px-2 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-muted/40"
                key={item.title}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-1 size-5 shrink-0 text-primary transition-transform duration-300 ease-out group-hover:scale-110" />
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
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
  notIncludedLabel,
  plan,
  unlockSongContext,
}: {
  notIncludedLabel: string;
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
        "relative flex min-h-[560px] cursor-pointer flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl",
        isPro
          ? "border-foreground bg-foreground text-primary-foreground hover:border-accent"
          : isPlatinum
            ? "border-primary/30 bg-card hover:border-primary/60 hover:bg-primary/5"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
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
        <div className="flex items-end gap-2">
          <span
            className={cn(
              "text-4xl font-black tracking-tight",
              isPro ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {plan.displayPrice}
          </span>
          {plan.originalPrice && (
            <span
              className={cn(
                "pb-1 text-sm font-semibold line-through",
                isPro
                  ? "text-primary-foreground/50"
                  : "text-muted-foreground"
              )}
            >
              {plan.originalPrice}
            </span>
          )}
          {plan.priceSuffix && (
            <span
              className={cn(
                "ml-1 text-xs font-bold",
                isPro ? "text-primary-foreground/60" : "text-muted-foreground"
              )}
            >
              / {plan.priceSuffix}
            </span>
          )}
        </div>
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
          {notIncludedLabel}
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
