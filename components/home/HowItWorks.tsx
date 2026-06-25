import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const stepKeys = ["story", "preview", "gift"] as const;

const richTextComponents = {
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
};

export default function HowItWorks() {
  const t = useTranslations("Landing.HowItWorks");

  return (
    <section
      id="how-it-works"
      data-how-it-works-strong
      className="relative isolate overflow-hidden bg-muted py-20 text-[#171717] md:py-24"
    >
      <div
        aria-hidden="true"
        data-how-it-works-geometry
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <span className="absolute left-[5%] top-10 h-24 w-24 rounded-full bg-white/70" />
        <span className="absolute right-[9%] top-24 h-16 w-40 rotate-6 rounded-lg bg-white/60" />
        <span className="absolute left-[18%] bottom-16 h-20 w-32 -rotate-12 rounded-lg bg-white/50" />
        <span className="absolute right-[22%] bottom-10 h-28 w-28 rounded-full bg-white/55" />
        <span className="absolute left-[45%] top-32 h-12 w-12 rotate-45 rounded-md bg-muted" />
        <span className="absolute right-[42%] bottom-24 h-10 w-36 -rotate-3 rounded-full bg-white/45" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <h2 className="preset-title">{t("eyebrow")}?</h2>
          <div
            data-how-it-works-description
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#3A3734] md:text-lg [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-inherit"
          >
            {t.rich("description", richTextComponents)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {stepKeys.map((stepKey) => (
            <article
              key={stepKey}
              data-how-it-works-card
              className="flex min-h-52 flex-col items-center justify-center rounded-lg bg-white px-7 py-10 text-center sm:min-h-56 md:px-10"
            >
              <h3 className="text-xl font-semibold leading-tight text-[#24211F] sm:text-2xl">
                {t(`steps.${stepKey}.title`)}
              </h3>
              {/* font-sans text-xs leading-5 text-muted-foreground md:text-sm md:leading-6 md:[&_b]:font-semibold md:[&_strong]:font-semibold */}
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                {t.rich(`steps.${stepKey}.description`, richTextComponents)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
