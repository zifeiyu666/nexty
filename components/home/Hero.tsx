import HeroOccasionMosaic from "@/components/home/HeroOccasionMosaic";
import StructuredSongBrief from "@/components/home/StructuredSongBrief";
import { AuroraText } from "@/components/ui/aurora-text";
import { WordRotate } from "@/components/ui/word-rotate";
import { CheckCircle2 } from "lucide-react";
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
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.58)_34%,rgba(0,0,0,0.34)_68%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,6,5,0.58)_0%,rgba(8,6,5,0.14)_32%,rgba(8,6,5,0.22)_66%,rgba(8,6,5,0.78)_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-20 h-32 bg-gradient-to-b from-black/46 to-transparent" />

      <div className="container mx-auto">
        <div className="flex min-h-[700px] flex-col items-center justify-center gap-3.5 pb-9 pt-[4.5rem] text-center sm:min-h-[650px] sm:gap-4 sm:pb-12 sm:pt-24 lg:gap-5 lg:pb-16 lg:pt-28">
          <div className="inline-flex max-w-[88vw] items-center gap-1.5 rounded-full border border-white/18 bg-black/28 px-3 py-1.5 text-[0.68rem]  uppercase tracking-[0.08em] text-white/84 shadow-[0_10px_28px_rgba(0,0,0,0.24)] backdrop-blur-md sm:px-3.5 sm:text-xs">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_14px_rgba(224,65,50,0.78)]" />
            <span className="truncate">{t("trustBadge")}</span>
          </div>

          <div className="flex max-w-6xl flex-col items-center gap-2 sm:gap-2.5">
            <h1
              aria-label="Personalized Song Gifts for every occasion - SendTheSong AI"
              className="z-10 text-center font-sans text-[1.8rem] font-black leading-[1.1] tracking-normal text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.62)] min-[390px]:text-[2rem] min-[430px]:text-[2.2rem] sm:text-4xl md:text-5xl lg:text-6xl"
            >
              <span className="hero-title-warm block">
                Personalized Song Gifts
              </span>
              <span className="mt-1 flex flex-wrap items-center justify-center gap-x-2 sm:mt-2 sm:gap-x-3">
                <WordRotate
                  words={rotatingOccasions}
                  className="text-center text-white"
                  containerClassName="min-w-[13rem] min-[390px]:min-w-[15rem] sm:min-w-[19rem] lg:min-w-[23rem]"
                />
                <AuroraText
                  className="font-inherit"
                  colors={["#fcb3aa", "#f56d60", "#f4d2a0", "#fcb3aa"]}
                >
                  - SendTheSong AI
                </AuroraText>
              </span>
            </h1>

            <div
              className="w-full max-w-[38rem] text-center text-[0.8rem] font-normal leading-relaxed tracking-tight text-white/80 drop-shadow-[0_3px_12px_rgba(0,0,0,0.62)] sm:max-w-3xl sm:text-base md:text-lg [&_p]:m-0 [&_strong]:font-normal"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <StructuredSongBrief />
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
