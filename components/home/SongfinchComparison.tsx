import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  Gift,
  Palette,
  XCircle,
  Zap
} from "lucide-react";
import { useTranslations } from "next-intl";

type ComparisonRow = {
  feature: string;
  songfinch: string;
  us: string;
};

type PainPoint = {
  title: string;
  description: string;
  icon: string;
};

const painPointIcons = {
  value: CircleDollarSign,
  speed: Zap,
  edits: Edit3,
  bundle: Gift,
} as const;

export default function SongfinchComparison() {
  const t = useTranslations("Landing.SongfinchComparison");
  const rows = t.raw("rows") as ComparisonRow[];
  const painPoints = t.raw("painPoints") as PainPoint[];

  return (
    <section
      id="songfinch-comparison"
      className="home-section-muted"
    >
      <div className="home-container">
        <div className="home-section-header">
          {/* <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
            {t("eyebrow")}
          </div> */}
          <p className="home-eyebrow">{t("eyebrow")}</p>
          <h2 className="home-title mx-auto max-w-5xl">
            {t.rich("title", {
              us: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
              vs: (chunks) => (
                <span className="mx-2 inline-block text-[#c8beb8] sm:mx-3">
                  {chunks}
                </span>
              ),
              songfinch: (chunks) => (
                <span className="text-inherit">{chunks}</span>
              ),
            })}
          </h2>
          <div className="home-description [&_strong]:font-semibold [&_strong]:text-[#2b1710]">
            {t.rich("subtitle", {
              strong: (chunks) => <strong>{chunks}</strong>,
              price: (chunks) => (
                <span className="font-semibold text-primary">{chunks}</span>
              ),
              underline: (chunks) => (
                <span className="relative inline-block whitespace-nowrap text-[#5a2117]">
                  {chunks}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-2 w-full rounded-[50%] border-b-[3px] border-primary/70 [transform:rotate(-1.4deg)]"
                  />
                </span>
              ),
            })}
          </div>
        </div>

        <div className="home-card overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-[#2a1710] text-sm font-semibold text-white">
            <div className="px-3 py-4 sm:px-5 md:text-base">
              {t("tableHeaders.feature")}
            </div>
            <div className="border-l border-white/10 bg-primary px-3 py-4 text-primary-foreground sm:px-5 md:text-base">
              {t("tableHeaders.us")}
            </div>
            <div className="border-l border-white/10 px-3 py-4 sm:px-5 md:text-base">
              {t("tableHeaders.songfinch")}
            </div>
          </div>

          <div className="divide-y divide-[#eadbd3]">
            {rows.map((row, index) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.1fr_1fr_1fr] text-sm md:text-base"
              >
                <div className="flex items-center px-3 py-4 font-semibold text-[#2b1710] sm:px-5">
                  {row.feature}
                </div>
                <div className="flex items-center gap-2 border-l border-primary/15 bg-primary/5 px-3 py-4 font-semibold text-[#2b1710] sm:px-5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{row.us}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-[#eadbd3] px-3 py-4 text-[#6f625c] sm:px-5">
                  {index > 3 ? (
                    <XCircle className="h-4 w-4 shrink-0 text-[#9b8c84]" />
                  ) : (
                    <Clock3 className="h-4 w-4 shrink-0 text-[#9b8c84]" />
                  )}
                  <span>{row.songfinch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:mt-10 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {painPoints.map((item) => {
            const Icon =
              painPointIcons[item.icon as keyof typeof painPointIcons] ??
              Palette;

            return (
              <article
                key={item.title}
                className="home-card home-card-hover min-w-[82%] snap-center p-5 min-[430px]:min-w-[76%] md:min-w-0"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold leading-snug text-[#2b1710] md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6f625c]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
