import FAQ from "@/components/home/FAQ";
import StructuredSongBrief from "@/components/home/StructuredSongBrief";
import { messageSongBriefTemplates } from "@/components/home/song-brief-templates";
import Testimonials from "@/components/home/Testimonials";
import HowItWorksSection from "@/components/shared/HowItWorksSection";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  ArrowRight,
  CakeSlice,
  Check,
  CirclePlay,
  Gift,
  Heart,
  MessageCircleHeart,
  Mic2,
  Music2,
  Palette,
  PencilLine,
  Quote,
  Send,
  Sparkles,
  Stars,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const pagePath = "/gifts/song-message";

const occasions = [
  {
    title: "Birthday wishes",
    description:
      "Turn the message you would write in a birthday card into a chorus built around their name, personality, and favorite memories.",
    icon: CakeSlice,
  },
  {
    title: "Anniversary memories",
    description:
      "Shape the milestones, private jokes, and ordinary moments of a relationship into a personalized song message.",
    icon: Heart,
  },
  {
    title: "Thank-you messages",
    description:
      "Say what their support meant to you with more detail and staying power than a quick text or generic gift.",
    icon: MessageCircleHeart,
  },
  {
    title: "Apologies and reconnection",
    description:
      "Start with honest words, shared context, and the tone you want to set. Keep the message sincere instead of overly dramatic.",
    icon: PencilLine,
  },
  {
    title: "Long-distance love",
    description:
      "Bring voice notes, time-zone rituals, airport memories, and the promise of seeing each other again into one replayable gift.",
    icon: Send,
  },
  {
    title: "Memorial messages",
    description:
      "Honor a person through specific memories, familiar phrases, and the details that made their presence unmistakable.",
    icon: Stars,
  },
];

const steps = [
  {
    kicker: "01",
    title: "Write the message",
    description:
      "Start with the words you want them to hear. A few honest sentences are enough; you do not need to write lyrics.",
  },
  {
    kicker: "02",
    title: "Add the story behind it",
    description:
      "Include a name, relationship, occasion, memory, or phrase that only the recipient would recognize.",
  },
  {
    kicker: "03",
    title: "Preview and refine",
    description:
      "Listen to a free preview, edit the lyrics, and adjust the music direction until the feeling matches your message.",
  },
  {
    kicker: "04",
    title: "Share the finished gift",
    description:
      "Send the song privately, add a spoken opening, or pair it with a music video or printable lyric keepsake.",
  },
];

const comparisonRows = [
  {
    format: "Personalized song message",
    personal: "Names, stories, tone, and a message written for one person",
    experience: "A complete listening moment with lyrics and music",
    keepsake: "Replayable song, share page, video, or lyric art",
    highlighted: true,
  },
  {
    format: "Greeting card",
    personal: "Personal when handwritten, but limited by space",
    experience: "Read once during the gift reveal",
    keepsake: "Physical card",
  },
  {
    format: "Voice message",
    personal: "Carries your real voice and natural emotion",
    experience: "Intimate, but often buried in a message thread",
    keepsake: "Audio file or chat attachment",
  },
  {
    format: "Regular song link",
    personal: "Meaning depends on the context you add",
    experience: "Fast and familiar",
    keepsake: "Streaming link",
  },
];

const features = [
  {
    title: "Editable lyrics",
    description:
      "Keep the lines that feel true, rewrite anything that misses the mark, and make the final message sound like you.",
    icon: PencilLine,
  },
  {
    title: "Music direction",
    description:
      "Choose a genre, vocal direction, and emotional energy that fit the recipient and the reason behind the song.",
    icon: Music2,
  },
  {
    title: "Spoken opening",
    description:
      "Record your own greeting or write a short opening message that leads naturally into the first verse.",
    icon: Mic2,
  },
  {
    title: "Gift-ready formats",
    description:
      "Share the track, build a photo music video, or turn a favorite lyric into printable wall art.",
    icon: Palette,
  },
];

const exampleMessages = [
  {
    label: "Thank you",
    message:
      "You never tried to fix everything. You just stayed, listened, and made the difficult days feel possible.",
    detail:
      "Add where you met, one moment they showed up for you, and the phrase you always use to thank each other.",
  },
  {
    label: "Anniversary",
    message:
      "I still choose the life we are building—the loud mornings, the quiet drives, and every ordinary day in between.",
    detail:
      "Add the year you met, a shared ritual, and one small detail that represents home to both of you.",
  },
  {
    label: "Long distance",
    message:
      "Until the next arrival gate, keep this song close and remember that every mile still leads me back to you.",
    detail:
      "Add your time zones, the call you never miss, a trip you remember, and what you want the reunion to feel like.",
  },
];

export const songMessageFaqs = [
  {
    question: "How do I turn a message into a song?",
    answer:
      "Write the message you want to share, add the recipient's name and one or two specific memories, then choose the occasion and music direction. SendTheSong turns those details into lyrics and a song preview you can review before unlocking the finished track.",
  },
  {
    question: "Do I need to write lyrics first?",
    answer:
      "No. Write naturally, as if you were composing a card or voice note. The song maker structures your message into lyrics, and you can edit the result before finalizing it.",
  },
  {
    question: "Can I use a voice message as the starting point?",
    answer:
      "You can use the ideas or transcript from a voice message as your story, then add a recorded or written spoken opening to the song. Only upload or record voices you own or are authorized to use.",
  },
  {
    question: "Can I change the lyrics after the preview?",
    answer:
      "Yes. You can revise lines, clarify details, and adjust the genre or tone before choosing the final version. The goal is to keep the song personal without losing the meaning of your original message.",
  },
  {
    question: "What should I include in a personalized song message?",
    answer:
      "Include who the song is for, why you are sending it, one vivid memory, a phrase they recognize, and the feeling you want the final chorus to leave. Specific details usually matter more than writing a long message.",
  },
  {
    question: "How can I share the finished song?",
    answer:
      "You can share the finished song through its private listening page or use the final audio in a gift reveal. You can also pair it with a photo music video or printable lyric wall art.",
  },
  {
    question: "Can I preview the song before paying?",
    answer:
      "Yes. Start with a free preview, listen to how the message and music work together, and refine the result before deciding whether to unlock the full song.",
  },
];

function SectionHeading({
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
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b64c39]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight text-[#351d17] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#745f57] md:text-lg">
        {description}
      </p>
    </div>
  );
}

function IconCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-[1.4rem] border border-[#ead7cd] bg-[#fffdf9] p-6 shadow-[0_18px_50px_rgba(80,48,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(80,48,36,0.11)]">
      <div className="flex size-11 items-center justify-center rounded-full bg-[#f4ddd2] text-[#a84534] transition group-hover:rotate-[-4deg] group-hover:bg-[#a84534] group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-5 font-serif text-2xl font-bold text-[#351d17]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#735f57]">{description}</p>
    </article>
  );
}

export default function SongMessageLandingPage() {
  return (
    <div className="w-full overflow-hidden bg-[#fffaf4] text-[#351d17]">
      <section className="relative isolate px-5 pb-18 pt-14 sm:px-8 md:pb-24 md:pt-20 lg:px-12">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_12%,rgba(238,187,166,0.34),transparent_31%),radial-gradient(circle_at_87%_20%,rgba(246,220,174,0.36),transparent_30%),linear-gradient(180deg,#fffaf4_0%,#fffdf9_70%,#f8eee7_100%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(91,59,46,.16)_1px,transparent_1px)] [background-size:100%_32px]"
        />

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e3c8bc] bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-[#9e4334] shadow-sm backdrop-blur">
              <MessageCircleHeart className="size-4" />
              A message they can hear and keep
            </div>
            <h1 className="mt-6 text-balance font-sans text-[2.55rem] font-black leading-[1.02] tracking-[-0.045em] text-[#321912] sm:text-5xl md:text-6xl lg:text-7xl">
              Turn Your Message Into a Personalized Song
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-[#6f5a52] sm:text-lg sm:leading-8">
              Start with the words you wish you could say perfectly. Add a name,
              a memory, or a voice-note idea, then preview a custom song message
              you can edit and share as a lasting gift.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-[62rem] sm:mt-20">
            <div aria-hidden="true" className="song-message-note absolute -top-12 left-4 z-20 sm:-top-14 sm:left-10">
              written from the heart
            </div>
            <StructuredSongBrief
              variant="letter"
              templates={messageSongBriefTemplates}
              introText="Edit any highlighted detail, or shuffle for another example."
              leadText="Turn this message into a song for"
              messageLeadText="The words I want them to hear are"
              storyLeadText="The memory behind it is"
              submitLabel="Create my free preview"
              advancedLabel="Build it step by step"
            />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#755c52] sm:text-sm">
            {["Free preview first", "Edit lyrics and style", "No songwriting experience needed"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#e5c4b6] text-[#8d3528]">
                    <Check className="size-3" />
                  </span>
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#351d17] px-6 py-14 text-[#fff9f1] sm:px-8 md:py-18 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <Image
                src="/images/blog/voice-message-gift-ideas/cover.webp"
                alt="A personal voice message being shaped into a custom song gift"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,rgba(39,18,13,0.72))]" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e05540] text-white">
                  <CirclePlay className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">From words to a listening moment</p>
                  <p className="mt-1 text-xs leading-5 text-white/66">
                    Message, memory, lyrics, music, and a gift-ready reveal.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ef9a83]">
              What it is
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              A personal message, carried by music
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              A personalized song message turns the meaning of a card, letter,
              or voice note into original lyrics and music. The strongest songs
              are not built from perfect prose. They come from a clear feeling
              and a few details the recipient instantly recognizes.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["One honest message", "One vivid shared memory", "A name or familiar phrase", "A clear emotional direction"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/82">
                    <Sparkles className="size-4 text-[#ef9a83]" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-18 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Messages for real moments"
            title="When a normal message does not feel like enough"
            description="Use a custom song message when the meaning matters more than the object—and when you want the recipient to hear the story, not just read it."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((item) => {
              const Icon = item.icon;
              return (
                <IconCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={<Icon className="size-5" />}
                />
              );
            })}
          </div>
        </div>
      </section>

      <HowItWorksSection
        eyebrow="How it works"
        title="From one message to a song in four steps"
        description="Keep the writing natural. The creation flow helps turn your raw message into lyrics, music, and a gift-ready result."
        steps={steps}
        sectionClassName="bg-[#f4e5dc]"
        titleClassName="mt-3 text-balance font-serif text-3xl font-bold leading-tight text-[#351d17] sm:text-4xl md:text-5xl"
        cardClassName="rounded-[1.35rem] border-[#e4cabe] bg-[#fffaf4] shadow-[0_16px_44px_rgba(79,45,33,0.07)]"
        kickerClassName="bg-[#a84534]"
        mobileCarousel
      />

      <section className="bg-[#fffdf9] px-6 py-18 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Choose the right format"
            title="Song message vs. card, voice note, or song link"
            description="Each format can be meaningful. The difference is how much personal context it carries and whether the recipient can return to the moment later."
          />
          <div className="mt-12 overflow-hidden rounded-[1.4rem] border border-[#e5cfc4] bg-white shadow-[0_22px_70px_rgba(78,45,33,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#351d17] text-white">
                  <tr>
                    <th className="px-5 py-4 font-bold">Format</th>
                    <th className="px-5 py-4 font-bold">Personal detail</th>
                    <th className="px-5 py-4 font-bold">Experience</th>
                    <th className="px-5 py-4 font-bold">What remains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecdcd4]">
                  {comparisonRows.map((row) => (
                    <tr key={row.format} className={row.highlighted ? "bg-[#fff2ea]" : "bg-white"}>
                      <th className="px-5 py-5 font-bold text-[#3b211a]">{row.format}</th>
                      <td className="px-5 py-5 leading-6 text-[#735f57]">{row.personal}</td>
                      <td className="px-5 py-5 leading-6 text-[#735f57]">{row.experience}</td>
                      <td className="px-5 py-5 leading-6 text-[#735f57]">{row.keepsake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#351d17] px-6 py-18 text-white sm:px-8 md:py-24 lg:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#e88a70_0,transparent_28%),radial-gradient(circle_at_80%_70%,#e9bd74_0,transparent_25%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ef9a83]">Message examples</p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Start with words that sound like you
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              Use these as structural examples, then replace every generic detail with something true to your relationship.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {exampleMessages.map((example, index) => (
              <article key={example.label} className="relative rounded-[1.4rem] border border-white/10 bg-white/[0.065] p-6 backdrop-blur-sm">
                <Quote className="absolute right-5 top-5 size-8 text-white/10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef9a83]">{example.label}</p>
                <blockquote className="mt-5 font-serif text-xl italic leading-8 text-white/90">“{example.message}”</blockquote>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Make it yours</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{example.detail}</p>
                </div>
                <span className="absolute -bottom-2 left-6 h-4 w-14 rotate-[-2deg] bg-[#e8c598]/70" aria-hidden="true" />
                <span className="sr-only">Example {index + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-18 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Make the delivery personal"
            title="More than a generated audio file"
            description="Refine the words, shape the sound, and choose how the message arrives so the finished gift feels intentional from the first second."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return <IconCard key={feature.title} title={feature.title} description={feature.description} icon={<Icon className="size-5" />} />;
            })}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <I18nLink href="/create-song">Create a song preview <ArrowRight className="size-4" /></I18nLink>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#d8bdb0] bg-white px-6 text-[#5b342b]">
              <I18nLink href="/samples">Listen to song samples</I18nLink>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#d8bdb0] bg-white px-6 text-[#5b342b]">
              <I18nLink href="/pricing">See pricing</I18nLink>
            </Button>
            <Button asChild variant="ghost" className="rounded-full px-6 text-[#7e3b2f]">
              <I18nLink href="/music/personalized-gift">Explore personalized music gifts</I18nLink>
            </Button>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="bg-[#f4e5dc] px-6 py-18 sm:px-8 md:py-22 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Continue exploring"
            title="Helpful guides for planning the message and reveal"
            description="Decide what to say, how to share it, and which gift format best fits the moment."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: "Voice message gift ideas", description: "Turn a greeting, recording, or spoken opening into a gift that feels personal.", href: "/blog/voice-message-gift-ideas" },
              { title: "How to send a song to someone", description: "Compare text links, audio files, share pages, and gift-style song delivery.", href: "/blog/how-to-send-a-song-to-someone" },
              { title: "Personalized music gifts", description: "Explore custom songs, music videos, lyric keepsakes, and occasion ideas.", href: "/music/personalized-gift" },
            ].map((article) => (
              <article key={article.href} className="rounded-[1.25rem] border border-[#dfc6ba] bg-[#fffaf4] p-6">
                <Gift className="size-5 text-[#a84534]" />
                <h3 className="mt-5 font-serif text-2xl font-bold text-[#351d17]">{article.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#735f57]">{article.description}</p>
                <I18nLink href={article.href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#9e3f30] hover:text-[#6f2a21]">
                  Read the guide <ArrowRight className="size-4" />
                </I18nLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FAQ
        title="Personalized song message FAQ"
        description="Practical answers about turning your words, memories, and voice-note ideas into a custom song gift."
        items={songMessageFaqs}
        ctaTitle="Your message already has a melody"
        ctaDescription="Start with a few true details, preview the song for free, and refine it before you share it."
        ctaButtonLabel="Turn my message into a song"
        ctaHref="/create-song"
      />

      <section className="relative isolate overflow-hidden bg-[#351d17] px-6 py-18 text-center text-white sm:px-8 md:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(233,130,101,0.32),transparent_42%)]" />
        <Sparkles className="mx-auto size-7 text-[#ef9a83]" />
        <h2 className="mx-auto mt-5 max-w-3xl text-balance font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Give the message somewhere beautiful to live
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/66">
          Turn the words you mean into a personalized song they can hear,
          replay, and keep.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full bg-[#e05540] px-7 text-white hover:bg-[#c84433]">
          <I18nLink href="/create-song">Start a free preview <ArrowRight className="size-4" /></I18nLink>
        </Button>
      </section>

      <span className="sr-only">Canonical page: {pagePath}</span>
    </div>
  );
}
