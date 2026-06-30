import HowItWorksSection from "@/components/shared/HowItWorksSection";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const stepKeys = ["story", "preview", "gift", "deliver"] as const;

const richTextComponents = {
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
};

export default function HowItWorks() {
  const t = useTranslations("Landing.HowItWorks");
  const steps = stepKeys.map((stepKey, index) => ({
    kicker: String(index + 1).padStart(2, "0"),
    title: t(`steps.${stepKey}.title`),
    description: t.rich(`steps.${stepKey}.description`, richTextComponents),
  }));

  return (
    <HowItWorksSection
      sectionClassName="isolate bg-muted text-[#171717]"
      containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      titleClassName="text-[#24211F]"
      descriptionClassName="text-[#3A3734] [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-inherit"
      cardClassName="min-h-52 text-center sm:min-h-56"
      kickerClassName="bg-[#c33f32] text-white"
      stepTitleClassName="text-[#24211F]"
      stepDescriptionClassName="text-sm leading-7 text-[#5f564f] [&_strong]:font-semibold [&_strong]:text-inherit"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={
        <div data-how-it-works-description>
          {t.rich("description", richTextComponents)}
        </div>
      }
      steps={steps}
      backgroundSlot={
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
      }
    />
  );
}
