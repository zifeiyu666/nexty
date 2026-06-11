import FeatureBadge from "@/components/shared/FeatureBadge";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { MousePointerClick } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SiDiscord } from "react-icons/si";

export default function Hero() {
  const t = useTranslations("Landing.Hero");
  const descriptionHtml = t.raw("description") as string;
  const titleLine = t("titleLine");
  const titleAccent = t("titleAccent");

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff2f5_0%,#fff7f8_58%,#ffffff_100%)]">
      <div className="container mx-auto">
        <div className="flex gap-8 py-16 lg:py-24 2xl:py-40 items-center justify-center flex-col">
          <FeatureBadge
            label={t("badge.label")}
            text={t("badge.text")}
            href={t("badge.href")}
          />
          <div className="flex gap-4 flex-col max-w-7xl">
            <h1
              aria-label={t("title")}
              className="text-center z-10 font-sans text-[1.65rem] font-bold leading-[1.05] min-[430px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="title-gradient block whitespace-nowrap">
                {titleLine}
              </span>
              <span className="title-gradient relative mt-2 inline-block pb-4">
                {titleAccent}
                <svg
                  className="pointer-events-none absolute -bottom-1 left-1/2 h-5 w-[108%] -translate-x-1/2 text-[#F4B278] sm:h-6 md:h-8"
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
              className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground text-center [&_p]:m-0 [&_strong]:font-normal"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              asChild
              className="h-11 rounded-xl px-8 py-2 text-white border-2 border-primary"
            >
              <I18nLink
                href={t("getStartedLink") || "#"}
                className="flex items-center gap-2"
              >
                <MousePointerClick className="w-4 h-4" />
                {t("getStarted")}
              </I18nLink>
            </Button>
            <Button
              className="h-11 rounded-xl px-8 py-2 bg-white hover:bg-background text-indigo-500 hover:text-indigo-600 border-2"
              variant="outline"
              asChild
            >
              <Link
                href={t("discord.href") || "#"}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={t("discord.text")}
                prefetch={false}
                className="flex items-center gap-2"
              >
                <SiDiscord className="w-4 h-4 text-indigo-500" />
                {t("discord.text")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
