import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  ArrowRight,
  Cake,
  CheckCircle2,
  Clock3,
  Gift,
  Heart,
  MessageCircleHeart,
  Mic2,
  Music2,
  Palette,
  PartyPopper,
  PlayCircle,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const createBirthdaySongHref = "/create-song?occasion=birthday";

type IconBlock = {
  title: string;
  description: string;
  icon: ReactNode;
};

const benefits: IconBlock[] = [
  {
    title: "Their name in the chorus",
    description:
      "Add the birthday person, inside jokes, favorite memories, and the message you want them to hear.",
    icon: <MessageCircleHeart className="size-6" />,
  },
  {
    title: "Birthday-ready music styles",
    description:
      "Choose upbeat pop, acoustic, funny party energy, romantic ballad, or let the song maker pick the best fit.",
    icon: <PartyPopper className="size-6" />,
  },
  {
    title: "Free preview in minutes",
    description:
      "Hear a custom birthday song sample first, then adjust lyrics or style before unlocking the full track.",
    icon: <Clock3 className="size-6" />,
  },
  {
    title: "A complete gift bundle",
    description:
      "Turn the final song into a music video and printable lyric wall art for a keepsake beyond the party.",
    icon: <Gift className="size-6" />,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Share the birthday story",
    description:
      "Tell us their name, relationship, age or milestone, and a few memories that feel unmistakably them.",
  },
  {
    kicker: "02",
    title: "Pick the mood",
    description:
      "Go heartfelt, funny, romantic, energetic, or let AI match the lyrics and genre to your details.",
  },
  {
    kicker: "03",
    title: "Preview and refine",
    description:
      "Listen to your sample, polish the lyrics, change the genre, and keep shaping it until it feels right.",
  },
  {
    kicker: "04",
    title: "Send the surprise",
    description:
      "Unlock the full song, share it privately, add a video, or print lyric wall art for the birthday table.",
  },
];

const useCases: IconBlock[] = [
  {
    title: "For Mom or Dad",
    description:
      "Celebrate the stories, advice, recipes, road trips, and little rituals that made home feel like home.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "For your partner",
    description:
      "Blend birthday wishes with your love story, favorite dates, private nicknames, and the promise of more memories.",
    icon: <Music2 className="size-5" />,
  },
  {
    title: "For kids and teens",
    description:
      "Make the chorus playful with their hobbies, pets, favorite games, sports moments, and big birthday energy.",
    icon: <Cake className="size-5" />,
  },
  {
    title: "For a best friend",
    description:
      "Turn legendary jokes, chaotic trips, voice notes, and college memories into a song made for one person.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "For a party reveal",
    description:
      "Play the song during cake time, in a slideshow, or as the soundtrack for a birthday video message.",
    icon: <PlayCircle className="size-5" />,
  },
  {
    title: "For a last-minute gift",
    description:
      "Start with a few details, preview quickly, and create a personalized song when a generic gift will not do.",
    icon: <Clock3 className="size-5" />,
  },
];

const exampleBriefs = [
  {
    label: "Heartfelt parent",
    title: "Mom's 60th birthday",
    text: "Write a warm acoustic birthday song for Linda from her daughter Emma. Mention Sunday pancakes, her garden, her laugh, and how she taught me to be brave.",
  },
  {
    label: "Funny friend",
    title: "Best friend roast",
    text: "Create an upbeat pop-rock birthday song for Jason. Include our disastrous camping trip, his karaoke confidence, and the phrase 'still the king of bad ideas'.",
  },
  {
    label: "Romantic partner",
    title: "Birthday love note",
    text: "Make a romantic birthday ballad for Maya from Alex. Mention our first coffee date, the blue scarf, late-night walks, and that every year with her feels new.",
  },
];

const bundleItems: IconBlock[] = [
  {
    title: "Personalized song",
    description:
      "A studio-quality custom song shaped by names, memories, tone, language, and genre.",
    icon: <Mic2 className="size-6" />,
  },
  {
    title: "Music video gift",
    description:
      "Pair the birthday song with photos, lyric scenes, and a shareable video for texts or social posts.",
    icon: <Video className="size-6" />,
  },
  {
    title: "Printable wall art",
    description:
      "Turn favorite lyrics into a birthday keepsake poster they can frame after the candles are out.",
    icon: <Palette className="size-6" />,
  },
];

const testimonials = [
  {
    quote:
      "I put my mom's nickname and our Sunday dinner memories into the prompt. She cried before the first chorus ended.",
    author: "David K.",
    context: "Mom's 50th",
  },
  {
    quote:
      "The song sounded like it was written for my boyfriend, not a template. The 90s indie style was perfect.",
    author: "Sofia R.",
    context: "Boyfriend's birthday",
  },
  {
    quote:
      "I needed something personal the night before the party. The preview came fast, and the final song became the slideshow soundtrack.",
    author: "Chloe B.",
    context: "Last-minute party",
  },
];

const faqs = [
  {
    question: "Can I create a happy birthday song with their name?",
    answer:
      "Yes. Add the recipient's name, nickname, relationship, memories, and message. The song can naturally include those details in the verses or chorus.",
  },
  {
    question: "How fast can I preview a birthday song?",
    answer:
      "You can create a preview in minutes after sharing the story and style. Listen first, then decide whether to refine or unlock the full song.",
  },
  {
    question: "Can the song be funny instead of emotional?",
    answer:
      "Absolutely. Use your brief to ask for funny, heartfelt, romantic, upbeat, or playful. You can include inside jokes and the kind of birthday energy you want.",
  },
  {
    question: "Do I need to know music or songwriting?",
    answer:
      "No. You only need a few real details. The song maker handles lyric structure, genre, vocals, and production.",
  },
  {
    question: "Can I edit the lyrics or change the genre?",
    answer:
      "Yes. After previewing, you can adjust the lyrics and try a different birthday-friendly style before finalizing.",
  },
  {
    question: "How should I give the birthday song?",
    answer:
      "Send the track privately, play it during cake time, add it to a birthday video, or turn the lyrics into printable wall art.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c33f32]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-sans text-3xl font-black leading-tight text-[#261712] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f625c] md:text-lg">
        {description}
      </p>
    </div>
  );
}

function Stars() {
  return (
    <span
      className="flex items-center gap-0.5 text-[#f6be32]"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="size-4 fill-current stroke-current" />
      ))}
    </span>
  );
}

export default function BirthdaySongsPage() {
  return (
    <div className="w-full overflow-hidden bg-[#fffaf7] text-[#2b1914]">
      <section className="relative isolate bg-[#fffaf7] px-6 pb-12 pt-10 sm:px-8 md:pb-14 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_16%,rgba(246,190,50,0.2),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(37,150,142,0.11),transparent_34%),linear-gradient(115deg,rgba(255,247,239,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,239,229,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-white/72" />

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#eadad2] bg-white/85 px-3.5 py-1.5 text-sm text-[#695851] shadow-[0_10px_34px_rgba(92,48,28,0.08)] backdrop-blur">
              <Stars />
              <span className="font-bold text-[#261712]">Excellent</span>
              <span className="text-[#d5c5bd]">/</span>
              <span>Birthday song gifts</span>
            </div>

            <h1 className="mt-5 max-w-[11ch] text-balance font-sans text-[2.5rem] font-black leading-[0.98] tracking-normal text-[#250f0b] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.45rem]">
              Custom Personalized Birthday Songs
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6c5f59] sm:text-lg">
              Turn their name, favorite memories, and birthday message into a
              studio-quality custom song. Create a free preview, refine the
              lyrics, then send a personalized music gift they can replay long
              after the candles are gone.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createBirthdaySongHref}
                size="sm"
                trailingArrow
                className="border-[#e04132] bg-[#e04132] px-6 font-bold text-white shadow-[0_18px_38px_rgba(224,65,50,0.28)] hover:border-[#c93629] hover:bg-[#c93629] hover:text-white"
              >
                Create Your Birthday Song
              </MagneticButton>
              <MagneticButton
                href="#birthday-examples"
                prefetch={false}
                variant="light"
                size="sm"
                className="border-[#d7b9aa] bg-white px-6 font-bold text-[#923328] shadow-[0_14px_30px_rgba(88,45,28,0.1)] hover:border-[#caa995] hover:bg-[#fff2eb] hover:text-[#73251e]"
              >
                <PlayCircle className="size-4" />
                See examples
              </MagneticButton>
            </div>

            <div className="mt-7 grid max-w-lg grid-cols-3 gap-3 text-center">
              {[
                ["2 min", "Preview"],
                ["No skills", "Needed"],
                ["Song + video", "Bundle"],
              ].map(([value, label]) => (
                <div
                  key={value}
                  className="rounded-lg border border-[#eedfd8] bg-white/75 px-3 py-3 shadow-sm"
                >
                  <div className="text-base font-black text-[#27130f]">
                    {value}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#947b70]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#edd6c9] shadow-[0_24px_64px_rgba(69,34,20,0.16)] ring-1 ring-white/80 lg:aspect-[1.42]">
              <Image
                src="/images/occasions/birthday-custom-song-hero.png"
                alt="Smiling birthday recipient listening to a personalized birthday song beside candles"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-[58%_48%]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_42%,rgba(72,29,14,0.16))]" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-lg border border-white/70 bg-white/90 p-3.5 shadow-[0_18px_44px_rgba(65,34,20,0.16)] backdrop-blur md:left-auto md:w-[300px]">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1d958d]/15 text-[#16766f]">
                  <Music2 className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#261712]">
                    Built for birthday reveals
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6f625c]">
                    Play it at cake time, send it by text, or turn it into a
                    keepsake video.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Why it works"
            title="More personal than another birthday card"
            description="A custom birthday song carries the details only you know, then wraps them in music, vocals, and a chorus made for one person."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-lg border border-[#f0e3dc] bg-[#fffaf7] p-6 shadow-[0_14px_38px_rgba(59,31,18,0.05)]"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[#ffe0e7] text-[#bf3f5d]">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#261712]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#74665f]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#f8f2ee] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How it works"
            title="From birthday memory to singable surprise"
            description="You bring the real details. The song maker turns them into lyrics, music, vocals, and a gift that feels impossible to buy off a shelf."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.kicker}
                className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#eadbd3]"
              >
                <div className="mb-6 inline-flex rounded-full bg-[#25130e] px-3 py-1 text-xs font-black text-white">
                  {step.kicker}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#261712]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#74665f]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Birthday moments"
            title="A song for every kind of birthday person"
            description="Use the same custom song flow for family, romance, friendship, kids, and last-minute party saves."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="group rounded-lg border border-[#f0e3dc] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(59,31,18,0.08)]"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[#eaf8f6] text-[#16766f] transition group-hover:bg-[#16766f] group-hover:text-white">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#261712]">
                  {useCase.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#74665f]">
                  {useCase.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="birthday-examples"
        className="bg-[#25130e] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">
                Example briefs
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Start with a few real details
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
                You do not need polished writing. A name, a relationship, a
                memory, and a mood are enough to create a birthday song that
                sounds specific.
              </p>
              <Button
                asChild
                className="mt-7 h-12 rounded-full bg-[#f6be32] px-7 text-base font-black text-[#25130e] hover:bg-[#ffd363]"
              >
                <I18nLink href={createBirthdaySongHref}>
                  Try your own brief
                  <ArrowRight className="size-4" />
                </I18nLink>
              </Button>
            </div>

            <div className="grid gap-4">
              {exampleBriefs.map((brief) => (
                <article
                  key={brief.title}
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#c33f32]">
                      {brief.label}
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {brief.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/75">
                    {brief.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf7] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Gift bundle"
            title="More than an MP3"
            description="A birthday song can become the centerpiece of a complete personalized music gift across audio, video, and printable keepsakes."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {bundleItems.map((item) => (
              <article
                key={item.title}
                className="rounded-lg bg-white p-7 shadow-[0_18px_52px_rgba(59,31,18,0.07)] ring-1 ring-[#eadbd3]"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-[#fff0cf] text-[#b56a00]">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black leading-tight text-[#261712]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#74665f]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Customer reactions"
            title="Birthday songs that land"
            description="When the song includes their actual life, the reaction feels different from any ordinary gift."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.author}
                className="rounded-lg border border-[#f0e3dc] bg-[#fffaf7] p-6"
              >
                <Stars />
                <blockquote className="mt-5 text-base font-semibold leading-7 text-[#3a251f]">
                  "{testimonial.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#e04132] text-sm font-black text-white">
                    {testimonial.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-[#261712]">
                      {testimonial.author}
                    </span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#947b70]">
                      {testimonial.context}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f2ee] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c33f32]">
              FAQ
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black leading-tight text-[#261712] sm:text-4xl md:text-5xl">
              Common birthday song questions
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6f625c] md:text-lg">
              A few details are enough to start, and you can refine before the
              final birthday surprise.
            </p>
          </div>

          <div className="divide-y divide-[#e5d4cc] rounded-lg border border-[#e5d4cc] bg-white">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group px-5 py-4 open:bg-[#fffaf7]"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-black text-[#261712]">
                  {faq.question}
                  <CheckCircle2 className="size-5 shrink-0 text-[#16766f] transition group-open:rotate-12" />
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#74665f]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#25130e] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">
            Ready for their birthday?
          </p>
          <h2 className="mt-3 max-w-4xl text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Create a birthday song that sounds like it could only be for them.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
            Add the name, the memories, and the feeling. Get a free preview and
            turn it into a personalized music gift today.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-full bg-white px-8 text-base font-black text-[#25130e] hover:bg-[#fff2eb]"
          >
            <I18nLink href={createBirthdaySongHref}>
              Create Your Song
              <ArrowRight className="size-4" />
            </I18nLink>
          </Button>
        </div>
      </section>
    </div>
  );
}
