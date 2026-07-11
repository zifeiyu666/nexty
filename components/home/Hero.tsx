import HeroOccasionMosaic from "@/components/home/HeroOccasionMosaic";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Hero() {
  const t = useTranslations("Landing.Hero");
  const descriptionHtml = t.raw("description") as string;
  const titleLine = t("titleLine");
  const titleAccent = t("titleAccent");
  const trustItems = t.raw("trustItems") as string[];

  return (
    <section className="relative isolate min-h-[760px] w-full overflow-hidden bg-[#080605] text-white sm:min-h-[max(640px,calc(100dvh_+_53px))]">
      <Image
        src="/images/hero/giftsong-hero-mobile-mosaic-occasion-generated.avif"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-center sm:hidden"
      />
      <HeroOccasionMosaic />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.58)_34%,rgba(0,0,0,0.34)_68%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,6,5,0.58)_0%,rgba(8,6,5,0.14)_32%,rgba(8,6,5,0.22)_66%,rgba(8,6,5,0.78)_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-20 h-32 bg-gradient-to-b from-black/46 to-transparent" />

      <div className="container mx-auto">
        <div className="flex min-h-[760px] flex-col items-center justify-center gap-4 pb-10 pt-20 text-center sm:h-dvh sm:min-h-[640px] sm:-translate-y-3 sm:gap-7 sm:pb-16 sm:pt-28 lg:-translate-y-4 lg:gap-8 lg:pb-24 lg:pt-36 2xl:-translate-y-6 2xl:pb-32 2xl:pt-44">
          <div className="inline-flex max-w-[92vw] items-center gap-2 rounded-full border border-white/18 bg-black/28 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/84 shadow-[0_12px_34px_rgba(0,0,0,0.26)] backdrop-blur-md sm:px-4 sm:text-sm">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(224,65,50,0.78)]" />
            <span className="truncate">{t("trustBadge")}</span>
          </div>

          <div className="flex max-w-7xl flex-col items-center gap-3 sm:gap-4">
            <h1
              aria-label={t("title")}
              className="z-10 text-center font-sans text-[2rem] font-black leading-[1.12] tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.62)] min-[390px]:text-[2.22rem] min-[430px]:text-[2.45rem] sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl"
            >
              <span className="hero-title-warm block text-balance 2xl:whitespace-nowrap">
                {titleLine}
              </span>
              <span className="hero-title-warm relative mt-1.5 inline-block pb-3 sm:mt-2 sm:pb-4">
                {/* <SquigglyText stepDuration={70} scale={[6, 9]}>
                  {titleAccent}
                </SquigglyText> */}
                {titleAccent}
                <svg
                  className="pointer-events-none absolute -bottom-1 left-1/2 h-5 w-[108%] -translate-x-1/2 text-primary sm:h-6 md:h-8"
                  viewBox="0 0 420 42"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M9 29C68 9 103 10 143 25C176 37 209 35 249 19C293 2 332 8 411 23"
                    stroke="currentColor"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.72"
                  />
                  <path
                    d="M22 34C91 21 144 20 202 29C268 39 316 33 397 14"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>

            <div
              className="w-full max-w-[44rem] text-center text-sm font-normal leading-relaxed tracking-tight text-white/80 drop-shadow-[0_3px_12px_rgba(0,0,0,0.62)] sm:max-w-4xl sm:text-lg md:text-xl [&_p]:m-0 [&_strong]:font-normal"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <div className="flex w-full max-w-[22rem] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <MagneticButton
                href="/create-song"
                variant="primary"
                size="default"
                className="w-full min-w-[210px] text-[1rem] font-semibold sm:w-auto sm:min-w-[250px] sm:text-[1.16rem]"
                trailingArrow
              >
                <span>{t("getStarted")}</span>
              </MagneticButton>
              <MagneticButton
                href="#customer-reactions-grid"
                title={t("watchReactionsCta")}
                prefetch={false}
                variant="light"
                size="default"
                className="w-full min-w-[210px] text-[1rem] font-semibold sm:w-auto sm:min-w-[230px] sm:text-[1.16rem]"
              >
                <PlayCircle className="size-[1.1rem] sm:size-5" />
                <span>{t("watchReactionsCta")}</span>
              </MagneticButton>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs font-medium text-white/76 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:hidden">
              {trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-white/76 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:flex">
            {trustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
