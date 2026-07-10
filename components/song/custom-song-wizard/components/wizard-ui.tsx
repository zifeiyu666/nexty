"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Gift,
  ImageIcon,
  Loader2,
  LockKeyhole,
  Mail,
  Music2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import Image from "next/image";
import type { PointerEvent, ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type {
  EditableLyricLine,
  LyricsLineRewriteSuggestion,
} from "@/lib/ai/song-lyrics";
import { cn } from "@/lib/utils";

import {
  lyricGenerationSteps,
  relationshipOptions,
  stepVariants,
  steps,
  storyHelperSteps,
} from "../constants";
import type { LanguageOption, WizardStep } from "../types";

export function clampMagnetOffset(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

export function MagneticChoiceCard({
  art,
  artPlacement = "corner",
  badge,
  hint,
  icon,
  label,
  muted = false,
  onClick,
  recommended = false,
  selected,
  showIcon = true,
  showSelectedCheck = true,
}: {
  art?: {
    src: string;
    alt: string;
    className?: string;
  };
  artPlacement?: "corner" | "center";
  badge?: string;
  hint?: string;
  icon: ReactNode;
  label: string;
  muted?: boolean;
  onClick: () => void;
  recommended?: boolean;
  selected: boolean;
  showIcon?: boolean;
  showSelectedCheck?: boolean;
}) {
  const hasCenteredArt = Boolean(art && artPlacement === "center");
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const contentX = useMotionValue(0);
  const contentY = useMotionValue(0);
  const artX = useMotionValue(0);
  const artY = useMotionValue(0);
  const artScale = useMotionValue(1);
  const artRotate = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 260 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 260 });
  const springContentX = useSpring(contentX, { damping: 22, stiffness: 300 });
  const springContentY = useSpring(contentY, { damping: 22, stiffness: 300 });
  const springArtX = useSpring(artX, { damping: 18, stiffness: 240 });
  const springArtY = useSpring(artY, { damping: 18, stiffness: 240 });
  const springArtScale = useSpring(artScale, { damping: 18, stiffness: 260 });
  const springArtRotate = useSpring(artRotate, {
    damping: 18,
    stiffness: 260,
  });

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    const normalizedX = offsetX / (rect.width / 2);
    const normalizedY = offsetY / (rect.height / 2);

    rotateX.set(clampMagnetOffset(normalizedY * -8, 8));
    rotateY.set(clampMagnetOffset(normalizedX * 8, 8));
    contentX.set(
      hasCenteredArt ? 0 : clampMagnetOffset(normalizedX * 5, 5),
    );
    contentY.set(
      hasCenteredArt ? 0 : clampMagnetOffset(normalizedY * 4, 4),
    );
    artX.set(
      hasCenteredArt
        ? clampMagnetOffset(normalizedX * 8, 8)
        : clampMagnetOffset(normalizedX * 16, 16),
    );
    artY.set(
      hasCenteredArt
        ? clampMagnetOffset(normalizedY * 6 - 18, 24)
        : clampMagnetOffset(normalizedY * 14 - 12, 18),
    );
    artScale.set(hasCenteredArt ? 1.18 : 1.26);
    artRotate.set(clampMagnetOffset(normalizedX * (hasCenteredArt ? 3 : 5), 5));
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
    contentX.set(0);
    contentY.set(0);
    artX.set(0);
    artY.set(0);
    artScale.set(1);
    artRotate.set(0);
  }

  return (
    <motion.button
      className={cn(
        "group relative flex cursor-pointer flex-col rounded-2xl bg-card p-3.5 shadow-sm outline-none transition-[background-color,border-color,box-shadow,color,filter,opacity] duration-300 will-change-transform focus-visible:ring-2 focus-visible:ring-primary/30",
        hasCenteredArt
          ? "isolate min-h-40 items-center justify-end overflow-visible text-center hover:z-10 hover:bg-card hover:shadow-xl hover:shadow-primary/15"
          : "min-h-28 items-center justify-center overflow-hidden text-center hover:shadow-lg",
        recommended && "ring-1 ring-primary/15",
        muted && "opacity-55 grayscale hover:opacity-90 hover:grayscale-0",
        selected &&
          (hasCenteredArt
            ? "bg-primary/10 shadow-lg shadow-primary/15 ring-1 ring-primary/20"
            : "bg-primary/10 shadow-md shadow-primary/10"),
      )}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 760,
        transformStyle: "preserve-3d",
      }}
      type="button"
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {hasCenteredArt ? (
        <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-card">
          <span
            className={cn(
              "absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,48,0.16),transparent_46%),linear-gradient(180deg,rgba(255,244,239,0.92),rgba(255,255,255,0.96)_58%,rgba(255,250,246,0.9))] opacity-100 transition-opacity duration-300",
              selected &&
                "bg-[radial-gradient(circle_at_50%_18%,rgba(239,68,48,0.26),transparent_50%),linear-gradient(180deg,rgba(255,234,226,0.98),rgba(255,255,255,0.97)_58%,rgba(255,247,242,0.94))]",
            )}
          />
          <span className="absolute -inset-8 rounded-[inherit] bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/75 via-card/70 to-transparent" />
        </span>
      ) : (
        <span className="pointer-events-none absolute -inset-8 rounded-[inherit] bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {art && (
        <motion.span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute aspect-square drop-shadow-[0_14px_18px_rgba(90,44,28,0.14)] transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:drop-shadow-[0_26px_32px_rgba(90,44,28,0.24)]",
            hasCenteredArt
              ? "left-0 right-0 top-2 mx-auto w-28 opacity-85 sm:w-32"
              : "opacity-45",
            selected &&
              hasCenteredArt &&
              "opacity-100 drop-shadow-[0_24px_30px_rgba(90,44,28,0.28)]",
            art.className,
          )}
          style={{
            rotate: springArtRotate,
            scale: hasCenteredArt && selected ? 1.14 : springArtScale,
            x: springArtX,
            y: springArtY,
            z: 54,
          }}
        >
          <Image
            alt={art.alt}
            className="size-full object-contain"
            draggable={false}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 144px, (min-width: 640px) 128px, 112px"
            src={art.src}
          />
        </motion.span>
      )}
      {selected && showSelectedCheck && (
        <motion.span
          className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          style={{ x: springContentX, y: springContentY, z: 68 }}
        >
          <Check className="size-4" />
        </motion.span>
      )}
      {badge && !selected && (
        <motion.span
          className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-primary"
          style={{ x: springContentX, y: springContentY, z: 24 }}
        >
          {badge}
        </motion.span>
      )}
      <motion.span
        className={cn(
          "relative z-10 flex flex-col",
          hasCenteredArt
            ? "w-full items-center pt-28 sm:pt-32"
            : "items-center",
        )}
        style={{
          x: springContentX,
          y: springContentY,
          z: hasCenteredArt ? 40 : 34,
        }}
      >
        {showIcon && (
          <span
            className={cn(
              "flex items-center justify-center rounded-full text-primary",
              hasCenteredArt
                ? "mb-2.5 size-10 bg-background/90 shadow-sm backdrop-blur-sm"
                : "mb-3 size-11 bg-muted",
            )}
          >
            {icon}
          </span>
        )}
        <span
          className={cn(
            "text-sm font-semibold leading-snug text-foreground",
            selected && hasCenteredArt && "text-primary",
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">
            {hint}
          </span>
        )}
      </motion.span>
    </motion.button>
  );
}

export function PaywallModal({
  isLoading,
  onClose,
  onContinue,
  recipientLabel,
  songTitle,
  version,
}: {
  isLoading: boolean;
  onClose: () => void;
  onContinue: () => void;
  recipientLabel: string;
  songTitle: string;
  version: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-4 py-8 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl shadow-foreground/20"
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary text-xs font-black text-primary-foreground">
              {version}
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">{songTitle}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Version · {version} · for {recipientLabel}
              </p>
            </div>
          </div>
          <button
            aria-label="Close paywall"
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={isLoading}
            type="button"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 text-center sm:p-6">
          <p className="font-[cursive] text-base text-primary">
            one more step...
          </p>
          <h3 className="mt-1.5 text-xl font-black text-foreground">
            Choose how to unlock
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Pick a one-off unlock, a bundle, or a subscription plan on the next
            screen.
          </p>

          <div className="mx-auto mt-5 flex max-w-lg gap-3 rounded-xl border border-border bg-muted p-3.5 text-left text-sm leading-6 text-muted-foreground">
            <Gift className="mt-1 size-4 shrink-0 text-primary" />
            <p>
              You don&apos;t have a subscription or song credits yet. We&apos;ll
              take you to secure checkout to pick the right option for you.
            </p>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Secure checkout
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-background/95 p-4">
          <Button
            className="h-10 rounded-full bg-muted px-6 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
            disabled={isLoading}
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Not yet
          </Button>
          <Button
            className="h-10 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
            aria-busy={isLoading}
            disabled={isLoading}
            type="button"
            onClick={onContinue}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            {isLoading ? "Opening checkout..." : "Continue to checkout"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SongGenerationPage({
  coverError,
  coverImageUrl,
  coverPrompt,
  isGeneratingCover,
  note,
  onGenerateCover,
  onNoteChange,
  progress,
  recipientLabel,
}: {
  coverError: string;
  coverImageUrl: string;
  coverPrompt: string;
  isGeneratingCover: boolean;
  note: string;
  onGenerateCover: () => void;
  onNoteChange: (value: string) => void;
  progress: number;
  recipientLabel: string;
}) {
  return (
    <div className="mx-auto mt-10 max-w-5xl pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-primary to-accent p-7 text-primary-foreground shadow-2xl shadow-primary/20 md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-accent/35" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-accent to-primary motion-safe:animate-spin">
              <div className="flex size-16 items-center justify-center rounded-full bg-foreground">
                <Music2 className="size-8 text-primary" />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 font-[cursive] text-lg text-primary-foreground/80">
              almost there...
            </p>
            <h1 className="text-2xl font-black leading-tight md:text-3xl">
              We&apos;re recording {recipientLabel}&apos;s song
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-primary-foreground/75 md:text-base">
              Our studio is stitching the lyrics, vocals and music together.
              You&apos;ll get an email the moment it&apos;s ready.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-bold">
              <Clock3 className="size-4" />
              {Math.max(5, Math.min(99, Math.round(progress)))}% complete
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10 text-center">
        <p className="font-[cursive] text-base text-primary">
          while you wait...
        </p>
        <h2 className="mt-2 text-2xl font-black text-foreground md:text-3xl">
          Make it even more personal
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Add an album cover and a note. These will be saved with the song and
          shown whenever it&apos;s played or shared.
        </p>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              <ImageIcon className="size-4 text-primary" />
              Album Cover
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Upload your own photo or let us dream one up.
            </p>
          </div>
          <div className="mx-auto flex aspect-square w-full max-w-56 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted text-muted-foreground">
            {coverImageUrl ? (
              <img
                alt="Generated album cover"
                className="size-full object-cover"
                src={coverImageUrl}
                title={coverPrompt || undefined}
              />
            ) : isGeneratingCover ? (
              <>
                <Loader2 className="size-9 animate-spin text-primary" />
                <p className="mt-4 text-sm font-medium">Dreaming up a cover...</p>
              </>
            ) : (
              <>
                <ImageIcon className="size-9" />
                <p className="mt-4 text-sm font-medium">Pick a cover below</p>
              </>
            )}
          </div>
          {coverError && (
            <p className="mt-3 rounded-2xl bg-primary/10 px-4 py-3 text-xs font-medium leading-5 text-primary">
              {coverError}
            </p>
          )}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-full bg-foreground text-sm font-bold text-primary-foreground hover:bg-foreground/90"
              disabled={isGeneratingCover}
              type="button"
              onClick={onGenerateCover}
            >
              {isGeneratingCover ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {coverImageUrl ? "Regenerate with AI" : "Generate with AI"}
            </Button>
            <Button
              className="h-11 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground"
              disabled
              type="button"
              variant="ghost"
            >
              <Upload className="size-4" />
              Upload
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              <Mail className="size-4 text-primary" />
              Personal Note
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              A little card that sits alongside the song.
            </p>
          </div>
          <Textarea
            className="min-h-44 resize-none rounded-2xl border-0 bg-muted p-4 text-sm leading-6 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-primary/20"
            maxLength={500}
            placeholder={`Write something special for ${recipientLabel}...`}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{note.length} / 500</span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" />
              Only {recipientLabel} will see this
            </span>
          </div>
          <Button
            className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
            type="button"
          >
            <Mail className="size-4" />
            Save note
          </Button>
        </section>
      </div>
    </div>
  );
}

export function LyricsGenerationView({
  activeStep,
  names,
}: {
  activeStep: number;
  names: string[];
}) {
  const recipientLabel =
    names
      .map((name) => name.trim())
      .filter(Boolean)
      .join(" and ") || "your";

  return (
    <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center text-center">
      <div className="relative mb-8 flex size-36 items-center justify-center rounded-full bg-background shadow-2xl shadow-primary/10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-accent to-primary motion-safe:animate-spin" />
        <div className="absolute inset-3 rounded-full bg-background" />
        <Music2 className="relative size-12 text-primary/50" />
      </div>

      <h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">
        Writing {recipientLabel}&apos;s song...
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        Our songwriters are turning your story into lyrics. This usually takes
        about 20 seconds.
      </p>

      <div className="mt-10 w-full max-w-md space-y-5 text-left">
        {lyricGenerationSteps.map((item, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={item}
              className={cn(
                "flex items-center gap-4 text-base font-semibold transition",
                active || complete
                  ? "text-foreground"
                  : "text-muted-foreground/60",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  active
                    ? "bg-primary text-primary-foreground"
                    : complete
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {complete ? (
                  <Check className="size-4" />
                ) : active ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
              </span>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StoryHelperModal({
  answer,
  isCreating,
  onAnswerChange,
  onBack,
  onClose,
  onNext,
  step,
}: {
  answer: string;
  isCreating: boolean;
  onAnswerChange: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  step: number;
}) {
  const helperStep = storyHelperSteps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === storyHelperSteps.length - 1;
  const questionNumber =
    helperStep.mode === "detail"
      ? `${helperStep.group}.1`
      : String(helperStep.group);
  const progress = ((step + 1) / storyHelperSteps.length) * 100;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-3 py-6 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-background text-foreground shadow-2xl shadow-foreground/20"
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wand2 className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-black leading-tight">Story Helper</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Question {questionNumber} of 3
              </p>
            </div>
          </div>
          <button
            aria-label="Close story helper"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 pt-5 sm:px-7">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-h-[300px] flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {isCreating ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <Loader2 className="mb-6 size-10 animate-spin text-primary" />
              <h3 className="text-xl font-black">AI is writing your story...</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Turning your answers into a lyric-ready story brief.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-black leading-tight md:text-2xl">
                  {helperStep.question}
                </h3>

                {helperStep.mode === "choice" && (
                  <div className="mt-6 space-y-2">
                    {helperStep.options?.map((option) => {
                      const selected = answer === option;

                      return (
                        <button
                          key={option}
                          className={cn(
                            "block w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition",
                            selected
                              ? "bg-primary/10 text-foreground"
                              : "text-foreground hover:bg-muted",
                          )}
                          type="button"
                          onClick={() => onAnswerChange(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                    <div className="pt-2">
                      <p className="mb-2 text-sm text-muted-foreground">
                        Or write your own:
                      </p>
                      <Textarea
                        className="min-h-24 resize-none rounded-2xl border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
                        placeholder="Type your answer here..."
                        value={
                          helperStep.options?.includes(answer) ? "" : answer
                        }
                        onChange={(event) => onAnswerChange(event.target.value)}
                      />
                    </div>
                  </div>
                )}

                {helperStep.mode === "detail" && (
                  <Textarea
                    autoFocus
                    className="mt-6 min-h-36 resize-none rounded-2xl border-primary bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(event) => onAnswerChange(event.target.value)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {!isCreating && (
          <div className="flex items-center justify-between gap-4 border-t border-border bg-background/95 px-5 py-4 sm:px-7">
            <Button
              className="h-10 rounded-full bg-muted px-6 text-sm font-bold text-muted-foreground hover:bg-muted disabled:text-muted-foreground"
              disabled={isFirstStep}
              type="button"
              variant="ghost"
              onClick={onBack}
            >
              <ArrowLeft className="size-5" />
              Back
            </Button>
            <Button
              className="h-10 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
              type="button"
              onClick={onNext}
            >
              {isLastStep ? "Create Story" : "Next"}
              {!isLastStep && <ArrowRight className="size-5" />}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function StepProgress({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-5 items-start justify-center">
      {steps.map((item, index) => {
        const active = item.id === currentStep;
        const complete = item.id < currentStep;

        return (
          <div key={item.id} className="relative flex justify-center">
            {index < steps.length - 1 && (
              <div className="absolute left-1/2 top-5 h-0.5 w-full translate-x-6 rounded-full bg-border" />
            )}
            <div className="relative z-10 flex min-w-16 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-4 text-base font-bold shadow-sm",
                  active
                    ? "border-foreground bg-foreground text-primary-foreground shadow-foreground/20"
                    : complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {complete ? <Check className="size-4" /> : item.id}
              </div>
              <div
                className={cn(
                  "text-xs font-bold tracking-[0.12em]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-16 max-w-3xl text-center">
      <h2 className="text-4xl font-black leading-tight tracking-normal text-foreground md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function LyricsLineEditor({
  error,
  instruction,
  isRewriting,
  lines,
  selectedLineIds,
  suggestions,
  onAcceptSuggestion,
  onInstructionChange,
  onKeepOriginal,
  onLineChange,
  onRewriteSelected,
  onSelectionChange,
}: {
  error: string;
  instruction: string;
  isRewriting: boolean;
  lines: EditableLyricLine[];
  selectedLineIds: string[];
  suggestions: LyricsLineRewriteSuggestion[];
  onAcceptSuggestion: (lineId: string) => void;
  onInstructionChange: (value: string) => void;
  onKeepOriginal: (lineId: string) => void;
  onLineChange: (lineId: string, text: string) => void;
  onRewriteSelected: () => void;
  onSelectionChange: (lineId: string, selected: boolean) => void;
}) {
  const selectedCount = selectedLineIds.length;
  const suggestionsByLineId = new Map(
    suggestions.map((suggestion) => [suggestion.lineId, suggestion]),
  );

  return (
    <div className="space-y-3">
      <div className="-mx-4 border-y border-border/70 px-4 py-2 sm:-mx-5 sm:px-5">
        <ScrollArea className="h-[360px]">
          <div className="space-y-1 py-1">
            {lines.map((line) => {
              const isSelectable = line.kind === "lyric";
              const selected = selectedLineIds.includes(line.id);
              const suggestion = suggestionsByLineId.get(line.id);

              if (line.kind === "blank") {
                return <div key={line.id} className="h-1.5" />;
              }

              if (line.kind === "title") {
                return null;
              }

              if (line.kind === "section") {
                return (
                  <div
                    key={line.id}
                    className="flex min-h-6 items-center px-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {line.text}
                  </div>
                );
              }

              return (
                <div
                  key={line.id}
                  className={cn(
                    "group rounded-lg px-1.5 py-1 transition",
                    selected || suggestion
                      ? "bg-rose-50/90 dark:bg-rose-950/20"
                      : "bg-transparent",
                  )}
                >
                  <div className="grid grid-cols-[1.35rem_1fr] items-center gap-1.5">
                    <Checkbox
                      aria-label="Select lyric line"
                      checked={selected}
                      className={cn(
                        "size-3.5 justify-self-center transition-opacity",
                        selected
                          ? "opacity-100"
                          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                      )}
                      disabled={!isSelectable || isRewriting}
                      onCheckedChange={(checked) =>
                        onSelectionChange(line.id, checked === true)
                      }
                    />
                    <Input
                      aria-label="Lyric line"
                      className="h-7 rounded-md border-0 bg-transparent px-1.5 text-sm font-semibold leading-5 text-foreground shadow-none focus-visible:bg-background/80 focus-visible:ring-primary/15"
                      disabled={isRewriting || Boolean(suggestion)}
                      value={line.text}
                      onChange={(event) =>
                        onLineChange(line.id, event.target.value)
                      }
                    />
                  </div>

                  {suggestion && (
                    <div className="ml-7 mt-1.5 space-y-2 rounded-lg bg-background/70 p-2.5 shadow-sm">
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                            Original
                          </p>
                          <p className="mt-1 leading-6 text-muted-foreground">
                            {suggestion.originalText}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
                            New
                          </p>
                          <p className="mt-1 leading-6 font-semibold text-foreground">
                            {suggestion.rewrittenText}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          className="h-8 rounded-lg px-3 text-xs font-bold"
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => onKeepOriginal(line.id)}
                        >
                          Use original
                        </Button>
                        <Button
                          className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                          size="sm"
                          type="button"
                          onClick={() => onAcceptSuggestion(line.id)}
                        >
                          Use new
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="grid gap-2 rounded-xl bg-muted/60 p-2 sm:grid-cols-[1fr_auto]">
        <Input
          className="h-9 rounded-lg border-0 bg-background text-sm shadow-none focus-visible:ring-primary/20"
          disabled={isRewriting}
          placeholder="Optional direction, e.g. make selected lines more tender"
          value={instruction}
          onChange={(event) => onInstructionChange(event.target.value)}
        />
        <Button
          className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          disabled={!selectedCount || isRewriting}
          type="button"
          onClick={onRewriteSelected}
        >
          {isRewriting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          Rewrite {selectedCount ? selectedCount : ""}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function LyricsVersionPanel({
  label,
  lyrics,
  title,
}: {
  label: string;
  lyrics: string;
  title: string;
}) {
  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/60 px-4 py-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-black leading-6 text-foreground">
          {title || "Your Custom Song"}
        </h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <pre className="whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm font-medium leading-7 text-foreground">
          {lyrics || "No lyrics generated."}
        </pre>
      </ScrollArea>
    </section>
  );
}

export function RelationshipCreatableSelect({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const selectedValue = value.trim();
  const filteredOptions = relationshipOptions.filter((option) =>
    option.toLowerCase().includes(trimmedQuery.toLowerCase()),
  );
  const canCreate =
    trimmedQuery &&
    !relationshipOptions.some(
      (option) => option.toLowerCase() === trimmedQuery.toLowerCase(),
    );

  function selectRelationship(nextValue: string) {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setQuery(nextOpen ? selectedValue : "");
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 text-left text-base text-foreground shadow-sm transition hover:border-primary/40 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 md:text-sm",
            !selectedValue && "text-muted-foreground",
          )}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedValue || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or type a relationship..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!filteredOptions.length && !canCreate && (
              <CommandEmpty>No relationship found.</CommandEmpty>
            )}
            {canCreate && (
              <CommandGroup>
                <CommandItem onSelect={() => selectRelationship(trimmedQuery)}>
                  <Plus className="size-4 text-primary" />
                  Use &quot;{trimmedQuery}&quot;
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Common relationships">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => selectRelationship(option)}
                >
                  <Check
                    className={cn(
                      "size-4 text-primary",
                      selectedValue.toLowerCase() === option.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function EditableBlock({
  actionText,
  children,
  icon,
  label,
  onAction,
}: {
  actionText: string;
  children: ReactNode;
  icon: ReactNode;
  label: string;
  onAction?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {icon}
          {label}
        </div>
        <button
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
          type="button"
          onClick={onAction}
        >
          {onAction && <RefreshCw className="size-4" />}
          {actionText}
        </button>
      </div>
      {children}
    </section>
  );
}

export function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

export function LanguageChip({
  language,
  onClick,
  selected,
  showCode = false,
}: {
  language: LanguageOption;
  onClick: () => void;
  selected: boolean;
  showCode?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        selected ? "bg-primary/10 text-primary" : "bg-card text-foreground",
      )}
      type="button"
      onClick={onClick}
    >
      {showCode && (
        <span className="font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {language.code}
        </span>
      )}
      {language.label}
    </button>
  );
}

export function StepFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate="center"
      exit="exit"
      initial="enter"
      transition={{ duration: 0.28, ease: "easeOut" }}
      variants={stepVariants}
    >
      {children}
    </motion.div>
  );
}
