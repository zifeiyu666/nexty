import FAQ from "@/components/home/FAQ";
import Testimonials, {
  type TestimonialItem,
} from "@/components/home/Testimonials";
import HowItWorksSection from "@/components/shared/HowItWorksSection";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { MusicVideoStudioCta } from "@/components/song/MusicVideoStudioCta";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { WallArtStudioCta } from "@/components/song/WallArtStudioCta";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  ArrowRight,
  Clapperboard,
  Edit3,
  FileMusic,
  Gift,
  HeartHandshake,
  ImageIcon,
  Mic2,
  Music2,
  PenLine,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const createSongLyricsHref = "/create-song?step=recipient";

type IconBlock = {
  title: string;
  description: string;
  icon: ReactNode;
};

type GiftPath = {
  title: string;
  description: string;
  icon: ReactNode;
  eyebrow: string;
  ctaLabel: string;
  kind: "create" | "wallArt" | "musicVideo";
};

const benefits: IconBlock[] = [
  {
    title: "Free AI lyric generator",
    description:
      "Start with a name, a memory, and the feeling you want to send. The lyric generator turns raw story details into a personal first draft.",
    icon: <Wand2 className="size-6" />,
  },
  {
    title: "Editable lyric studio",
    description:
      "Polish the title, rewrite selected lines, compare new versions, and keep shaping the lyrics before the song is made.",
    icon: <Edit3 className="size-6" />,
  },
  {
    title: "Printable lyric wall art",
    description:
      "Turn finalized lyrics into framed-style posters, record layouts, heart designs, and lyric portraits for a keepsake they can display.",
    icon: <ImageIcon className="size-6" />,
  },
  {
    title: "Lyric music video keepsakes",
    description:
      "Pair the custom song with a visual lyric video so the gift feels ready to send, post, or play during the reveal.",
    icon: <Clapperboard className="size-6" />,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Share the story",
    description:
      "Add the recipient, occasion, relationship, inside jokes, vows, memories, or the message you wish you could say better.",
  },
  {
    kicker: "02",
    title: "Generate and edit lyrics",
    description:
      "Use the free lyric AI generator, then edit lines directly or ask for a fresh version with a clearer mood.",
  },
  {
    kicker: "03",
    title: "Create the song",
    description:
      "Choose a style and voice, preview the custom song, then finalize the track when the lyrics feel gift-ready.",
  },
  {
    kicker: "04",
    title: "Make the keepsake",
    description:
      "Open Wall Art Studio or Music Video Studio to turn those lyrics into a printable or watchable lyric gift.",
  },
];

const useCases: IconBlock[] = [
  {
    title: "Anniversary lyrics",
    description:
      "Capture first dates, vows, private phrases, and the ordinary moments that made the relationship yours.",
    icon: <HeartHandshake className="size-5" />,
  },
  {
    title: "Birthday lyric gifts",
    description:
      "Write a chorus around their name, milestone, favorite stories, and the exact birthday energy you want.",
    icon: <Gift className="size-5" />,
  },
  {
    title: "Wedding vow songs",
    description:
      "Turn vows, proposal memories, and reception messages into lyrics for a first dance or surprise video.",
    icon: <PenLine className="size-5" />,
  },
  {
    title: "Tribute keepsakes",
    description:
      "Shape gratitude, remembrance, and family stories into lyrics that can become a song, poster, or video.",
    icon: <FileMusic className="size-5" />,
  },
  {
    title: "Partner surprises",
    description:
      "Blend love notes, nicknames, trip memories, and small daily details into something more personal than a card.",
    icon: <Music2 className="size-5" />,
  },
  {
    title: "Last-minute gifts",
    description:
      "Begin with a short brief and leave with lyrics that can grow into a complete custom song lyric gift.",
    icon: <Sparkles className="size-5" />,
  },
];

const exampleBriefs = [
  {
    label: "Anniversary",
    title: "Ten years in small moments",
    text: "Write warm acoustic lyrics for Nora from Eli. Mention our rainy first date, the tiny apartment kitchen, the blue mugs, and how ten years still feels like the beginning.",
  },
  {
    label: "Birthday",
    title: "Best friend birthday chorus",
    text: "Create playful pop lyrics for Jamie's birthday. Include our road trip playlist, her fearless karaoke, the phrase 'queen of impossible plans', and a chorus that feels bright.",
  },
  {
    label: "Tribute",
    title: "Family remembrance",
    text: "Write gentle tribute lyrics for Grandpa Ray. Mention fishing at sunrise, his old radio, the stories he told twice, and how his kindness still guides the family.",
  },
  {
    label: "Wedding vows",
    title: "Reception surprise",
    text: "Turn my wedding vows for Mia into cinematic lyrics. Include the bookstore proposal, our Sunday walks, and the promise to keep choosing each other.",
  },
  {
    label: "Partner gift",
    title: "Long-distance love note",
    text: "Make intimate R&B lyrics for Alex from Sam. Mention late-night calls, airport reunions, our shared calendar countdowns, and the line 'home is your voice'.",
  },
];

const giftPaths: GiftPath[] = [
  {
    eyebrow: "Start free",
    title: "AI lyric generator and editor",
    description:
      "Create a personal lyric draft, rewrite individual lines, edit the title, and shape the words before turning them into music.",
    icon: <Wand2 className="size-6" />,
    ctaLabel: "Create song lyrics free",
    kind: "create",
  },
  {
    eyebrow: "Printable",
    title: "Lyric wall art",
    description:
      "Use your finalized song lyrics in wall art templates built for framed posters, record-style designs, heart layouts, and photo lyric portraits.",
    icon: <ImageIcon className="size-6" />,
    ctaLabel: "Open Wall Art Studio",
    kind: "wallArt",
  },
  {
    eyebrow: "Shareable",
    title: "Lyric music video",
    description:
      "Turn the finished custom song into a visual keepsake with lyrics, photos, motion, and a format made for sending or posting.",
    icon: <Clapperboard className="size-6" />,
    ctaLabel: "Open Music Video Studio",
    kind: "musicVideo",
  },
];

const testimonials: TestimonialItem[] = [
  {
    quote:
      "I started with messy notes from our anniversary card. The lyric editor helped me turn them into lines that sounded like us, then the wall art became the actual gift.",
    author: "Maya R.",
    badge: "Anniversary lyrics",
    cardClassName: "bg-[#fff6ef] dark:bg-[#32251f]",
  },
  {
    quote:
      "The birthday lyrics felt personal before I even made the song. Having the song, poster, and video in one flow made the surprise feel complete.",
    author: "Jordan K.",
    badge: "Birthday gift",
    cardClassName: "bg-[#f1f7f5] dark:bg-[#20302c]",
  },
  {
    quote:
      "We used the lyric video at the reception and printed the chorus afterward. It felt like one memory turned into three keepsakes.",
    author: "Claire & Theo",
    badge: "Wedding vows",
    cardClassName: "bg-[#f7f2ea] dark:bg-[#2e2a22]",
  },
];

const faqs = [
  {
    question: "Can I generate custom song lyrics for free?",
    answer:
      "Yes. You can start the create-song flow, share the story and style, and use the lyric AI generator before deciding whether to create or unlock the full song.",
  },
  {
    question: "Can I edit the AI lyrics?",
    answer:
      "Yes. The lyric editor lets you change the song title, edit lines directly, rewrite selected lines, and request a fresh lyric version.",
  },
  {
    question: "Do I need a finalized song for lyric wall art?",
    answer:
      "Wall Art Studio uses finalized song lyrics, title, artwork, and share link. If you do not have a finalized song yet, the studio will guide you to create one first.",
  },
  {
    question: "How does the lyric music video work?",
    answer:
      "After you finalize a song, Music Video Studio can use the audio and lyrics to create a visual gift with lyric-focused templates.",
  },
  {
    question: "What kinds of lyric gifts can I make?",
    answer:
      "Common custom song lyric gifts include anniversary songs, birthday lyrics, wedding vow songs, tribute keepsakes, partner gifts, printable lyric posters, and lyric videos.",
  },
  {
    question: "Do I need songwriting or design skills?",
    answer:
      "No. Bring real details and the mood you want. The generator helps with lyrics, and the wall art and music video studios provide gift-ready templates.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  inverse?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p
        className={`text-xs font-bold uppercase tracking-[0.24em] ${
          inverse ? "text-[#f6c85f]" : "text-[#c65b4a]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-balance font-sans text-3xl font-black leading-tight sm:text-4xl md:text-5xl ${
          inverse ? "text-white" : "text-[#251a15]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mx-auto mt-4 max-w-2xl text-base leading-7 md:text-lg ${
          inverse ? "text-white/72" : "text-[#6f625c]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function Stars() {
  return (
    <span
      className="flex items-center gap-0.5 text-[#e7a92e]"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="size-3 fill-current" />
      ))}
    </span>
  );
}

function LyricGiftHeroVisual() {
  return (
    <div className="relative">
      <div className="relative aspect-[1.6] overflow-hidden rounded-lg bg-[#eaded2] shadow-[0_30px_82px_rgba(53,34,24,0.22)] ring-1 ring-white/80 lg:aspect-[1.38]">
        <Image
          src="/images/occasions/custom-song-lyric-gifts-hero.webp"
          alt="Custom song lyric gifts with handwritten lyrics, framed wall art, and a music preview"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-[55%_50%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,250,244,0.22),transparent_42%,rgba(31,18,12,0.12))]" />
      </div>

      <div className="absolute -bottom-5 left-4 right-4 rounded-lg border border-white/70 bg-white/88 p-3.5 shadow-[0_22px_56px_rgba(52,32,22,0.18)] backdrop-blur-md md:left-auto md:w-[315px]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f2d1c2] text-[#9b4638]">
            <Mic2 className="size-4" />
          </span>
          <div>
            <p className="text-sm font-black text-[#251a15]">
              Lyrics become the gift
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6f625c]">
              Generate, edit, sing, print, or turn the same words into a video.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type CustomSongLyricGiftsPageProps = {
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

export default function CustomSongLyricGiftsPage({
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: CustomSongLyricGiftsPageProps) {
  const studioCtaClassName =
    "group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#251a15] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(37,26,21,0.18)] transition hover:bg-[#3a261e]";

  return (
    <div className="w-full overflow-hidden bg-[#fffaf5] text-[#2b1d17]">
      <section className="relative isolate bg-[#fffaf5] px-6 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,250,245,1)_0%,rgba(255,255,255,0.95)_45%,rgba(237,249,244,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-white/76" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.88fr_1fr] lg:gap-11">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(92,48,28,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl">
              <Stars />
              <span className="font-bold text-[#251a15]">Free AI lyric generator</span>
              <span className="text-[#d7c3b8]">/</span>
              <span>Personalized song lyrics</span>
            </div>

            <h1 className="mt-5 max-w-[12ch] text-balance font-sans text-[2.55rem] font-black leading-[0.98] tracking-normal text-[#24120d] min-[420px]:text-[3rem] sm:text-[3.8rem] lg:text-[4.55rem]">
              Free AI Song Lyric Generator
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#6b5e57] sm:text-lg">
              Turn a real story into personal lyrics, edit every line, and create
              a custom song when the words sound right. Your finished song can
              also become a printable lyric poster or a shareable music video.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createSongLyricsHref}
                size="sm"
                trailingArrow
                className="border-[#d95440] bg-[#d95440] px-6 font-bold text-white shadow-[0_18px_38px_rgba(217,84,64,0.28)] hover:border-[#bf4534] hover:bg-[#bf4534] hover:text-white"
              >
                Create song lyrics free
              </MagneticButton>
              <WallArtStudioCta
                className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-[#d7b9aa] bg-white px-6 text-sm font-bold text-[#8a3a2f] shadow-[0_14px_30px_rgba(88,45,28,0.1)] transition hover:border-[#caa995] hover:bg-[#fff2eb] hover:text-[#73251e] sm:h-11"
                isAuthenticated={isAuthenticated}
                label="Open Wall Art Studio"
                songOptions={wallArtSongOptions}
              />
            </div>
            <I18nLink
              href="/blog/song-lyric-wall-art-ideas"
              className="mt-5 inline-flex text-sm font-bold text-[#8a3a2f] underline decoration-[#d7b9aa] underline-offset-4 transition hover:text-[#63261d]"
            >
              Explore lyric wall art ideas
            </I18nLink>
          </div>

          <LyricGiftHeroVisual />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why lyric gifts work"
            title="One set of words, three ways to give it"
            description="Start with a story and shape the lyrics before choosing how you want to share the finished song."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-lg border border-[#efe1d8] bg-[#fffaf5] p-6 shadow-[0_14px_38px_rgba(59,31,18,0.05)]"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[#dff2ed] text-[#1d7c73]">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#251a15]">
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
        eyebrow="How it works"
        title="From story to personalized lyrics"
        description="You bring the details. The lyric generator and editor help turn them into words that can become a song, poster, or video."
        steps={steps}
        sectionClassName="bg-[#f5eee7]"
        cardClassName="border border-[#eadbd3] shadow-[0_14px_34px_rgba(54,35,23,0.06)]"
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Gift occasions"
            title="Lyrics for the moments people keep"
            description="The same custom lyric flow works for romance, family, weddings, birthdays, tributes, and last-minute heartfelt gifts."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="group rounded-lg border border-[#efe1d8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(59,31,18,0.08)]"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[#fff0d8] text-[#aa6a12] transition group-hover:bg-[#251a15] group-hover:text-white">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-black leading-tight text-[#251a15]">
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

      <section className="bg-[#241711] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6c85f]">
                Example briefs
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Start with the details only you know
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
                The best lyric gifts sound specific. Names, places, repeated
                phrases, and small memories give the AI lyric generator
                something real to work with.
              </p>
              <I18nLink
                href={createSongLyricsHref}
                className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f6c85f] px-7 text-base font-black text-[#241711] transition hover:bg-[#ffdb86]"
              >
                Try your own brief
                <ArrowRight className="size-4" />
              </I18nLink>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {exampleBriefs.map((brief) => (
                <article
                  key={brief.title}
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#b54e3e]">
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

      <section className="bg-[#fbfaf7] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Gift formats"
            title="Make the lyrics sing, print, or move"
            description="Choose the format that fits the reveal: a custom song, a printable lyric poster, or a lyric music video."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {giftPaths.map((path) => (
              <article
                key={path.title}
                className="flex min-h-[360px] flex-col rounded-lg border border-[#eadbd1] bg-white p-7 shadow-[0_18px_52px_rgba(36,27,18,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#e5f4f0] text-[#1d7c73]">
                    {path.icon}
                  </div>
                  <span className="rounded-full bg-[#fff0d8] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a5b12]">
                    {path.eyebrow}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-black leading-tight text-[#251a15]">
                  {path.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#6f625c]">
                  {path.description}
                </p>

                {path.kind === "create" ? (
                  <I18nLink href={createSongLyricsHref} className={studioCtaClassName}>
                    {path.ctaLabel}
                    <ArrowRight className="size-5" />
                  </I18nLink>
                ) : path.kind === "wallArt" ? (
                  <WallArtStudioCta
                    className={studioCtaClassName}
                    isAuthenticated={isAuthenticated}
                    label={path.ctaLabel}
                    songOptions={wallArtSongOptions}
                  />
                ) : (
                  <MusicVideoStudioCta
                    className={studioCtaClassName}
                    isAuthenticated={isAuthenticated}
                    label={path.ctaLabel}
                    songOptions={musicVideoSongOptions}
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <Testimonials
        title="Personal lyrics people keep"
        description="When the words include their real life, the song, poster, or video feels less like a template and more like a memory."
        items={testimonials}
        contentWidthClassName="max-w-6xl"
      />

      <FAQ
        title="AI song lyric generator questions"
        description="Practical details about writing, editing, and turning personalized lyrics into a finished song or keepsake."
        items={faqs}
        ctaTitle="Ready to write the lyric gift?"
        ctaDescription="Start with the story, generate free lyrics, and turn the best lines into a custom song, wall art, or lyric video."
        ctaButtonLabel="Create song lyrics free"
        ctaHref={createSongLyricsHref}
      />
    </div>
  );
}
