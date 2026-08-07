import { Music2 } from "lucide-react";
import Image from "next/image";

export default function WifeHeroVisual() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_62%_24%,rgba(255,255,255,0.56),transparent_42%)] blur-2xl" />
      <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#32192b] shadow-[0_28px_80px_rgba(69,34,54,0.24)] ring-1 ring-white/80 lg:aspect-[1.42]">
        <Image
          alt="Couple sharing a custom song made for a wife"
          className="object-cover object-center"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          src="/images/blog/custom-song-for-wife/cover.webp"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.1),transparent_42%,rgba(46,12,34,0.22))]" />
      </div>

      <div className="absolute -bottom-5 left-5 right-5 md:left-auto md:w-[300px]">
        <div className="rounded-lg border border-white/70 bg-white/88 p-3.5 shadow-[0_22px_56px_rgba(65,34,50,0.2)] backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <Music2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-black text-[#261712]">
                Built around her story
              </p>
              <p className="mt-1 text-xs leading-5 text-[#6f625c]">
                Add the moments, details, and message she will recognize right
                away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
