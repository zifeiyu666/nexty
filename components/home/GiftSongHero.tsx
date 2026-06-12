import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { Gift, Music2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const occasionTags = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Holiday",
  "Christmas",
  "New Baby",
  "Thank You",
  "Graduation",
];

const miniMoments = [
  { label: "Mom", image: "/images/users/user1.jpeg" },
  { label: "Partner", image: "/images/users/user2.jpeg" },
  { label: "Best Friend", image: "/images/users/user3.png" },
];

export default function GiftSongHero() {
  const t = useTranslations("Landing.Hero");
  const descriptionHtml = t.raw("description") as string;
  const title = t("title");

  return (
    <section className="relative overflow-hidden bg-white text-[#080b12]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(235,77,69,0.08),transparent_28%),linear-gradient(90deg,rgba(235,77,69,0.05),transparent_44%)]" />
      <div className="container relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.9fr_1fr] xl:gap-6">
          <div className="relative min-h-[430px] overflow-hidden rounded-[26px] border border-[#e7c9c2] bg-[#d72418] shadow-[0_18px_54px_rgba(76,22,14,0.16)] md:min-h-[520px] lg:min-h-[620px]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.11)_1px,transparent_1px)] bg-[length:112px_100%] opacity-60" />
            <Image
              src="/images/hero/giftsong-hero-creature.webp"
              alt="A pink holiday character holding red and white gifts"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[50%_44%]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4d110b]/80 via-[#7f190f]/30 to-transparent p-4 pt-28 sm:p-6">
              <div className="flex flex-wrap justify-center gap-2">
                {occasionTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/35 bg-[#3b0d08]/42 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[520px] flex-col items-center justify-center rounded-[26px] border border-[#f1ded9] bg-white px-5 py-10 text-center shadow-[0_18px_54px_rgba(76,22,14,0.1)] sm:px-8 md:min-h-[560px] lg:min-h-[620px] lg:px-10 xl:px-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eee5e1] bg-white px-4 py-2 text-sm text-[#68707d] shadow-[0_14px_38px_rgba(19,23,32,0.08)]">
              <span className="h-2 w-2 rounded-full bg-[#d72418]" />
              {t("badge.text")}
            </div>

            <h1
              aria-label={title}
              className="max-w-3xl text-balance font-sans text-[clamp(2.5rem,5.8vw,5.9rem)] font-black leading-[0.98] tracking-normal text-[#070a11]"
            >
              {title}
            </h1>

            <div
              className="mt-6 max-w-xl text-balance text-base leading-7 text-[#6d7480] sm:text-lg [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-[#d72418]"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />

            <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 flex-1 rounded-xl bg-[#d72418] px-6 text-base font-bold text-white shadow-[0_16px_34px_rgba(215,36,24,0.22)] hover:bg-[#be1f15]"
              >
                <I18nLink
                  href="/create-song"
                  className="flex items-center gap-2"
                >
                  {t("getStarted")}
                  <Gift className="h-5 w-5" />
                </I18nLink>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 flex-1 rounded-xl border-[#d8dce2] bg-white px-6 text-base font-bold text-[#111722] hover:bg-[#fbf7f5]"
              >
                <I18nLink
                  href="#customer-reactions"
                  className="flex items-center gap-2"
                >
                  Hear Reactions
                  <Music2 className="h-5 w-5" />
                </I18nLink>
              </Button>
            </div>

            <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              {miniMoments.map((moment) => (
                <div
                  key={moment.label}
                  className="group overflow-hidden rounded-lg border border-[#eef0f3] bg-[#fbf9f8] p-1.5 shadow-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                    <Image
                      src={moment.image}
                      alt={`${moment.label} listening to a custom song`}
                      fill
                      sizes="180px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 px-2 py-3 text-sm font-semibold text-[#303744]">
                    <Sparkles className="h-3.5 w-3.5 text-[#d72418]" />
                    {moment.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
