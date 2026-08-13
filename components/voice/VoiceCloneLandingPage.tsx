import FAQ from "@/components/home/FAQ";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link as I18nLink } from "@/i18n/routing";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  HeartHandshake,
  Mic2,
  Music2,
  Sparkles,
  Upload,
} from "lucide-react";
import { VoiceCloneHeroVisual } from "./VoiceCloneHeroVisual";

const benefits = [
  {
    title: "More moving",
    description:
      "A familiar voice can bring a shared memory back in an instant. It makes the lyrics land somewhere deeper than a song from a stranger ever could.",
    icon: Heart,
  },
  {
    title: "More surprising",
    description:
      "They expect a thoughtful song. They do not expect to hear your voice carrying every word, melody, and little detail you chose for them.",
    icon: Sparkles,
  },
  {
    title: "More personal",
    description:
      "Your authorized singing voice, their name, your story, and the right style come together in one gift no template can reproduce.",
    icon: HeartHandshake,
  },
  {
    title: "Made to replay",
    description:
      "For anniversaries, birthdays, faraway days, and family milestones, the song becomes a keepsake they can return to whenever they need it.",
    icon: Music2,
  },
];

const steps = [
  {
    number: "01",
    title: "Share an authorized voice",
    description:
      "Upload a clear recording of your own voice, or one you have explicit permission to use. We only create singing voices with consent.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Read your unique phrase",
    description:
      "We provide a short verification phrase to read aloud. This protects the person behind the voice and confirms the authorization is real.",
    icon: BadgeCheck,
  },
  {
    number: "03",
    title: "Make a song only you could give",
    description:
      "Choose your singing voice when you create a song, then add their name, your memories, and the feeling you want them to hear.",
    icon: Mic2,
  },
];

const moments = [
  {
    title: "An anniversary they will feel",
    description:
      "Put the story of how you met into a song, then let the voice they know best carry the chorus back to them.",
    accent: "bg-[#fff0f4] text-[#bf3f5d]",
  },
  {
    title: "A family memory in song",
    description:
      "Give a parent, child, or loved one a song that holds the small moments your family will always recognize.",
    accent: "bg-[#fff1d5] text-[#a66b10]",
  },
  {
    title: "A voice across the distance",
    description:
      "When you cannot be in the room, a song in your familiar voice can still make someone feel close, seen, and loved.",
    accent: "bg-[#e7f3f0] text-[#277f76]",
  },
];

const faqs = [
  {
    question: "What is an AI singing voice generator?",
    answer:
      "An AI singing voice generator creates an authorized singing voice that can be selected when making an original song. At SendTheSong, it is designed for songs and personal gifts, not text-to-speech or celebrity imitation.",
  },
  {
    question: "Why do I need to read a verification phrase?",
    answer:
      "The unique phrase helps confirm that the person creating the singing voice owns it or has clear permission to use it. It is an important safeguard against unauthorized voice use.",
  },
  {
    question: "Can I create a singing voice for someone else?",
    answer:
      "Only when you have their explicit permission and they complete the verification recording. You cannot use this tool to imitate a person without their consent.",
  },
  {
    question: "Can I use my singing voice in every song I create?",
    answer:
      "Yes. Once your voice is verified and ready, select it during song creation to use it in your original custom songs.",
  },
  {
    question: "Is there a free AI singing voice generator option?",
    answer:
      "Free accounts can create one verified custom singing voice. Subscribers can create and manage unlimited custom voices.",
  },
];

type VoiceCloneLandingPageProps = {
  createHref: string;
};

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
      <h2 className="mt-3 text-balance text-3xl font-black leading-tight text-[#261712] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f625c] md:text-lg">
        {description}
      </p>
    </div>
  );
}

export function VoiceCloneLandingPage({ createHref }: VoiceCloneLandingPageProps) {
  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }).replaceAll("<", "\\u003c");

  return (
    <div className="w-full overflow-hidden bg-[#fffaf7] text-[#2b1914]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      <section className="relative isolate px-6 pb-14 pt-10 sm:px-8 md:pb-16 md:pt-14 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_16%,rgba(246,190,50,0.2),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(37,150,142,0.11),transparent_34%),linear-gradient(115deg,rgba(255,247,239,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,239,229,0.72)_100%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1fr] lg:gap-11">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/62 px-4 py-2 text-sm text-[#695851] shadow-[0_18px_40px_rgba(92,48,28,0.08)] backdrop-blur-xl">
              <HeartHandshake className="size-4 text-[#bf3f5d]" />
              <span className="font-bold text-[#261712]">A more personal way to give a song</span>
            </div>
            <h1 className="mt-5 max-w-[11ch] text-balance text-[2.55rem] font-black leading-[0.98] text-[#250f0b] min-[420px]:text-[2.9rem] sm:text-[3.7rem] lg:text-[4.45rem]">
              A Song in Your Voice. A Gift They&apos;ll Never Forget.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6c5f59] sm:text-lg">
              Create a verified AI singing voice from a recording you own or are authorized to use. Then turn your memories into an original song for a birthday, anniversary, faraway day, or simply because someone deserves to hear how much they mean to you.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <MagneticButton href={createHref} size="sm" trailingArrow className="border-[#e04132] bg-[#e04132] px-6 font-bold text-white shadow-[0_18px_38px_rgba(224,65,50,0.28)] hover:border-[#c93629] hover:bg-[#c93629] hover:text-white">
                Create Your Singing Voice
              </MagneticButton>
              <MagneticButton href="#how-it-works" prefetch={false} variant="light" size="sm" className="border-[#d7b9aa] bg-white px-6 font-bold text-[#923328] shadow-[0_14px_30px_rgba(88,45,28,0.1)] hover:border-[#caa995] hover:bg-[#fff2eb] hover:text-[#73251e]">
                See how it works
              </MagneticButton>
            </div>
          </div>
          <VoiceCloneHeroVisual />
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="Why it feels different" title="Some gifts say you remembered. This one sounds like you." description="A custom song becomes something more intimate when it carries a voice that already belongs to the story." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return <article key={benefit.title} className="rounded-lg border border-[#f0e3dc] bg-[#fffaf7] p-6 shadow-[0_14px_38px_rgba(59,31,18,0.05)]"><div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[#ffe0e7] text-[#bf3f5d]"><Icon className="size-6" /></div><h3 className="text-xl font-black leading-tight text-[#261712]">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-[#74665f]">{benefit.description}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#fff1eb] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="How it works" title="From your voice to their favorite song" description="The process is simple, thoughtful, and built around permission from the beginning." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => { const Icon = step.icon; return <article key={step.number} className="relative rounded-lg border border-[#efd9ce] bg-white p-7 shadow-[0_18px_48px_rgba(78,40,21,0.07)]"><span className="text-sm font-black text-[#c33f32]">{step.number}</span><div className="mt-5 flex size-12 items-center justify-center rounded-lg bg-[#fff0e9] text-[#c33f32]"><Icon className="size-6" /></div><h3 className="mt-5 text-xl font-black text-[#261712]">{step.title}</h3><p className="mt-3 text-sm leading-6 text-[#74665f]">{step.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="Made for your people" title="For the moments that deserve more than a message" description="Give a song that sounds personal before the first lyric even begins." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {moments.map((moment) => <article key={moment.title} className="rounded-lg border border-[#f0e3dc] bg-[#fffaf7] p-7 shadow-[0_14px_38px_rgba(59,31,18,0.05)]"><div className={`flex size-12 items-center justify-center rounded-lg ${moment.accent}`}><HeartHandshake className="size-6" /></div><h3 className="mt-5 text-xl font-black leading-tight text-[#261712]">{moment.title}</h3><p className="mt-3 text-sm leading-6 text-[#74665f]">{moment.description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#fff6f1] px-6 py-16 sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-5xl gap-7 rounded-2xl border border-[#efd8cc] bg-white p-7 shadow-[0_18px_48px_rgba(78,40,21,0.08)] md:grid-cols-[auto_1fr] md:p-10">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[#ffe0e7] text-[#bf3f5d]"><BadgeCheck className="size-7" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c33f32]">Your voice, your permission</p><h2 className="mt-3 text-3xl font-black leading-tight text-[#261712]">The most meaningful surprise starts with consent.</h2><p className="mt-4 max-w-3xl text-base leading-7 text-[#6f625c]">We only create an authorized singing voice for you or someone who has explicitly agreed to it. The unique verification phrase is not a formality: it helps protect real people from unauthorized voice use, so the song can feel good to give and good to receive.</p></div>
        </div>
      </section>

      <section className="bg-[#2b1914] px-6 py-16 text-white sm:px-8 md:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f6be32]">Make it unforgettable</p><h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl md:text-5xl">Give them a song that feels like you were there.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">Create an authorized singing voice, turn the moments you share into music, and give a surprise they will want to play again.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><MagneticButton href={createHref} trailingArrow size="sm" className="border-[#e04132] bg-[#e04132] px-6 font-bold text-white hover:border-[#c93629] hover:bg-[#c93629] hover:text-white">Create Your Singing Voice</MagneticButton><I18nLink href="/create-song" className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white/85 transition hover:text-white">Create a song <ArrowRight className="size-4" /></I18nLink></div></div>
      </section>

      <FAQ title="Questions about creating your singing voice" description="Everything you need to know before making a song in a familiar voice." items={faqs} />
    </div>
  );
}
