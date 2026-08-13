import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/metadata";
import { Chrome, Heart, Music2, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "SendTheSong Browser Extension",
    description:
      "Capture a meaningful memory in your browser, then turn it into a personalized AI song with SendTheSong.",
    locale: "en",
    path: "/extension",
    availableLocales: ["en"],
  });
}

const steps = [
  ["Capture the moment", "Choose the occasion, recipient, memory, and music style."],
  ["Continue securely", "Open SendTheSong to sign in and review your private draft."],
  ["Create the gift", "Generate, preview, and deliver a song through the full SendTheSong experience."],
];

export default function ExtensionPage() {
  return (
    <main className="w-full bg-[#fbfaf7] text-stone-950">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm">
            <Chrome className="size-4 text-primary" /> Browser extension
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Turn a browser moment into a song they will keep.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            The SendTheSong extension is a quick, private place to save the memory behind a meaningful gift. Finish creating your personalized song on SendTheSong whenever you are ready.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/create-song">Create a song on SendTheSong</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/samples">Listen to sample songs</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-stone-500">
            Chrome, Opera, and Firefox listings are submitted separately. Store links will appear here after approval.
          </p>
        </div>

        <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-2xl sm:p-8">
          <Sparkles className="size-8 text-amber-300" />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">A lightweight starting point</p>
          <div className="mt-5 space-y-5">
            {steps.map(([title, description], index) => (
              <div className="flex gap-4" key={title}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">{index + 1}</span>
                <div>
                  <h2 className="font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
          <InfoCard icon={<Heart />} title="Made for meaningful gifts" text="Start while an anniversary, birthday, wedding, or everyday memory is fresh." />
          <InfoCard icon={<ShieldCheck />} title="Private by design" text="Your story is sent only when you choose to continue and temporary drafts expire after 24 hours." />
          <InfoCard icon={<Music2 />} title="The complete experience" text="Lyrics, song generation, previews, payment, and delivery stay on SendTheSong." />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="mb-4 text-primary">{icon}</div>
      <h2 className="font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}
