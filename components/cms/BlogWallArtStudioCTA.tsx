"use client";

import LoginDialog from "@/components/auth/LoginDialog";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  WallArtEditorDrawer,
  type WallArtSongOption,
} from "@/components/song/WallArtEditorDrawer";
import { Disc3, Frame } from "lucide-react";
import { useState } from "react";

type BlogWallArtStudioCTAProps = {
  isAuthenticated: boolean;
  songOptions: WallArtSongOption[];
};

export function BlogWallArtStudioCTA({
  isAuthenticated,
  songOptions,
}: BlogWallArtStudioCTAProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const sharedButtonClassName =
    "min-w-[300px] justify-center border-0 px-8 text-base font-extrabold shadow-[0_18px_40px_rgba(121,72,39,0.14)] hover:border-0 sm:min-w-[420px] sm:px-10 sm:text-[1.05rem]";
  const primaryButtonClassName =
    `${sharedButtonClassName} bg-[#f46f4b] text-white hover:bg-[#eb6540] hover:text-white hover:shadow-[0_22px_46px_rgba(244,111,75,0.32)]`;
  const secondaryButtonClassName =
    `${sharedButtonClassName} bg-[linear-gradient(180deg,#fffdfa_0%,#fff7f0_100%)] text-[#5b3b2b] shadow-[0_16px_34px_rgba(121,72,39,0.12)] hover:bg-[linear-gradient(180deg,#fffaf6_0%,#fff2e8_100%)] hover:text-[#402619] hover:shadow-[0_20px_40px_rgba(121,72,39,0.18)]`;

  return (
    <>
      <section className="mt-16 overflow-hidden rounded-[28px] border border-[#ead9cd] bg-[linear-gradient(135deg,#fff8f2_0%,#f7eee6_48%,#f2e5da_100%)] shadow-[0_24px_60px_rgba(79,46,24,0.10)]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7c0af] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b5b44]">
              <Disc3 className="size-3.5" />
              Wall Art Studio
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-normal text-[#2c170d] sm:text-[2.35rem] sm:leading-[1.05]">
              Turn your lyrics into a printable gift in a few minutes
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f4c41] sm:text-[1.05rem]">
              Pick a lyric layout, switch presets, tune the title and message,
              and download a 300dpi PNG that is ready to print or frame. The
              studio is built for sentimental gifts, not fiddly design work.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-[#5b463b]">
              <span className="rounded-full bg-white/85 px-3 py-1.5">
                Spiral record templates
              </span>
              <span className="rounded-full bg-white/85 px-3 py-1.5">
                Heart lyric layouts
              </span>
              <span className="rounded-full bg-white/85 px-3 py-1.5">
                Picture with lyrics art
              </span>
              <span className="rounded-full bg-white/85 px-3 py-1.5">
                300dpi export
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <WallArtEditorDrawer
                  initialSong={songOptions[0]}
                  songOptions={songOptions}
                  trigger={
                    <MagneticButton
                      type="button"
                      size="lg"
                      magneticRange={120}
                      strength={0.24}
                      contentStrength={0.13}
                      trailingArrow
                      className={primaryButtonClassName}
                    >
                      Open Wall Art Studio
                    </MagneticButton>
                  }
                />
              ) : (
                <>
                  <MagneticButton
                    type="button"
                    size="lg"
                    magneticRange={120}
                    strength={0.24}
                    contentStrength={0.13}
                    trailingArrow
                    className={primaryButtonClassName}
                    onClick={() => setIsLoginDialogOpen(true)}
                  >
                    Open Wall Art Studio
                  </MagneticButton>
                  <LoginDialog
                    open={isLoginDialogOpen}
                    onOpenChange={setIsLoginDialogOpen}
                  />
                </>
              )}

              <MagneticButton
                href="/create-song"
                size="lg"
                magneticRange={120}
                strength={0.24}
                contentStrength={0.13}
                trailingArrow
                className={secondaryButtonClassName}
              >
                Create a custom song first
              </MagneticButton>
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,245,236,0.86))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="absolute right-5 top-5 rounded-full bg-[#2f1b12] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f3e2d4]">
              Gift Flow
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-2xl border border-[#ead9cd] bg-white/90 p-4">
                <p className="text-sm font-bold text-[#2f1b12]">
                  1. Start with your own lyrics
                </p>
                <p className="mt-1 text-sm leading-6 text-[#665347]">
                  Use original custom lyrics, vows, or personal text you have
                  the right to turn into artwork.
                </p>
              </div>
              <div className="rounded-2xl border border-[#ead9cd] bg-white/90 p-4">
                <p className="text-sm font-bold text-[#2f1b12]">
                  2. Style it like a keepsake
                </p>
                <p className="mt-1 text-sm leading-6 text-[#665347]">
                  Try record posters, lyric portraits, and image-driven
                  compositions until the layout feels display-ready.
                </p>
              </div>
              <div className="rounded-2xl border border-[#ead9cd] bg-white/90 p-4">
                <div className="flex items-center gap-2">
                  <Frame className="size-4 text-[#d86548]" />
                  <p className="text-sm font-bold text-[#2f1b12]">
                    3. Export and print
                  </p>
                </div>
                <p className="mt-1 text-sm leading-6 text-[#665347]">
                  Download the final file as a high-resolution PNG for a frame,
                  canvas, or digital delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
