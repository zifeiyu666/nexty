"use client";

import { MagneticButton } from "@/components/ui/magnetic-button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  title?: string;
  description?: string;
  items?: FAQItem[];
  ctaTitle?: string;
  ctaDescription?: ReactNode;
  ctaButtonLabel?: string;
  ctaHref?: string;
};

export default function FAQ({
  title,
  description,
  items,
  ctaTitle,
  ctaDescription,
  ctaButtonLabel,
  ctaHref = "/create-song",
}: FAQProps) {
  const t = useTranslations("Landing.FAQ");
  const cta = useTranslations("Landing.CTA");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const faqs: FAQItem[] = items ?? t.raw("items");
  const headingTitle = title ?? t("title");
  const headingDescription = description ?? t("description");
  const cardTitle = ctaTitle ?? cta("title");
  const cardButtonLabel = ctaButtonLabel ?? cta("button");

  return (
    <section
      className="bg-background py-16 text-foreground max-[900px]:py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="mx-auto mb-10 w-full max-w-6xl px-4 text-center max-[900px]:mb-8 sm:px-6 lg:px-8"
        data-testid="faq-section-heading"
      >
        <h2 className="preset-title">
          <span className="title-gradient">{headingTitle}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-400 md:text-lg">
          {headingDescription}
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_1.15fr] items-stretch gap-6 px-4 max-[900px]:grid-cols-1 max-[900px]:gap-8 sm:px-6 lg:px-8">
        <div
          className="c5-animated-gradient flex flex-col items-center justify-center rounded-[20px] px-8 py-14 text-center text-white max-[900px]:py-12"
          style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)" }}
        >
          <h2
            className="mb-3 font-bold leading-[1.1]"
            style={{
              fontSize: "clamp(2rem, 7vw, 2.75rem)",
            }}
          >
            {cardTitle}
          </h2>
          <p className="mb-6 text-[0.85rem] font-normal leading-6 opacity-85">
            {ctaDescription ??
              cta.rich("description", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
          </p>
          <MagneticButton
            href={ctaHref}
            size="sm"
            trailingArrow
            className="border-black bg-black px-5 text-center text-[0.9rem] font-semibold leading-tight text-white shadow-[0_18px_42px_rgba(0,0,0,0.34)] hover:bg-black hover:text-white hover:shadow-[0_22px_46px_rgba(0,0,0,0.42)] sm:px-5 sm:text-[0.9rem]"
          >
            <span className="whitespace-normal">{cardButtonLabel}</span>
          </MagneticButton>
        </div>

        <div className="flex flex-col justify-center">
          <div className="divide-y divide-border">
            {faqs.map((item) => {
              const isOpen = openItem === item.question;
              const Icon = isOpen ? ChevronUp : ChevronDown;

              return (
                <div key={item.question} className="py-4 first:pt-0">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-[0.95rem] font-semibold leading-6 text-foreground transition-colors hover:text-primary"
                    aria-expanded={isOpen}
                    onClick={() => setOpenItem(isOpen ? null : item.question)}
                  >
                    <span>{item.question}</span>
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-[0.9rem] leading-6 text-muted-foreground">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
