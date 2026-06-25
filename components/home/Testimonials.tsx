"use client";

import { gsap } from "gsap";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

type Testimonial = {
  badge: string;
  quote: string;
  author: string;
  avatar: string;
  cardClassName: string;
};

const testimonials: Testimonial[] = [
  {
    badge: "💍 5th Anniversary",
    quote:
      "I was skeptical about AI, but wow! Crafted a custom song for my husband and he loved it. The vocals felt warm, not robotic, and the whole thing sounded studio-quality.",
    author: "Sarah M. 🇺🇸",
    avatar: "/avatar/avatar1.jpg",
    cardClassName: "bg-[#f7f3f1] dark:bg-[#2d2421]",
  },
  {
    badge: "🎂 Mom's 50th",
    quote:
      "So much better than a generic greeting card. Took less than 2 mins and brought my mom to tears of joy!",
    author: "David K. 🇬🇧",
    avatar: "/avatar/avatar2.jpg",
    cardClassName: "bg-[#fff0f4] dark:bg-[#3d252a]",
  },
  {
    badge: "✨ Wedding First Dance",
    quote:
      "We used this for our first dance. It captured our specific inside jokes perfectly. Pure magic!",
    author: "Emma & James 🇨🇦",
    avatar: "/avatar/avatar3.jpg",
    cardClassName: "bg-[#f5f5f6] dark:bg-[#292524]",
  },
  {
    badge: "✈️ Long-Distance",
    quote:
      "The perfect way to send a song when you're 3,000 miles apart. I added tiny details from our calls and favorite trips, and she played it on repeat all night.",
    author: "Liam T. 🇨🇦",
    avatar: "/avatar/avatar4.jpg",
    cardClassName: "bg-[#f8f1ee] dark:bg-[#2d2421]",
  },
  {
    badge: "👴 Father's Day",
    quote:
      "My kids generated a personalized song for me. Not cheesy at all—actually beautiful. Will cherish forever.",
    author: "Robert H. 🇦🇺",
    avatar: "/avatar/avatar5.jpg",
    cardClassName: "bg-[#fff3f6] dark:bg-[#3d252a]",
  },
  {
    badge: "🚀 Last-Minute Gift",
    quote:
      "Total lifesaver! Realized I forgot a gift the night before. This music gift literally saved the party.",
    author: "Chloe B. 🇬🇧",
    avatar: "/avatar/avatar6.jpg",
    cardClassName: "bg-[#f6f2ef] dark:bg-[#2d2421]",
  },
  {
    badge: "🎸 Boyfriend's Bday",
    quote:
      "It actually nailed the 90s indie rock vibe my boyfriend loves. I mentioned his favorite bands, our coffee shop date, and the song came back sounding like a real studio recording.",
    author: "Sofia R. 🇪🇸",
    avatar: "/avatar/avatar7.jpg",
    cardClassName: "bg-[#f4f5f7] dark:bg-[#292524]",
  },
  {
    badge: "🤵 Groom's Surprise",
    quote:
      "Surprised my bride during the reception. The look on her face was priceless. Easiest custom song ever.",
    author: "Marcus V. 🇺🇸",
    avatar: "/avatar/avatar8.jpg",
    cardClassName: "bg-[#fff0f4] dark:bg-[#3d252a]",
  },
];

const BASE_MARQUEE_DURATION = 48;
const SCROLL_FOLLOW_MULTIPLIER = 1.4;
const IDLE_SCROLL_DELAY = 160;

const RatingStars = () => {
  return (
    <div className="flex shrink-0 items-center gap-0.5 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" />
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <li className="w-[260px] shrink-0 list-none sm:w-[300px] lg:w-[340px]">
      <figure
        className={`flex h-full transform-gpu flex-col rounded-2xl p-5 shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-xl sm:p-6 ${testimonial.cardClassName}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <RatingStars />
            <span className="shrink-0 whitespace-nowrap rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium leading-none text-muted-foreground">
              {testimonial.badge}
            </span>
          </div>
          <blockquote className="text-sm font-medium leading-6 text-foreground/85 sm:text-[15px]">
            “{testimonial.quote}”
          </blockquote>
        </div>
        <figcaption className="flex items-center gap-2.5 pt-6">
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {testimonial.author}
            </p>
            <p className="text-xs text-muted-foreground">{testimonial.badge}</p>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

export default function Testimonials() {
  const t = useTranslations("Landing.Testimonials");
  const marqueeTestimonials = [...testimonials, ...testimonials];
  const marqueeRef = useRef<HTMLUListElement | null>(null);
  const lastScrollYRef = useRef(0);
  const positionRef = useRef(0);
  const loopWidthRef = useRef(0);
  const baseVelocityRef = useRef(0);
  const isPageScrollingRef = useRef(false);
  const isMarqueeHoveredRef = useRef(false);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;

    if (!marquee) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const setX = gsap.quickSetter(marquee, "x", "px");

    const normalizePosition = () => {
      const loopWidth = loopWidthRef.current;

      if (loopWidth <= 0) return;

      while (positionRef.current <= -loopWidth) {
        positionRef.current += loopWidth;
      }

      while (positionRef.current > 0) {
        positionRef.current -= loopWidth;
      }
    };

    const updateLoopWidth = () => {
      loopWidthRef.current = marquee.scrollWidth / 2;
      baseVelocityRef.current = loopWidthRef.current / BASE_MARQUEE_DURATION;
      normalizePosition();
      setX(positionRef.current);
    };

    updateLoopWidth();
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY === lastScrollYRef.current) return;

      const scrollDelta = scrollY - lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      if (isMarqueeHoveredRef.current) return;

      isPageScrollingRef.current = true;
      positionRef.current -= scrollDelta * SCROLL_FOLLOW_MULTIPLIER;
      normalizePosition();
      setX(positionRef.current);

      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = window.setTimeout(() => {
        isPageScrollingRef.current = false;
      }, IDLE_SCROLL_DELAY);
    };

    const tick = (_time: number, deltaTime: number) => {
      const loopWidth = loopWidthRef.current;

      if (loopWidth <= 0) return;
      if (isMarqueeHoveredRef.current) return;
      if (isPageScrollingRef.current) return;

      positionRef.current -= baseVelocityRef.current * (deltaTime / 1000);
      normalizePosition();
      setX(positionRef.current);
    };

    window.addEventListener("resize", updateLoopWidth);
    window.addEventListener("scroll", handleScroll, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", updateLoopWidth);
      window.removeEventListener("scroll", handleScroll);

      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const handleMarqueeMouseEnter = () => {
    isMarqueeHoveredRef.current = true;
  };

  const handleMarqueeMouseLeave = () => {
    isMarqueeHoveredRef.current = false;
    lastScrollYRef.current = window.scrollY;
  };

  return (
    <section id="testimonials" className="overflow-hidden py-12 md:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          {/* <FeatureBadge label={t("badge.label")} className="mb-6" /> */}
          <h2 className="preset-title">
            <span className="title-gradient">{t("title")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-['Bradley_Hand','Comic_Sans_MS',cursive] text-base leading-7 text-muted-foreground md:text-lg">
            {t("description")}
          </p>
        </div>
      </div>
      <div
        className="relative"
        onMouseEnter={handleMarqueeMouseEnter}
        onMouseLeave={handleMarqueeMouseLeave}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <ul ref={marqueeRef} className="flex w-max items-start gap-4 sm:gap-5">
          {marqueeTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.author}-${index}`}
              testimonial={testimonial}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
