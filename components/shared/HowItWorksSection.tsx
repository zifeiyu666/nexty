import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type HowItWorksStep = {
  kicker: string;
  title: string;
  description: ReactNode;
};

type HowItWorksSectionProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  steps: HowItWorksStep[];
  id?: string;
  sectionClassName?: string;
  containerClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  gridClassName?: string;
  cardClassName?: string;
  kickerClassName?: string;
  stepTitleClassName?: string;
  stepDescriptionClassName?: string;
  backgroundSlot?: ReactNode;
};

export default function HowItWorksSection({
  eyebrow,
  title,
  description,
  steps,
  id = "how-it-works",
  sectionClassName,
  containerClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  gridClassName,
  cardClassName,
  kickerClassName,
  stepTitleClassName,
  stepDescriptionClassName,
  backgroundSlot,
}: HowItWorksSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden bg-[#f8f2ee] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16",
        sectionClassName,
      )}
    >
      {backgroundSlot}

      <div className={cn("relative mx-auto max-w-6xl", containerClassName)}>
        <div className={cn("mx-auto max-w-3xl text-center", headerClassName)}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c33f32]">
            {eyebrow}
          </p>
          <h2
            className={cn(
              "mt-3 text-balance font-sans text-3xl font-black leading-tight text-[#261712] sm:text-4xl md:text-5xl",
              titleClassName,
            )}
          >
            {title}
          </h2>
          <div
            className={cn(
              "mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f625c] md:text-lg",
              descriptionClassName,
            )}
          >
            {description}
          </div>
        </div>

        <div className={cn("mt-12 grid gap-4 lg:grid-cols-4", gridClassName)}>
          {steps.map((step) => (
            <article
              key={step.kicker}
              data-how-it-works-card
              className={cn(
                "rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#eadbd3]",
                cardClassName,
              )}
            >
              <div
                className={cn(
                  "mb-6 inline-flex rounded-full bg-[#25130e] px-3 py-1 text-xs font-black text-white",
                  kickerClassName,
                )}
              >
                {step.kicker}
              </div>
              <h3
                className={cn(
                  "text-xl font-black leading-tight text-[#261712]",
                  stepTitleClassName,
                )}
              >
                {step.title}
              </h3>
              <div
                className={cn(
                  "mt-3 text-sm leading-6 text-[#74665f]",
                  stepDescriptionClassName,
                )}
              >
                {step.description}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
