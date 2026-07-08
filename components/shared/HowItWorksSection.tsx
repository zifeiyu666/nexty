import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
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
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  gridClassName?: string;
  cardClassName?: string;
  kickerClassName?: string;
  stepTitleClassName?: string;
  stepDescriptionClassName?: string;
  backgroundSlot?: ReactNode;
  mobileCarousel?: boolean;
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
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  gridClassName,
  cardClassName,
  kickerClassName,
  stepTitleClassName,
  stepDescriptionClassName,
  backgroundSlot,
  mobileCarousel = false,
}: HowItWorksSectionProps) {
  const renderStepCard = (step: HowItWorksStep) => (
    <article
      key={step.kicker}
      data-how-it-works-card
      className={cn("home-card home-card-hover p-6", cardClassName)}
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
  );

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
        <div className={cn("mx-auto max-w-4xl text-center", headerClassName)}>
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.24em] text-[#c33f32]",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </p>
          <h2
            className={cn(
              titleClassName ??
                "mt-3 text-balance font-sans text-3xl font-black leading-tight text-[#261712] sm:text-4xl md:text-5xl",
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

        {mobileCarousel && (
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="mt-10 md:hidden"
            aria-label="How it works steps"
          >
            <CarouselContent className="-ml-3 px-4 pb-4">
              {steps.map((step) => (
                <CarouselItem
                  key={step.kicker}
                  className="basis-[86%] pl-3 min-[430px]:basis-[82%]"
                >
                  {renderStepCard(step)}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <div
          className={cn(
            "mt-12 grid gap-4 lg:grid-cols-4",
            mobileCarousel && "hidden md:grid",
            gridClassName,
          )}
        >
          {steps.map((step) => renderStepCard(step))}
        </div>
      </div>
    </section>
  );
}
