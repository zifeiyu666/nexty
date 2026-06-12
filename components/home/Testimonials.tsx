import FeatureBadge from "@/components/shared/FeatureBadge";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <li className="w-[300px] shrink-0 list-none sm:w-[360px] lg:w-[420px]">
      <figure
        className={`flex flex-col rounded-3xl p-7 shadow-sm ${testimonial.cardClassName}`}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <RatingStars />
            <span className="shrink-0 whitespace-nowrap rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium leading-none text-muted-foreground">
              {testimonial.badge}
            </span>
          </div>
          <blockquote className="text-base font-medium leading-7 text-foreground/85">
            “{testimonial.quote}”
          </blockquote>
        </div>
        <figcaption className="flex items-center gap-3 pt-8">
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="text-base font-semibold text-foreground">
              {testimonial.author}
            </p>
            <p className="text-sm text-muted-foreground">{testimonial.badge}</p>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

export default function Testimonials() {
  const t = useTranslations("Landing.Testimonials");
  const marqueeTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="overflow-hidden py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <FeatureBadge label={t("badge.label")} className="mb-8" />
          <h2 className="text-center z-10 text-lg md:text-5xl font-sans font-semibold mb-4">
            <span className="title-gradient">{t("title")}</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <ul className="flex w-max items-start gap-6 [animation:testimonials-marquee_48s_linear_infinite] hover:[animation-play-state:paused]">
          {marqueeTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.author}-${index}`}
              testimonial={testimonial}
            />
          ))}
        </ul>
      </div>
      <style>{`
        @keyframes testimonials-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.75rem));
          }
        }
      `}</style>
    </section>
  );
}
