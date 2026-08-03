import SpokenIntroDemo from "@/components/home/SpokenIntroDemo";
import VoiceCloneDemo from "@/components/home/VoiceCloneDemo";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  BadgeCheck,
  MicVocal,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

const featureKeys = ["voiceClone", "spokenIntro"] as const;

const featureMeta: Record<
  (typeof featureKeys)[number],
  {
    href: "/voices" | "/create-song";
    image?: string;
    Icon: typeof MicVocal;
  }
> = {
  voiceClone: {
    href: "/voices",
    image: "/images/blog/voice-clone/cover.webp",
    Icon: MicVocal,
  },
  spokenIntro: {
    href: "/create-song",
    Icon: Radio,
  },
};

export default function VoicePersonalization() {
  const t = useTranslations("Landing.VoicePersonalization");

  return (
    <section
      id="voice-personalization"
      className="home-section-soft overflow-hidden py-16 md:py-20"
    >
      <div className="home-container">
        <div className="home-section-header">
          <p className="home-eyebrow">{t("eyebrow")}</p>
          <h2 className="home-title">{t("title")}</h2>
          <p className="home-description">{t("description")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
          {featureKeys.map((featureKey) => {
            const { href, image, Icon } = featureMeta[featureKey];
            const highlights = t.raw(
              `items.${featureKey}.highlights`,
            ) as string[];

            return (
              <article
                key={featureKey}
                className="home-card home-card-hover group flex h-full flex-col overflow-hidden lg:min-h-[570px]"
              >
                {/* {image ? (
                  <div className="relative h-40 overflow-hidden bg-[#281915] sm:h-44 lg:h-48">
                    <Image
                      src={image}
                      alt={t(`items.${featureKey}.imageAlt`)}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d110d]/72 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 inline-flex size-10 items-center justify-center rounded-full border border-white/25 bg-[#24130f]/80 text-white shadow-lg backdrop-blur-sm">
                      <Icon className="size-[1.1rem]" aria-hidden="true" />
                    </div>
                  </div>
                ) : null} */}

                <div className="flex flex-1 flex-col px-6 py-7 sm:px-8 sm:py-8">

                  <h3 className="text-2xl font-black leading-tight text-[#2b1710] sm:text-[1.7rem]">
                    {t(`items.${featureKey}.title`)}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#6f625c]">
                    {t(`items.${featureKey}.description`)}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm leading-6 text-[#4f423b]">
                    {highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <BadgeCheck
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {featureKey === "spokenIntro" && <SpokenIntroDemo />}

                  {featureKey === "voiceClone" && <VoiceCloneDemo />}

                  {featureKey === "voiceClone" && (
                    <p className="mt-5 flex items-start gap-2 border-t border-[#eee0d8] pt-4 text-xs leading-5 text-[#786961]">
                      <ShieldCheck
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{t("items.voiceClone.consent")}</span>
                    </p>
                  )}

                  <Link
                    href={href}
                    className="mt-auto pt-7 inline-flex w-fit items-center gap-2 text-base font-bold text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                  >
                    {t(`items.${featureKey}.cta`)}
                    <ArrowRight
                      className="size-5 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
