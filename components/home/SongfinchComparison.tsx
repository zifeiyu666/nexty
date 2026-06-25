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
      className="bg-[#fff6f8] py-12 dark:bg-[#24171b] md:py-18"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          {/* <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
            {t("eyebrow")}
          </div> */}
          <h2 className="mx-auto max-w-5xl text-center font-sans text-3xl font-extrabold leading-tight tracking-normal sm:text-4xl md:text-5xl">
            {t.rich("title", {
              us: (chunks) => (
                <span className="text-primary dark:text-[#ff8d7f]">
                  {chunks}
                </span>
              ),
              vs: (chunks) => (
                <span className="mx-2 inline-block text-[#c8beb8] dark:text-[#8c7771] sm:mx-3">
                  {chunks}
                </span>
              ),
              songfinch: (chunks) => (
                <span className="text-[#1d1d1d] dark:text-foreground">
                  {chunks}
                </span>
              ),
            })}
          </h2>
          <div className="mx-auto mt-4 max-w-2xl font-['Bradley_Hand','Comic_Sans_MS',cursive] text-base leading-7 text-muted-foreground md:text-lg [&_strong]:font-normal [&_strong]:text-inherit">
            {t.rich("subtitle", {
              strong: (chunks) => <strong>{chunks}</strong>,
              price: (chunks) => (
                <span className="font-semibold text-primary dark:text-[#ff8d7f]">
                  {chunks}
                </span>
              ),
              underline: (chunks) => (
                <span className="relative inline-block whitespace-nowrap text-foreground">
                  {chunks}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-2 w-full rounded-[50%] border-b-[3px] border-primary/80 [transform:rotate(-1.4deg)] dark:border-[#ff8d7f]/85"
                  />
                </span>
              ),
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/70 bg-background shadow-sm dark:border-[#4a2a32]">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-[#2b1b17] text-sm font-semibold text-white dark:bg-[#321f21]">
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

          <div className="divide-y divide-border">
            {rows.map((row, index) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.1fr_1fr_1fr] text-sm md:text-base"
              >
                <div className="flex items-center px-3 py-4 font-semibold text-foreground sm:px-5">
                  {row.feature}
                </div>
                <div className="flex items-center gap-2 border-l border-primary/15 bg-primary/5 px-3 py-4 font-semibold text-foreground sm:px-5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{row.us}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-border px-3 py-4 text-muted-foreground sm:px-5">
                  {index > 3 ? (
                    <XCircle className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  ) : (
                    <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  )}
                  <span>{row.songfinch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {painPoints.map((item) => {
            const Icon =
              painPointIcons[item.icon as keyof typeof painPointIcons] ??
              Palette;

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-white/70 bg-background p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 dark:border-[#4a2a32]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold leading-snug text-foreground md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
