import FAQ from "@/components/home/FAQ";
import OurProducts from "@/components/home/OurProducts";
import Testimonials, {
  type TestimonialItem,
} from "@/components/home/Testimonials";
import MusicGiftHeroVisual from "@/components/occasions/MusicGiftHeroVisual";
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
  Headphones,
  Heart,
  MessageCircleHeart,
  Music2,
  PlayCircle,
  Sparkles,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";

const createMusicGiftSongHref = "/create-song?occasion=music-gift";

type IconBlock = {
  title: string;
  description: string;
  icon: ReactNode;
};

type SearchIntentSpotlight = {
  title: string;
  description: string;
  searchTerms: string[];
  promptHint: string;
  icon: ReactNode;
  cardClassName?: string;
};

const benefits: IconBlock[] = [
  {
    title: "Personalized music, not a generic playlist",
    description:
      "Turn names, stories, inside jokes, and favorite moments into a custom song that feels written for one person.",
    icon: <MessageCircleHeart className="size-6" />,
  },
  {
    title: "Built for music lovers",
    description:
      "Shape the gift around genre taste, listening habits, and the kind of emotional tone they actually replay.",
    icon: <Headphones className="size-6" />,
  },
  {
    title: "Free preview in minutes",
    description:
      "Start with a preview, then refine the lyrics, style, and message before you unlock the full version.",
    icon: <Clock3 className="size-6" />,
  },
  {
    title: "Lyric gifts with staying power",
    description:
      "Bundle the final song with a music video or printable lyric wall art for a keepsake that lasts beyond the reveal.",
    icon: <Gift className="size-6" />,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Tell us who this gift is for",
    description:
      "Share their name, your relationship, what they love to listen to, and the memory or message you want the song to carry.",
  },
  {
    kicker: "02",
    title: "Choose the music direction",
    description:
      "Go cinematic, acoustic, pop, indie, playful, romantic, or pick the vibe that best matches the person receiving it.",
  },
  {
    kicker: "03",
    title: "Preview and polish",
    description:
      "Listen to the sample, tweak the lyrics, and fine-tune the tone until the personalized music gift feels unmistakably theirs.",
  },
  {
    kicker: "04",
    title: "Deliver the full keepsake",
    description:
      "Send the track, surprise them on a holiday or birthday, or turn the lyrics into wall art for a gift they can revisit anytime.",
  },
];

const useCases: IconBlock[] = [
  {
    title: "Gifts for music lovers",
    description:
      "Make the gift feel more thoughtful than merch by reflecting the sounds, moods, and references they actually care about.",
    icon: <Music2 className="size-5" />,
  },
  {
    title: "Music gifts for kids",
    description:
      "Create something playful and age-friendly with their hobbies, favorite animals, family jokes, and big sing-along energy.",
    icon: <Star className="size-5" />,
  },
  {
    title: "Music Christmas ideas",
    description:
      "Use it as a Christmas surprise that feels warm and personal without leaning on generic holiday gift filler.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "For your partner",
    description:
      "Turn a shared song memory, a private nickname, or your love story into a personalized music gift with replay value.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "For family or a best friend",
    description:
      "Celebrate milestones, gratitude, or long history with a custom song that feels more intimate than a card or gift card.",
    icon: <PlayCircle className="size-5" />,
  },
  {
    title: "For a last-minute surprise",
    description:
      "When time is short, a fast preview helps you create a gift that still feels intentional, specific, and memorable.",
    icon: <Clock3 className="size-5" />,
  },
];

const searchIntentSpotlights: SearchIntentSpotlight[] = [
  {
    title: "Music gifts for music lovers",
    description:
      "This search intent usually means the buyer wants something more personal than headphones, vinyl, or merch. A custom song works best when the gift reflects listening taste and emotional context together.",
    searchTerms: ["music gift", "gifts for music lover"],
    promptHint:
      "Include the genres they obsess over, where they listen most, a lyric-worthy memory, and what you want them to feel when the chorus hits.",
    icon: <Headphones className="size-5" />,
    cardClassName:
      "lg:col-span-2 xl:col-span-2 bg-[linear-gradient(135deg,rgba(255,248,243,0.98),rgba(255,255,255,0.9))]",
  },
  {
    title: "Music Christmas gift ideas",
    description:
      "Holiday gifting works especially well when the song sounds like a keepsake instead of a novelty. This angle fits partner gifts, family reveals, and thoughtful December surprises.",
    searchTerms: ["music christmas ideas", "christmas music gifts"],
    promptHint:
      "Add the holiday setting, a favorite winter memory, family traditions, and whether you want the song to feel nostalgic, cozy, or playful.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "Music gifts for kids",
    description:
      "Kid-friendly music gifts do best when they feel energetic, safe, and specific to the child. Songs built around nicknames, routines, and favorite things land especially well.",
    searchTerms: ["music gifts for kids", "personalized music for kids"],
    promptHint:
      "Mention their nickname, favorite activities, pets, and whether the song should feel silly, adventurous, bedtime-soft, or birthday-ready.",
    icon: <Star className="size-5" />,
  },
  {
    title: "Personalized music gifts for couples",
    description:
      "This intent overlaps with romantic gifting, anniversary-style surprises, and everyday keepsake moments where a custom song feels more intimate than another object.",
    searchTerms: ["personalized music", "personalized music gift"],
    promptHint:
      "Bring in the private language, one cinematic memory, the mood of the relationship, and the reason this gift matters right now.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "Lyric gifts and wall art",
    description:
      "Some buyers want a physical keepsake as much as the audio. This topic should guide them toward printable lyric art and replayable song delivery as one cohesive gift.",
    searchTerms: ["lyric gifts", "song lyric gift"],
    promptHint:
      "Think about the exact line you want framed, the photo or color mood that suits it, and whether the gift should feel romantic, family-centered, or quietly sentimental.",
    icon: <Gift className="size-5" />,
  },
  {
    title: "Custom song gift for family or friends",
    description:
      "This catch-all intent captures people who know a generic present will not feel right. The strongest briefs start with one real story and one clear emotional angle.",
    searchTerms: ["custom song gift", "personalized gift with music"],
    promptHint:
      "Choose one story, one shared phrase, and one detail only the two of you would recognize so the gift feels grounded and specific.",
    icon: <MessageCircleHeart className="size-5" />,
  },
];

const exampleBriefs = [
  {
    label: "For kids",
    title: "Playful birthday surprise",
    text: "Write a bright, playful pop song for Noah from his parents. Mention dinosaur pajamas, weekend pancakes, his scooter races, and how he sings to the dog every morning.",
  },
  {
    label: "Christmas gift",
    title: "Holiday keepsake",
    text: "Create a warm Christmas song for my wife Hannah. Mention the cedar tree, our midnight cocoa ritual, the silver record ornament, and how home always sounds better with her there.",
  },
  {
    label: "Music lover",
    title: "Indie-listening gift",
    text: "Make an intimate indie-folk song for Marco from Lena. Include our late train rides, his obsession with vinyl sleeves, the first concert we missed the last train after, and the line 'you made the static feel like home'.",
  },
];

const testimonials: TestimonialItem[] = [
  {
    quote:
      "I wanted something better than another gadget for my boyfriend. The song referenced his favorite records and our first concert, and it felt wildly personal.",
    author: "Elena V.",
    badge: "Music lover gift",
    cardClassName: "bg-[#fff2ea] dark:bg-[#3a241d]",
  },
  {
    quote:
      "We used the lyric wall art as part of the wrapped gift, then played the song after dinner. It landed like a real keepsake, not a gimmick.",
    author: "Marcus T.",
    badge: "Lyric gift reveal",
    cardClassName: "bg-[#f6f2ef] dark:bg-[#2d2421]",
  },
  {
    quote:
      "I needed a personalized Christmas idea for my daughter and this was perfect. The preview came fast, and the final version became the family favorite.",
    author: "Rachel P.",
    badge: "Christmas surprise",
    cardClassName: "bg-[#f7f3f1] dark:bg-[#2d2421]",
  },
];

const faqs = [
  {
    question: "What is a personalized music gift?",
    answer:
      "A personalized music gift turns real details such as names, memories, favorite sounds, and your message into a custom song you can preview, refine, and share as a keepsake.",
  },
  {
    question: "Is this a good gift for music lovers?",
    answer:
      "Yes. It works especially well for music lovers because the gift can reflect their taste, listening habits, favorite moods, and the emotional story you want the song to carry.",
  },
  {
    question: "Can I use this for Christmas gift ideas?",
    answer:
      "Absolutely. A custom song makes a strong Christmas surprise because it feels personal, replayable, and easy to pair with lyric art or a cozy reveal moment.",
  },
  {
    question: "Are personalized music gifts good for kids?",
    answer:
      "Yes. You can make the song playful, gentle, funny, or energetic with kid-friendly details like nicknames, hobbies, pets, and family rituals.",
  },
  {
    question: "How do lyric gifts work?",
    answer:
      "After the song is finalized, you can turn the lyrics into printable wall art or pair the audio with a visual keepsake so the gift feels both listenable and displayable.",
  },
  {
    question: "Can I preview and edit the song before gifting it?",
    answer:
      "Yes. You can start with a preview, then adjust lyrics, tone, and genre before unlocking the full song.",
  },
  {
    question: "Do I need music or songwriting experience?",
    answer:
      "No. You only need a few real details about the person and the moment. The song maker handles the lyric structure, production, and vocal direction.",
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
        <span key={index} className="text-sm leading-none">
          ★
        </span>
      ))}
    </span>
  );
}

type MusicGiftSongsPageProps = {
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

export default function MusicGiftSongsPage({
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: MusicGiftSongsPageProps) {
  return (
    <div className="w-full overflow-hidden bg-[#fffaf7] text-[#2b1914]">
      <section className="relative isolate bg-[#fffaf7] px-6 pb-12 pt-10 sm:px-8 md:pb-14 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_16%,rgba(246,190,50,0.2),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(162,96,77,0.12),transparent_34%),linear-gradient(115deg,rgba(255,247,239,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,240,232,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-white/72" />

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/58 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(92,48,28,0.08),0_2px_10px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(214,189,176,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/42">
              <Stars />
              <span className="font-bold text-[#261712]">Excellent</span>
              <span className="text-[#d8c6bd]">/</span>
              <span>Personalized music gifts</span>
            </div>

            <h1 className="mt-5 max-w-[12ch] text-balance font-sans text-[2.5rem] font-black leading-[0.98] tracking-normal text-[#250f0b] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.45rem]">
              Music Personalized Gifts Written for Them
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6c5f59] sm:text-lg">
              Create a custom song gift for the music lover in your life, then
              turn it into a replayable keepsake with a preview, music video,
              and lyric wall art. It is a more personal way to give
              personalized music for Christmas, kids, partners, family, or
              friends.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createMusicGiftSongHref}
                size="sm"
                trailingArrow
                className="border-[#c95c3c] bg-[#c95c3c] px-6 font-bold text-white shadow-[0_18px_38px_rgba(201,92,60,0.28)] hover:border-[#ae4729] hover:bg-[#ae4729] hover:text-white"
              >
                Create Your Music Gift
              </MagneticButton>
              <MagneticButton
                href="#music-gift-examples"
                prefetch={false}
                variant="light"
                size="sm"
                className="border-[#d7b9aa] bg-white px-6 font-bold text-[#923328] shadow-[0_14px_30px_rgba(88,45,28,0.1)] hover:border-[#caa995] hover:bg-[#fff2eb] hover:text-[#73251e]"
              >
                <PlayCircle className="size-4" />
                See examples
              </MagneticButton>
            </div>
          </div>

          <MusicGiftHeroVisual />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why it works"
            title="More lasting than another generic music gift"
            description="A personalized music gift combines story, sound, and keepsake value in one reveal. It feels specific because it is built around the person, not just the category."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-lg border border-[#f0e3dc] bg-[#fffaf7] p-6 shadow-[0_14px_38px_rgba(59,31,18,0.05)]"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[#ffe6dc] text-[#b85639]">
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
        eyebrow="How it works"
        title="From gift idea to replayable keepsake"
        description="You bring the person, the feeling, and the real details. The song maker turns that into personalized music you can preview, refine, and gift with confidence."
        steps={steps}
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Gift moments"
            title="One music gift, many reasons to give it"
            description="Use the same custom-song flow for holiday gifting, kids, romance, family appreciation, and thoughtful surprises for music lovers."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="group rounded-lg border border-[#f0e3dc] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(59,31,18,0.08)]"
              >
                <div className="bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground mb-5 flex size-11 items-center justify-center rounded-lg transition">
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

      <section className="bg-[#fff6f1] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Search intent"
            title="Music gift ideas that map to real buying intent"
            description="This section speaks directly to the ways people search for meaningful music gifts, then connects those searches to one flexible custom-song product."
          />

          <p className="mx-auto mt-6 max-w-4xl text-center text-sm leading-7 text-[#7a6961] md:text-base">
            People searching for music gifts are often looking for something
            thoughtful, not just another accessory. These topic clusters help
            the page cover Christmas, kids, couples, lyric gifts, and music
            lover gifting without sounding stuffed or repetitive.
          </p>

          <div className="mt-12 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {searchIntentSpotlights.map((spotlight) => (
              <article
                key={spotlight.title}
                className={`rounded-[28px] border border-[#f0dcd2] bg-white p-6 shadow-[0_18px_48px_rgba(78,40,21,0.08)] ${spotlight.cardClassName ?? ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffe4d6] text-[#b74b38]">
                    {spotlight.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b85a47]">
                      Music gift topic
                    </p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-[#261712]">
                      {spotlight.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#715f57]">
                  {spotlight.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {spotlight.searchTerms.map((term) => (
                    <span
                      key={term}
                      className="rounded-full border border-[#edd0c1] bg-[#fffaf7] px-3 py-1 text-xs font-semibold text-[#7a4e41]"
                    >
                      {term}
                    </span>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[#fffaf7] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b85a47]">
                    Prompt direction
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6e5d56]">
                    {spotlight.promptHint}
                  </p>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  className="mt-5 h-auto px-0 text-sm font-black text-[#9a2f25] hover:bg-transparent hover:text-[#7d221a]"
                >
                  <I18nLink href={createMusicGiftSongHref}>
                    Create this music gift
                    <ArrowRight className="size-4" />
                  </I18nLink>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="music-gift-examples"
        className="bg-[#25130e] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">
                Example briefs
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Start with a few details that sound like them
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
                You do not need songwriter language. A person, a scene, and one
                true detail are enough to turn a music gift into something that
                feels intimate.
              </p>
              <Button
                asChild
                className="mt-7 h-12 rounded-full bg-[#f6be32] px-7 text-base font-black text-[#25130e] hover:bg-[#ffd363]"
              >
                <I18nLink href={createMusicGiftSongHref}>
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

      <OurProducts
        isAuthenticated={isAuthenticated}
        musicVideoSongOptions={musicVideoSongOptions}
        wallArtSongOptions={wallArtSongOptions}
      />

      <Testimonials
        title="Music gifts that feel deeply personal"
        description="When the song sounds connected to their real life, the gift lands differently from anything off a shelf."
        items={testimonials}
        contentWidthClassName="max-w-6xl"
      />

      <FAQ
        title="Common personalized music gift questions"
        description="A few honest details are enough to start, and you can refine the song before you give it."
        items={faqs}
        ctaTitle="Ready to make a music gift?"
        ctaDescription="Start with a free preview, shape the story, and turn it into a custom song, video, or lyric keepsake."
        ctaButtonLabel="Create Your Song"
        ctaHref={createMusicGiftSongHref}
      />
    </div>
  );
}
