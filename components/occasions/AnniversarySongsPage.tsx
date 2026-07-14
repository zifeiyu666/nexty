import FAQ from "@/components/home/FAQ";
import OurProducts from "@/components/home/OurProducts";
import Testimonials, {
  type TestimonialItem,
} from "@/components/home/Testimonials";
import AnniversaryHeroVisual from "@/components/occasions/AnniversaryHeroVisual";
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
  PartyPopper,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

const createAnniversarySongHref = "/create-song?occasion=anniversary";

type IconBlock = {
  title: string;
  description: string;
  icon: ReactNode;
};

const benefits: IconBlock[] = [
  {
    title: "Your story in the lyrics",
    description:
      "Turn names, first dates, favorite lines, private jokes, and promises into an anniversary song that sounds unmistakably yours.",
    icon: <MessageCircleHeart className="size-6" />,
  },
  {
    title: "Styles for every anniversary mood",
    description:
      "Create anniversary love songs in romantic ballad, acoustic, R&B, pop, jazz, or country anniversary songs that fit the night.",
    icon: <PartyPopper className="size-6" />,
  },
  {
    title: "Free preview in minutes",
    description:
      "Start with an anniversary song preview, then refine the lyrics, tone, and genre before unlocking the full track.",
    icon: <Clock3 className="size-6" />,
  },
  {
    title: "A keepsake beyond the dinner",
    description:
      "Turn the final anniversary song into a video gift or lyric wall art so the moment stays replayable long after the celebration.",
    icon: <Gift className="size-6" />,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Share the relationship story",
    description:
      "Add your names, milestone year, first meeting, favorite memory, and what you want this anniversary song to say.",
  },
  {
    kicker: "02",
    title: "Choose the feeling",
    description:
      "Go timeless, playful, cinematic, intimate, or country, then let the lyrics and arrangement follow that anniversary mood.",
  },
  {
    kicker: "03",
    title: "Preview and refine",
    description:
      "Listen to the sample, polish the message, and adjust style until the anniversary song feels like your relationship in music form.",
  },
  {
    kicker: "04",
    title: "Deliver the surprise",
    description:
      "Play it during dinner, a vow renewal, a slideshow, or send it privately as a marriage anniversary song made just for two people.",
  },
];

const useCases: IconBlock[] = [
  {
    title: "For couples celebrating quietly",
    description:
      "Create soft anniversary songs for couples who want something intimate for a dinner at home, a weekend away, or a candlelit night in.",
    icon: <Heart className="size-5" />,
  },
  {
    title: "For wedding anniversary moments",
    description:
      "Use it for wedding anniversary songs for couple celebrations, vow renewals, family dinners, and dances that deserve more than a generic playlist.",
    icon: <Music2 className="size-5" />,
  },
  {
    title: "For milestone marriage anniversaries",
    description:
      "A marriage anniversary song works especially well for 5th, 10th, 25th, or 50th anniversaries when shared history matters most.",
    icon: <Sparkles className="size-5" />,
  },
  {
    title: "For a happy anniversary surprise",
    description:
      "Make a happy anniversary song with your names and favorite memories, then reveal it at dinner, in a card, or inside a voice note.",
    icon: <PlayCircle className="size-5" />,
  },
  {
    title: "For country anniversary songs",
    description:
      "Lean into a porch-light, small-town, road-trip feeling with country anniversary songs that sound warm, grounded, and personal.",
    icon: <PartyPopper className="size-5" />,
  },
  {
    title: "For 'it's our anniversary' moments",
    description:
      "If you are chasing the feeling behind 'it's our anniversary song' searches, this gives you something more personal than any shared track ever could.",
    icon: <Clock3 className="size-5" />,
  },
];

const partnerSongIdeas: IconBlock[] = [
  {
    title: "Anniversary Songs for Boyfriends",
    description:
      "Make an anniversary song for your boyfriend feel like your relationship, not a generic love track. Include the first trip you took together, the joke only he understands, the way he supports you, and one small everyday detail you never want to forget.",
    icon: <Music2 className="size-5" />,
  },
  {
    title: "Anniversary Songs for Girlfriends",
    description:
      "Create an anniversary song for your girlfriend around the moments that make her feel seen. Add where you met, what you admire about her, a memory that still makes you smile, and the promise or future you want the chorus to hold.",
    icon: <Heart className="size-5" />,
  },
];

const exampleBriefs = [
  {
    label: "Boyfriend",
    title: "Anniversary song for a boyfriend",
    text: "Write a warm anniversary song for my boyfriend, Marcus. Mention our first road trip, the terrible motel coffee, how he always reaches for my hand in crowded places, and how two years with him made ordinary days feel like home.",
  },
  {
    label: "Girlfriend",
    title: "Anniversary song for a girlfriend",
    text: "Create a romantic anniversary song for my girlfriend, Sophie. Include our bookstore first date, Sunday pancakes, the way she makes every room lighter, and my promise to keep choosing new adventures with her.",
  },
  {
    label: "Romantic partner",
    title: "Private anniversary dinner",
    text: "Write a romantic anniversary song for Nora from Eli. Mention our rainy first date, our tiny first apartment, the yellow kitchen light, and how every year still feels like choosing each other again.",
  },
  {
    label: "Wedding anniversary",
    title: "10th anniversary dance",
    text: "Create a warm, elegant wedding anniversary song for Daniel and Priya. Include our vows, the old Polaroids, Sunday coffee, and the line 'ten years in and still home is you'.",
  },
  {
    label: "Country style",
    title: "Country anniversary song",
    text: "Make a country anniversary song for Jess and Cole. Mention backroad drives, the porch swing, our first truck, late summer air, and a steady kind of love that never had to be loud.",
  },
  {
    label: "Milestone marriage",
    title: "25th anniversary tribute",
    text: "Write a heartfelt marriage anniversary song for my parents, Karen and Luis. Mention the family table, the years they carried us, their patience, and twenty-five years of staying soft with each other.",
  },
];

const testimonials: TestimonialItem[] = [
  {
    quote:
      "We already had songs we loved, but this was the first one that sounded like our actual marriage. The chorus mentioned our diner, our dog, and our tenth year.",
    author: "Monica T.",
    badge: "10th anniversary",
    cardClassName: "bg-[#fff2ea] dark:bg-[#3a241d]",
  },
  {
    quote:
      "I wanted a happy anniversary song with our names that felt grown-up, not cheesy. The preview hit the tone right away.",
    author: "Ethan P.",
    badge: "Dinner surprise",
    cardClassName: "bg-[#f5f1ed] dark:bg-[#2d2421]",
  },
  {
    quote:
      "We used it as our vow renewal song. Everyone assumed it had been written for us years ago.",
    author: "Grace L.",
    badge: "Vow renewal",
    cardClassName: "bg-[#f7f5ef] dark:bg-[#2d2421]",
  },
];

const faqs = [
  {
    question: "What are the best anniversary songs for couples?",
    answer:
      "The best anniversary songs for couples match the relationship and the moment. Some people want a timeless love song, while others want a custom anniversary song built from their names, memories, and milestones.",
  },
  {
    question: "Can I make a happy anniversary song with our names?",
    answer:
      "Yes. Add both names, your relationship details, favorite memories, and the feeling you want. The anniversary song can naturally weave those details into the verses and chorus.",
  },
  {
    question: "What should I include in anniversary songs for boyfriends?",
    answer:
      "Anniversary songs for boyfriends work best with details that sound unmistakably like him: a shared adventure, a private joke, something he does that makes you feel supported, and the moment you knew the relationship mattered. Those specifics give the lyrics emotional weight without making them feel generic.",
  },
  {
    question: "What should I include in anniversary songs for girlfriends?",
    answer:
      "Anniversary songs for girlfriends can include where you met, the qualities you admire, a favorite everyday ritual, a meaningful milestone, and what you hope to share next. A strong chorus should express the central feeling clearly, while the verses carry the personal memories only the two of you recognize.",
  },
  {
    question: "What makes a good marriage anniversary song?",
    answer:
      "A strong marriage anniversary song feels specific. The best ones include shared history, emotional truth, replay value, and a message that still feels meaningful after the celebration is over.",
  },
  {
    question: "Can I create country anniversary songs?",
    answer:
      "Absolutely. You can ask for country anniversary songs with acoustic textures, storytelling lyrics, small-town imagery, and a warmer, grounded tone.",
  },
  {
    question:
      "Is this useful for wedding anniversary songs for couple celebrations?",
    answer:
      "Yes. It works especially well for wedding anniversary songs for couple dinners, family gatherings, anniversary dances, and vow renewals where a shared playlist feels too generic.",
  },
  {
    question: "Can I preview and edit the anniversary song?",
    answer:
      "Yes. Start with a preview, then adjust the lyrics, tone, and genre before finalizing the full anniversary song.",
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

type AnniversarySongsPageProps = {
  isAuthenticated: boolean;
  musicVideoSongOptions: FinalSongPlayerData[];
  wallArtSongOptions: WallArtSongOption[];
};

export default function AnniversarySongsPage({
  isAuthenticated,
  musicVideoSongOptions,
  wallArtSongOptions,
}: AnniversarySongsPageProps) {
  return (
    <div className="w-full overflow-hidden bg-[#fffaf7] text-[#2b1914]">
      <section className="relative isolate bg-[#fffaf7] px-6 pb-12 pt-10 sm:px-8 md:pb-14 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_16%,rgba(246,190,50,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(123,79,57,0.12),transparent_32%),linear-gradient(115deg,rgba(255,247,239,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,239,229,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-white/72" />

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/58 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(92,48,28,0.08),0_2px_10px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(214,189,176,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/42">
              <Stars />
              <span className="font-bold text-[#261712]">Excellent</span>
              <span className="text-[#d8c6bd]">/</span>
              <span>Anniversary song gifts</span>
            </div>

            <h1 className="mt-5 max-w-[12ch] text-balance font-sans text-[2.5rem] font-black leading-[0.98] tracking-normal text-[#250f0b] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.45rem]">
              Anniversary Songs for Couples
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6c5f59] sm:text-lg">
              Turn your names, favorite memories, and shared promises into an
              anniversary song that sounds personal from the first line. Whether
              it is for a boyfriend, girlfriend, or spouse, you can create a
              free preview, refine the lyrics, and make an anniversary gift that
              feels more lasting than a playlist.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href={createAnniversarySongHref}
                size="sm"
                trailingArrow
                className="border-[#e04132] bg-[#e04132] px-6 font-bold text-white shadow-[0_18px_38px_rgba(224,65,50,0.28)] hover:border-[#c93629] hover:bg-[#c93629] hover:text-white"
              >
                Create Your Anniversary Song
              </MagneticButton>
              <MagneticButton
                href="#anniversary-examples"
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

          <AnniversaryHeroVisual />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why it works"
            title="More meaningful than another anniversary playlist"
            description="The best anniversary songs feel specific. A custom song turns your shared details into something you can replay, gift, and keep."
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
        eyebrow="How it works"
        title="From relationship memories to an anniversary song"
        description="You bring the story. The song maker shapes it into lyrics, music, vocals, and a keepsake that feels built around your relationship."
        steps={steps}
      />

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Anniversary moments"
            title="A song for every kind of anniversary celebration"
            description="Use the same flow for intimate dinners, milestone marriage anniversaries, vow renewals, and personalized surprise reveals."
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

      <section className="bg-[#fff4ef] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Made for your person"
            title="Anniversary Songs for Boyfriends and Girlfriends"
            description="The relationship label may change, but the strongest anniversary song always starts with details that could only belong to the two of you. Shape those memories into a personal gift for him or for her."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {partnerSongIdeas.map((idea) => (
              <article
                key={idea.title}
                className="rounded-lg border border-[#eed8ce] bg-white p-7 shadow-[0_16px_42px_rgba(76,38,24,0.06)] sm:p-8"
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
                <I18nLink
                  href={createAnniversarySongHref}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-[#b83b30] transition-colors hover:text-[#8f2b23]"
                >
                  Create a personal anniversary song
                  <ArrowRight className="size-4" />
                </I18nLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="anniversary-examples"
        className="bg-[#25130e] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">
                Example briefs
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Start with the details that still feel like yours
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
                You do not need polished lyrics. A memory, a milestone, and the
                feeling you want are enough to create an anniversary song that
                sounds specific.
              </p>
              <Button
                asChild
                className="mt-7 h-12 rounded-full bg-[#f6be32] px-7 text-base font-black text-[#25130e] hover:bg-[#ffd363]"
              >
                <I18nLink href={createAnniversarySongHref}>
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
        title="Anniversary songs that stay with people"
        description="When the song reflects the real relationship, it lands differently from any off-the-shelf love song."
        items={testimonials}
        contentWidthClassName="max-w-6xl"
      />

      <FAQ
        title="Common anniversary song questions"
        description="You only need a few honest details to start, and you can refine the song before the final reveal."
        items={faqs}
        ctaTitle="Ready for your anniversary?"
        ctaDescription="Add the names, the milestone, and the memory that still means everything. Start with a free preview today."
        ctaButtonLabel="Create Your Song"
        ctaHref={createAnniversarySongHref}
      />
    </div>
  );
}
