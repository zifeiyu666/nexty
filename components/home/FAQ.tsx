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
      className="home-section-muted text-[#2b1710]"
    >
      <div
        className="home-section-header home-container"
        data-testid="faq-section-heading"
      >
        <p className="home-eyebrow">FAQ</p>
        <h2 className="home-title">{headingTitle}</h2>
        <p className="home-description">
          {headingDescription}
        </p>
      </div>

      <div className="home-container grid grid-cols-[1fr_1.15fr] items-stretch gap-6 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div
          className="home-cta-animated-gradient relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl px-8 py-14 text-center text-white shadow-[0_24px_70px_rgba(54,38,27,0.18)] max-[900px]:py-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(35,23,19,0.08)_0%,rgba(35,23,19,0.28)_64%,rgba(18,11,9,0.58)_100%)]"
          />
          <h2
            className="mb-3 font-bold leading-[1.1]"
            style={{
              fontSize: "clamp(2rem, 7vw, 2.75rem)",
            }}
          >
            {cardTitle}
          </h2>
          <p className="mb-6 text-[0.9rem] font-normal leading-6 text-white/75">
            {ctaDescription ??
              cta.rich("description", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
          </p>
          <MagneticButton
            href={ctaHref}
            size="sm"
            trailingArrow
            className="px-5 text-center text-[0.9rem] font-semibold leading-tight sm:px-5 sm:text-[0.9rem]"
          >
            <span className="whitespace-normal">{cardButtonLabel}</span>
          </MagneticButton>
        </div>

        <div className="home-card flex flex-col justify-center px-6 py-5 sm:px-8">
          <div className="divide-y divide-[#eadbd3]">
            {faqs.map((item) => {
              const isOpen = openItem === item.question;
              const Icon = isOpen ? ChevronUp : ChevronDown;

              return (
                <div key={item.question} className="py-4 first:pt-0">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-[0.95rem] font-semibold leading-6 text-[#2b1710] transition-colors hover:text-primary"
                    aria-expanded={isOpen}
                    onClick={() => setOpenItem(isOpen ? null : item.question)}
                  >
                    <span>{item.question}</span>
                    <Icon className="size-4 shrink-0 text-[#9b8c84]" />
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-[0.9rem] leading-6 text-[#6f625c]">
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
