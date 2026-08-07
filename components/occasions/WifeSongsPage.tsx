import FAQ from "@/components/home/FAQ";
import OurProducts from "@/components/home/OurProducts";
import HowItWorksSection from "@/components/shared/HowItWorksSection";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  ArrowRight,
  Clock3,
  Gift,
  Heart,
  MessageCircleHeart,
  Music2,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import WifeHeroVisual from "./WifeHeroVisual";

const createWifeSongHref = "/create-song?occasion=anniversary&recipient=wife";

type IconBlock = {
  title: string;
  description: string;
  icon: ReactNode;
};

const benefits: IconBlock[] = [
  {
    title: "Details only she knows",
    description:
      "Add her name, private nicknames, favorite places, small routines, and the memories that make a custom song for wife feel unmistakably personal.",
    icon: <MessageCircleHeart className="size-6" />,
  },
  {
    title: "Her kind of love song",
    description:
      "Choose acoustic, R&B, pop, country, piano ballad, or another sound she already loves—not a generic romance template.",
    icon: <Music2 className="size-6" />,
  },
  {
    title: "Free preview, then refine",
    description:
      "Hear a personalized song for your wife first, then adjust the lyrics, story, or genre until it feels true to your relationship.",
    icon: <Clock3 className="size-6" />,
  },
  {
    title: "A gift she can keep",
    description:
      "Turn the finished song into a shareable reveal, music video, or lyric wall art that lasts beyond one dinner or one special day.",
    icon: <Gift className="size-6" />,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Tell her story",
    description:
      "Share her name, your relationship, a few memories, and the message you want your wife to hear when the chorus lands.",
  },
  {
    kicker: "02",
    title: "Choose the feeling",
    description:
      "Make it romantic, grateful, playful, nostalgic, or hopeful, then select a music style she will want to replay.",
  },
  {
    kicker: "03",
    title: "Preview and personalize",
    description:
      "Listen to the custom song for your wife, refine any line that needs more of your voice, and try another genre if needed.",
  },
  {
    kicker: "04",
    title: "Plan the reveal",
    description:
      "Send it privately, play it at dinner, make it part of a first dance, or pair it with photos and a romantic playlist.",
  },
];

const moments: IconBlock[] = [
  {
    title: "Anniversary gift",
    description:
      "Celebrate how you met, what you have carried together, and the chapter you are building next with a personalized song for wife.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "Birthday surprise",
    description:
      "Give her something more replayable than a card by turning favorite memories and admiration into a birthday song made just for her.",
    icon: <Gift className="size-5" />,
  },
  {
    title: "Valentine's Day",
    description:
      "Write the love song for your wife that says what a bouquet or generic playlist cannot say on its own.",
    icon: <MessageCircleHeart className="size-5" />,
  },
  {
    title: "First dance or vow renewal",
    description:
      "Build a slower, story-led song for a husband-and-wife first dance, wedding anniversary, or a new set of promises.",
    icon: <PlayCircle className="size-5" />,
  },
  {
    title: "Just because",
    description:
      "A song works when there is no calendar reason at all—only a small detail you want her to know you still notice.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "Long-distance love",
    description:
      "Send a personal song when work, travel, or life keeps you apart and you want a gift that travels better than flowers.",
    icon: <Music2 className="size-5" />,
  },
];

const wifeSongIdeas: IconBlock[] = [
  {
    title: "A love song for my wife",
    description:
      "Make the chorus about your central feeling, then use the verses for details: the first date, the ritual you share, the hard season she helped you through, and the future you still want together.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "Songs for wife from husband",
    description:
      "A grateful song is often strongest when it observes rather than exaggerates. Mention what she carries, what she makes possible, and the ways she turns ordinary days into home.",
    icon: <MessageCircleHeart className="size-5" />,
  },
  {
    title: "Customized song for wife",
    description:
      "Start with one memory, one everyday detail, and one promise for the future. That simple combination gives the song a past, present, and next chapter.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "Songs for the first dance as husband and wife",
    description:
      "Keep the lyrics clear and the tempo unhurried. A first-dance song should leave room for the moment while still telling a story only the two of you share.",
    icon: <PlayCircle className="size-5" />,
  },
];

const exampleBriefs = [
  {
    label: "Romantic anniversary",
    title: "Ten years, still choosing you",
    text: "Write a warm acoustic song for my wife Maya from Alex. Mention our bookstore first date, Sunday pancakes, the blue kitchen, and how I still choose her in every new season.",
  },
  {
    label: "Grateful husband",
    title: "The way she makes home",
    text: "Create a soulful R&B song for my wife Hannah. Thank her for carrying us through a difficult year, mention her midnight tea ritual, our dog Milo, and the peace she brings to our home.",
  },
  {
    label: "Playful couple",
    title: "Our beautiful chaos",
    text: "Make an upbeat indie-pop song for my wife Priya. Include the missed train in Rome, our terrible karaoke duet, Sunday farmer's market trips, and the phrase 'we always find our way'.",
  },
];

const faqs = [
  {
    question: "What should I include in a custom song for my wife?",
    answer:
      "Include a few real memories, one everyday detail, and the message you most want her to hear. Her name or nickname can work naturally in the chorus, but specificity matters more than mentioning every milestone.",
  },
  {
    question: "Can I create a personalized song for my wife if I am not musical?",
    answer:
      "Yes. Start with your story, not a melody. Share the relationship details, choose a style she enjoys, preview the result, and refine the lyrics until they sound true to you.",
  },
  {
    question: "What style works for a love song for my wife?",
    answer:
      "The best style is one she already loves. Acoustic and piano ballads suit intimate messages; R&B and pop feel warm and modern; country works well for plainspoken storytelling. The details matter more than a supposedly correct romantic genre.",
  },
  {
    question: "Is a custom song a good anniversary gift for my wife?",
    answer:
      "Yes. An anniversary creates a natural story arc: how you began, what you have carried together, and what you hope for next. Pair the song with photos, dinner, or a playlist for a fuller reveal.",
  },
  {
    question: "Can I make a song for my wife's birthday or Valentine's Day?",
    answer:
      "Absolutely. The same custom-song flow works for birthdays, Valentine's Day, Mother's Day, weddings, vow renewals, and just-because gifts. Change the memories and emotional direction to match the moment.",
  },
  {
    question: "Can I use a custom song for a first dance with my wife?",
    answer:
      "Yes. For a first dance or vow renewal, focus on how you met, a few defining moments, and the promise you want to make now. Choose a slower genre if you want room to dance and listen to the lyrics.",
  },
  {
    question: "Can I pair the song with a playlist for my wife?",
    answer:
      "Yes. Familiar songs set the mood, while the original track becomes the one she has never heard before. Browse our songs for wife playlist for romantic listening ideas to pair with your reveal.",
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
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#bf3f5d]">
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
    <span className="flex items-center gap-0.5 text-[#f6be32]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-sm leading-none">
          ★
        </span>
      ))}
    </span>
  );
}

type WifeSongsPageProps = {
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

export default function WifeSongsPage({
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: WifeSongsPageProps) {
  return (
    <div className="w-full overflow-hidden bg-[#fffaf7] text-[#2b1914]">
      <section className="relative isolate bg-[#fffaf7] px-6 pb-12 pt-10 sm:px-8 md:pb-14 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_16%,rgba(246,190,50,0.2),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(184,63,93,0.13),transparent_34%),linear-gradient(115deg,rgba(255,247,239,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,239,245,0.76)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-white/72" />

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/58 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(92,48,28,0.08),0_2px_10px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(214,189,176,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/42">
              <Stars />
              <span className="font-bold text-[#261712]">Excellent</span>
              <span className="text-[#d8c6bd]">/</span>
              <span>Personalized songs for your wife</span>
            </div>

            <h1 className="mt-5 max-w-[11ch] text-balance font-sans text-[2.5rem] font-black leading-[0.98] tracking-normal text-[#250f0b] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.45rem]">
              Custom Song for Wife
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6c5f59] sm:text-lg">
              Turn the memories, little routines, and message you want to say
              out loud into a custom song for your wife. Create a free preview,
              refine the lyrics, and give her a personalized love song she will
              want to replay long after the reveal.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createWifeSongHref}
                size="sm"
                trailingArrow
                className="border-[#bf3f5d] bg-[#bf3f5d] px-6 font-bold text-white shadow-[0_18px_38px_rgba(191,63,93,0.28)] hover:border-[#9f304b] hover:bg-[#9f304b] hover:text-white"
              >
                Create a Song for My Wife
              </MagneticButton>
              <MagneticButton
                href="#wife-examples"
                prefetch={false}
                size="sm"
                variant="light"
                className="border-[#d7b9aa] bg-white px-6 font-bold text-[#923328] shadow-[0_14px_30px_rgba(88,45,28,0.1)] hover:border-[#caa995] hover:bg-[#fff2eb] hover:text-[#73251e]"
              >
                <PlayCircle className="size-4" />
                See example briefs
              </MagneticButton>
            </div>
          </div>

          <WifeHeroVisual />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why it works"
            title="A personalized song for your wife says more than a generic gift"
            description="A custom song carries the details only you know, then turns them into lyrics, music, and a chorus made for one person."
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

      <HowItWorksSection
        description="You bring the real details. The song maker turns them into lyrics, music, vocals, and a personalized song for wife that cannot be bought off a shelf."
        eyebrow="How it works"
        steps={steps}
        title="From your memories to a custom love song for your wife"
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="For every moment"
            title="Give her a song for the occasion—or just because"
            description="A custom song for your wife can be romantic, grateful, playful, or quietly emotional. The story and delivery change with the moment."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moments.map((moment) => (
              <article
                key={moment.title}
                className="group rounded-lg border border-[#f0e3dc] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(59,31,18,0.08)]"
              >
                <div className="bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground mb-5 flex size-11 items-center justify-center rounded-lg transition">
                  {moment.icon}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#261712]">
                  {moment.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#74665f]">
                  {moment.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff4f7] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Made for her"
            title="The details that make a custom song for wife land"
            description="If a song is for your wife, it should sound like it could not belong to anyone else. Use the details below to choose the right angle before you start."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {wifeSongIdeas.map((idea) => (
              <article
                key={idea.title}
                className="rounded-lg border border-[#eed8df] bg-white p-7 shadow-[0_16px_42px_rgba(76,38,52,0.06)] sm:p-8"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[#ffe0e7] text-[#bf3f5d]">
                  {idea.icon}
                </div>
                <h3 className="text-2xl font-black leading-tight text-[#261712]">
                  {idea.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#74665f]">
                  {idea.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-[#eed8df] bg-white px-6 py-5 text-center shadow-sm">
            <p className="text-sm leading-7 text-[#6f625c]">
              Want a reveal around the song? Browse the{" "}
              <I18nLink
                className="font-bold text-[#b83b30] underline decoration-[#e7b6c2] underline-offset-4 transition hover:text-[#8f2b23]"
                href="/playlists/recipients/wife"
              >
                songs for wife playlist
              </I18nLink>{" "}
              or read our{" "}
              <I18nLink
                className="font-bold text-[#b83b30] underline decoration-[#e7b6c2] underline-offset-4 transition hover:text-[#8f2b23]"
                href="/blog/custom-song-for-wife"
              >
                custom song for wife guide
              </I18nLink>
              .
            </p>
          </div>
        </div>
      </section>

      <section
        className="bg-[#25130e] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16"
        id="wife-examples"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">
                Example briefs
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Start with the moments she would recognize instantly
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
                You do not need polished lyrics. A memory, an everyday detail,
                and the feeling you want her to carry are enough to start.
              </p>
              <Button
                asChild
                className="mt-7 h-12 rounded-full bg-[#f6be32] px-7 text-base font-black text-[#25130e] hover:bg-[#ffd363]"
              >
                <I18nLink href={createWifeSongHref}>
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
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#bf3f5d]">
                      {brief.label}
                    </span>
                    <h3 className="text-lg font-black text-white">{brief.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/75">{brief.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <OurProducts
        isAuthenticated={isAuthenticated}
        musicVideoSongOptions={musicVideoSongOptions}
        wallArtSongOptions={wallArtSongOptions}
      />

      <FAQ
        ctaButtonLabel="Create a Song for My Wife"
        ctaDescription="Add the name, the memories, and the feeling you want her to hear. Start with a free preview today."
        ctaHref={createWifeSongHref}
        ctaTitle="Ready to make it personal?"
        description="Start with a few honest details, then preview and refine the song before you plan the reveal."
        items={faqs}
        title="Custom song for wife questions"
      />
    </div>
  );
}
