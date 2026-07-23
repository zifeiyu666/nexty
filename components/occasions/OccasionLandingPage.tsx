import FAQ from "@/components/home/FAQ";
import OurProducts from "@/components/home/OurProducts";
import Testimonials, {
  type TestimonialItem,
} from "@/components/home/Testimonials";
import OccasionHeroVisual from "@/components/occasions/OccasionHeroVisual";
import HowItWorksSection from "@/components/shared/HowItWorksSection";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  getAllOccasionLandingConfigs,
  getOccasionCreateHref,
  type OccasionContentItem,
  type OccasionLandingConfig,
} from "@/lib/occasion-landing-pages";
import {
  ArrowRight,
  Award,
  Clock3,
  Flower2,
  Gem,
  Gift,
  Heart,
  MessageCircleHeart,
  Music2,
  PartyPopper,
  PlayCircle,
  Sparkles,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

const iconMap: Record<OccasionContentItem["icon"], LucideIcon> = {
  award: Award,
  celebration: PartyPopper,
  clock: Clock3,
  flower: Flower2,
  gift: Gift,
  heart: Heart,
  message: MessageCircleHeart,
  music: Music2,
  rings: Gem,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
};

type OccasionLandingPageProps = {
  config: OccasionLandingConfig;
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--occasion-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-sans text-3xl font-black leading-tight text-[var(--occasion-ink)] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f625c] md:text-lg">
        {description}
      </p>
    </div>
  );
}

function Stars() {
  return (
    <span
      className="flex items-center gap-0.5 text-[#e7ad21]"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-sm leading-none">
          ★
        </span>
      ))}
    </span>
  );
}

function IconCard({ item }: { item: OccasionContentItem }) {
  const Icon = iconMap[item.icon];

  return (
    <article className="group rounded-lg border border-black/[0.07] bg-white p-6 shadow-[0_14px_38px_rgba(45,31,24,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(45,31,24,0.09)]">
      <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[var(--occasion-soft)] text-[var(--occasion-accent)] transition group-hover:bg-[var(--occasion-accent)] group-hover:text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="text-xl font-black leading-tight text-[var(--occasion-ink)]">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#74665f]">
        {item.description}
      </p>
    </article>
  );
}

export default function OccasionLandingPage({
  config,
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: OccasionLandingPageProps) {
  const createHref = getOccasionCreateHref(config);
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }).replaceAll("<", "\\u003c");
  const testimonials: TestimonialItem[] = config.testimonials.items.map(
    (item, index) => ({
      ...item,
      cardClassName:
        index % 3 === 0
          ? "bg-[var(--occasion-soft)] dark:bg-[#2f2825]"
          : index % 3 === 1
            ? "bg-[#f6f2ee] dark:bg-[#2d2927]"
            : "bg-white dark:bg-[#292625]",
    }),
  );
  const relatedPages = getAllOccasionLandingConfigs().filter(
    (item) => item.slug !== config.slug,
  );
  const pageStyle = {
    "--occasion-accent": config.palette.accent,
    "--occasion-accent-dark": config.palette.accentDark,
    "--occasion-soft": config.palette.soft,
    "--occasion-muted": config.palette.muted,
    "--occasion-ink": config.palette.ink,
  } as CSSProperties;

  return (
    <div
      className="w-full overflow-hidden bg-[#fffdfb] text-[var(--occasion-ink)]"
      style={pageStyle}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />

      <section className="relative isolate px-6 pb-14 pt-10 sm:px-8 md:pb-16 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_13%_16%,var(--occasion-soft),transparent_32%),radial-gradient(circle_at_86%_18%,var(--occasion-muted),transparent_35%),linear-gradient(115deg,#fffdfb_0%,#ffffff_48%,var(--occasion-soft)_100%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-9 lg:grid-cols-[0.9fr_1fr] lg:gap-11">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(70,45,32,0.08)] backdrop-blur-xl">
              <Stars />
              <span className="font-bold text-[var(--occasion-ink)]">
                Excellent
              </span>
              <span className="text-[#d8c6bd]">/</span>
              <span>{config.hero.badge}</span>
            </div>

            <h1 className="mt-5 max-w-[12ch] text-balance font-sans text-[2.5rem] font-black leading-[0.98] tracking-normal text-[var(--occasion-ink)] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.3rem]">
              {config.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6c5f59] sm:text-lg">
              {config.hero.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createHref}
                size="sm"
                trailingArrow
                className="border-[var(--occasion-accent)] bg-[var(--occasion-accent)] px-6 font-bold text-white shadow-[0_18px_38px_color-mix(in_srgb,var(--occasion-accent)_28%,transparent)] hover:border-[var(--occasion-accent-dark)] hover:bg-[var(--occasion-accent-dark)] hover:text-white"
              >
                {config.hero.cta}
              </MagneticButton>
              <MagneticButton
                href={`#${config.slug}-examples`}
                prefetch={false}
                variant="light"
                size="sm"
                className="border-black/10 bg-white px-6 font-bold text-[var(--occasion-accent-dark)] shadow-[0_14px_30px_rgba(70,45,32,0.1)] hover:bg-[var(--occasion-soft)]"
              >
                <PlayCircle className="size-4" />
                See examples
              </MagneticButton>
            </div>
          </div>

          <OccasionHeroVisual
            image={config.hero.image}
            imageAlt={config.hero.imageAlt}
            cardTitle={config.hero.cardTitle}
            cardDescription={config.hero.cardDescription}
            accent={config.palette.accent}
          />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why it works"
            title={config.why.title}
            description={config.why.description}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {config.why.benefits.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection
        eyebrow="How it works"
        title={config.how.title}
        description={config.how.description}
        steps={config.how.steps}
        sectionClassName="bg-[var(--occasion-muted)]"
        eyebrowClassName="text-[var(--occasion-accent)]"
        kickerClassName="bg-[var(--occasion-accent)]"
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow={`${config.shortName} moments`}
            title={config.moments.title}
            description={config.moments.description}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.moments.items.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--occasion-soft)] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Search-led ideas"
            title={config.topics.title}
            description={config.topics.description}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {config.topics.items.map((topic) => {
              const Icon = iconMap[topic.icon];
              return (
                <article
                  key={topic.title}
                  className="rounded-lg border border-black/[0.08] bg-white p-6 shadow-[0_18px_48px_rgba(45,31,24,0.07)] md:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--occasion-soft)] text-[var(--occasion-accent)]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--occasion-accent)]">
                        Topic cluster
                      </p>
                      <h3 className="mt-2 text-2xl font-black leading-tight text-[var(--occasion-ink)]">
                        {topic.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#715f57]">
                    {topic.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {topic.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-black/10 bg-[var(--occasion-soft)] px-3 py-1 text-xs font-semibold text-[var(--occasion-accent-dark)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-black/10 pt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--occasion-accent)]">
                      Prompt direction
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6e5d56]">
                      {topic.prompt}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-5 h-auto px-0 text-sm font-black text-[var(--occasion-accent-dark)] hover:bg-transparent hover:text-[var(--occasion-accent)]"
                  >
                    <I18nLink href={createHref}>
                      Create this custom song <ArrowRight className="size-4" />
                    </I18nLink>
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id={`${config.slug}-examples`}
        className="bg-[var(--occasion-ink)] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--occasion-soft)]">
              Example briefs
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              {config.examples.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
              {config.examples.description}
            </p>
            <Button
              asChild
              className="mt-7 h-12 rounded-full bg-[var(--occasion-accent)] px-7 text-base font-black text-white hover:bg-[var(--occasion-accent-dark)]"
            >
              <I18nLink href={createHref}>
                Try your own brief <ArrowRight className="size-4" />
              </I18nLink>
            </Button>
          </div>
          <div className="grid gap-4">
            {config.examples.items.map((brief) => (
              <article
                key={brief.title}
                className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--occasion-accent-dark)]">
                    {brief.label}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {brief.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/75">
                  {brief.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <OurProducts
        isAuthenticated={isAuthenticated}
        musicVideoSongOptions={musicVideoSongOptions}
        wallArtSongOptions={wallArtSongOptions}
      />

      <Testimonials
        title={config.testimonials.title}
        description={config.testimonials.description}
        items={testimonials}
        contentWidthClassName="max-w-6xl"
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="More occasions"
            title="Create a personal song for the next meaningful moment"
            description="Explore other occasion pages, or start with any story and choose the matching song style."
          />
          <nav
            aria-label="Related custom song occasions"
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <I18nLink
              href="/occasions/custom-happy-birthday-song"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#4f4039] transition hover:border-[var(--occasion-accent)] hover:text-[var(--occasion-accent-dark)]"
            >
              Birthday songs
            </I18nLink>
            <I18nLink
              href="/occasions/anniversary"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#4f4039] transition hover:border-[var(--occasion-accent)] hover:text-[var(--occasion-accent-dark)]"
            >
              Anniversary songs
            </I18nLink>
            {relatedPages.map((page) => (
              <I18nLink
                key={page.slug}
                href={`/occasions/${page.slug}`}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#4f4039] transition hover:border-[var(--occasion-accent)] hover:text-[var(--occasion-accent-dark)]"
              >
                {page.shortName} songs
              </I18nLink>
            ))}
          </nav>
        </div>
      </section>

      <FAQ
        title={config.faq.title}
        description={config.faq.description}
        items={config.faq.items}
        ctaTitle={config.faq.ctaTitle}
        ctaDescription={config.faq.ctaDescription}
        ctaButtonLabel={config.hero.cta}
        ctaHref={createHref}
      />
    </div>
  );
}
