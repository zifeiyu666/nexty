import HeroDecorations from "@/components/home/HeroDecorations";
import HeroOccasionMosaic from "@/components/home/HeroOccasionMosaic";
import StructuredSongBrief from "@/components/home/StructuredSongBrief";
import { Highlighter } from "@/components/ui/highlighter";
import { CheckCircle2, MessageCircleHeart } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const rotatingOccasions = [
  "For Lover",
  "For Mother",
  "For Daddy",
  "For Friends",
  "For Birthday",
  "For Wedding",
  "For My Wife",
  "For Husband",
  "Just For Fun",
  "For My girl",
  "For Honey",
];

export default function Hero() {
  const t = useTranslations("Landing.Hero");
  const descriptionHtml = t.raw("description") as string;
  const trustItems = t.raw("trustItems") as string[];

  return (
    <section className="relative isolate min-h-[700px] w-full overflow-hidden bg-[#080605] text-white sm:min-h-[max(600px,calc(100dvh_+_28px))]">
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
      {/* <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_60%_80%_at_center,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0)_100%)]" /> */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,6,5,0.66)_0%,rgba(8,6,5,0.24)_32%,rgba(8,6,5,0.32)_66%,rgba(8,6,5,0.84)_100%)]" />
      {/* <div className="absolute inset-x-0 top-0 -z-20 h-32 bg-gradient-to-b from-black/46 to-transparent" /> */}
      <HeroDecorations />

      <div className="container mx-auto">
        <div className="relative z-10 flex min-h-[700px] flex-col items-center justify-center gap-3.5 pb-9 pt-[4.5rem] text-center sm:min-h-[650px] sm:gap-4 sm:pb-12 sm:pt-24 lg:gap-5 lg:pb-16 lg:pt-28">
          <div className="inline-flex max-w-[88vw] items-center gap-2 rounded-full border border-white/18 bg-black/28 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.08em] text-white/84 shadow-[0_10px_28px_rgba(0,0,0,0.24)] backdrop-blur-md sm:px-4 sm:text-xs">
            <MessageCircleHeart className="size-4 shrink-0 text-[#f6b29d]" aria-hidden="true" />
            <span className="truncate">{t("trustBadge")}</span>
          </div>

          <div className="flex max-w-6xl flex-col items-center gap-2 sm:gap-2.5">
            <h1
              aria-label={t("title")}
              className="z-10 text-center font-sans text-[clamp(2rem,5.6vw,4.25rem)] font-black leading-[1.1] tracking-normal text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.62)] [text-shadow:0_1px_2px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.5)]"
            >
              <span className="block">{t("titleLine")}</span>
              <span className="block whitespace-nowrap pb-2 sm:pb-2.5">
                {/* "highlight" | "circle" | "box" | "bracket" | "crossed-off" | "strike-through" | "underline" */}
                <Highlighter
                  action="underline"
                  color="#e04132"
                  strokeWidth={5}
                  padding={1}
                  iterations={3}
                  roughness={2.5}
                  animationDuration={800}
                >
                  {t("titleAccent")}
                </Highlighter>
              </span>
            </h1>

            {/* <p className="text-sm font-semibold text-white/85 sm:text-base">
              <WordRotate
                words={rotatingOccasions}
                className="text-center text-white"
                containerClassName="inline-block min-w-[13rem] min-[390px]:min-w-[15rem] sm:min-w-[19rem] lg:min-w-[23rem]"
              />
              <span className="ml-2 text-white/75">· SendTheSong.io</span>
            </p> */}

            <div
              className="w-full max-w-[38rem] text-center text-[0.7rem] font-normal leading-relaxed tracking-tight text-white/80 drop-shadow-[0_3px_12px_rgba(0,0,0,0.62)] sm:max-w-3xl sm:text-base md:text-lg [&_p]:m-0 [&_strong]:font-normal"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <div className="relative isolate w-full max-w-[58rem] pt-4 sm:pt-5">
            <div className="song-message-note hero-song-message-note absolute top-1 -left-2 z-20 sm:-left-8">
              {t("inputLabel")}
            </div>
            <StructuredSongBrief />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.68rem] font-medium text-white/76 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:gap-x-4 sm:text-xs">
            {trustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
