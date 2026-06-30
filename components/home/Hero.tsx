import HeroOccasionMosaic from "@/components/home/HeroOccasionMosaic";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { MousePointerClick } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Landing.Hero");
  const descriptionHtml = t.raw("description") as string;
  const titleLine = t("titleLine");
  const titleAccent = t("titleAccent");

  return (
    <section className="relative isolate min-h-[max(640px,calc(100dvh_+_53px))] w-full overflow-hidden bg-[#080605] text-white">
      <HeroOccasionMosaic />
      <div className="absolute inset-0 -z-20 bg-black/62" />

      <div className="container mx-auto">
        <div className="flex h-dvh min-h-[640px] -translate-y-2 flex-col items-center justify-center gap-8 pb-16 pt-28 text-center sm:-translate-y-3 lg:-translate-y-4 lg:pb-24 lg:pt-36 2xl:-translate-y-6 2xl:pb-32 2xl:pt-44">
          {/* <FeatureBadge
            label={t("badge.label")}
            text={t("badge.text")}
            href={t("badge.href")}
            className="text-white [&>div]:border-white/20 [&>div]:bg-black/42 [&>div]:shadow-[0_12px_40px_rgba(0,0,0,0.32)] [&>div]:backdrop-blur-md [&>div]:hover:bg-black/52 [&_a>div]:border-white/20 [&_a>div]:bg-black/42 [&_a>div]:shadow-[0_12px_40px_rgba(0,0,0,0.32)] [&_a>div]:backdrop-blur-md [&_a>div]:hover:bg-black/52"
          /> */}
          <div className="flex max-w-7xl flex-col items-center gap-4">
            <h1
              aria-label={t("title")}
              className="z-10 text-center font-sans text-[2.3rem] font-black leading-[1.02] tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.62)] min-[430px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl"
            >
              <span className="title-gradient block text-balance !text-white 2xl:whitespace-nowrap">
                {titleLine}
              </span>
              <span className="title-gradient relative mt-2 inline-block pb-4 !text-white">
                {/* <SquigglyText stepDuration={70} scale={[6, 9]}>
                  {titleAccent}
                </SquigglyText> */}
                {titleAccent}
                <svg
                  className="pointer-events-none absolute -bottom-1 left-1/2 h-5 w-[108%] -translate-x-1/2 text-[#f6c157] sm:h-6 md:h-8"
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
              className="w-full max-w-5xl text-center text-base font-normal  leading-relaxed tracking-tight text-white/78 drop-shadow-[0_3px_12px_rgba(0,0,0,0.62)] sm:text-lg md:text-xl [&_p]:m-0  [&_strong]:font-normal"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <MagneticButton
              href="/create-song"
              variant="primary"
              size="default"
              className="min-w-[210px] text-[1.05rem] font-semibold sm:min-w-[250px] sm:text-[1.16rem]"
              trailingArrow
            >
              <span>{t("getStarted")}</span>
            </MagneticButton>
            <MagneticButton
              href="#how-it-works"
              title={t("howItWorksCta")}
              prefetch={false}
              variant="light"
              size="default"
              className="min-w-[200px] text-[1.05rem] font-semibold text-black hover:text-black sm:min-w-[230px] sm:text-[1.16rem]"
            >
              <MousePointerClick className="size-[1.1rem] text-black sm:size-5" />
              <span>{t("howItWorksCta")}</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
