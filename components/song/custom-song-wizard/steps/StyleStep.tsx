"use client";

import { ChevronDown, Globe2, Mic2, Music2, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { LanguageChip, MagneticChoiceCard } from "../components/wizard-ui";
import {
  featuredLanguages,
  moreLanguages,
  vocalGenderOptions,
} from "../constants";
import type { GenreOption, Occasion } from "../types";
import {
  localizedGenreLabel,
  useWizardCopy,
  useWizardLocale,
} from "../i18n";

type StyleStepProps = {
  genre: string;
  language: string;
  occasion: Occasion | null;
  recommendedGenreSet: Set<string>;
  selectedGenreIsNotRecommended: boolean;
  selectedOccasionTitle: string;
  showAllLanguages: boolean;
  sortedGenres: GenreOption[];
  vocalGender: string;
  customVoiceId?: string;
  onGenreSelect: (genre: GenreOption) => void;
  onLanguageChange: (value: string) => void;
  onShowAllLanguagesChange: Dispatch<SetStateAction<boolean>>;
  onVocalGenderChange: (value: string) => void;
  onCustomVoiceChange: (value?: string) => void;
};

export function StyleStep({
  genre,
  language,
  occasion,
  recommendedGenreSet,
  selectedGenreIsNotRecommended,
  selectedOccasionTitle,
  showAllLanguages,
  sortedGenres,
  vocalGender,
  customVoiceId,
  onGenreSelect,
  onLanguageChange,
  onShowAllLanguagesChange,
  onVocalGenderChange,
  onCustomVoiceChange,
}: StyleStepProps) {
  const copy = useWizardCopy();
  const locale = useWizardLocale();
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [customVoices, setCustomVoices] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => { fetch("/api/voices").then((response) => response.json()).then((result) => { if (result.success) setCustomVoices(result.data.filter((voice: { status: string }) => voice.status === "ready")); }).catch(() => undefined); }, []);
  const recommendedGenres = occasion
    ? sortedGenres.filter((item) => recommendedGenreSet.has(item.value))
    : [];
  const otherGenres = occasion
    ? sortedGenres.filter((item) => !recommendedGenreSet.has(item.value))
    : sortedGenres;
  const showOtherGenres =
    !occasion || showMoreGenres || selectedGenreIsNotRecommended;

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      {selectedGenreIsNotRecommended && (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-muted-foreground">
          <span className="font-bold text-foreground">{genre}</span> may feel
          less natural for {selectedOccasionTitle}. You can keep it, or pick one
          of the recommended styles below.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-base font-bold">
            <Music2 className="size-5 text-accent-foreground" />
            {copy.genre}
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {copy.pickOne}
        </p>
      </div>

      {occasion && recommendedGenres.length > 0 && (
        <section className="mb-5 rounded-3xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
          <div className="mb-3 text-center">
            <h3 className="text-base font-black text-foreground">
              {selectedOccasionTitle} · {copy.recommended}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
            {recommendedGenres.map((item) => {
              const selected = genre === item.value;

              return (
                <MagneticChoiceCard
                  key={item.value}
                  icon={<span className={item.accent}>{item.icon}</span>}
                  label={localizedGenreLabel(locale, item.value, item.label)}
                  recommended
                  selected={selected}
                  onClick={() => onGenreSelect(item)}
                />
              );
            })}
          </div>
        </section>
      )}

      {occasion && otherGenres.length > 0 && (
        <button
          aria-expanded={showOtherGenres}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:-translate-y-0.5 hover:bg-card hover:text-foreground hover:shadow-sm"
          type="button"
          onClick={() => setShowMoreGenres((current) => !current)}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              !showOtherGenres && "-rotate-90",
            )}
          />
          {showOtherGenres ? copy.showFewerLanguages : copy.showMoreLanguages}
        </button>
      )}
      {showOtherGenres && (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          {otherGenres.map((item) => {
            const selected = genre === item.value;

            return (
              <MagneticChoiceCard
                key={item.value}
                icon={<span className={item.accent}>{item.icon}</span>}
                label={localizedGenreLabel(locale, item.value, item.label)}
                muted={Boolean(occasion)}
                selected={selected}
                onClick={() => onGenreSelect(item)}
              />
            );
          })}
        </div>
      )}

      <div className="mt-9">
        <div className="mb-4 flex items-center gap-2 text-base font-bold">
          <Mic2 className="size-5 text-accent-foreground" />
          {copy.voice}
        </div>
        <div className="flex flex-wrap gap-3">
          {vocalGenderOptions.map((option) => {
            const selected = vocalGender === option;
            const auto = option === "Pick for me";

            return (
              <button
                key={option}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm",
                  selected
                    ? "bg-primary/10 text-primary"
                    : auto
                      ? "border-2 border-dashed border-border bg-transparent text-foreground"
                      : "bg-card text-foreground",
                )}
                type="button"
                onClick={() => onVocalGenderChange(option)}
              >
                {locale === "es"
                  ? option === "Pick for me"
                    ? "Elegir por mí"
                    : option === "Male"
                      ? "Masculina"
                      : "Femenina"
                  : locale === "ja"
                    ? option === "Pick for me"
                      ? "おまかせ"
                      : option === "Male"
                        ? "男性"
                        : "女性"
                    : option}
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg border bg-white p-3">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Use my custom voice</p><a className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" href="/voices?create=1"><Plus className="size-3.5" /> Add voice</a></div>
          <div className="mt-3 flex flex-wrap gap-2"><button className={cn("rounded-full border px-3 py-1.5 text-sm", !customVoiceId && "border-primary bg-primary/10 text-primary")} type="button" onClick={() => onCustomVoiceChange(undefined)}>Default voice</button>{customVoices.map((voice) => <button key={voice.id} className={cn("rounded-full border px-3 py-1.5 text-sm", customVoiceId === voice.id && "border-primary bg-primary/10 text-primary")} type="button" onClick={() => onCustomVoiceChange(voice.id)}>{voice.name}</button>)}</div>
          {!customVoices.length && <p className="mt-2 text-xs text-muted-foreground">Add and verify a voice to use it in this song.</p>}
        </div>
      </div>

      <div className="mt-9">
        <div className="mb-4 flex items-center gap-2 text-base font-bold">
          <Globe2 className="size-5 text-accent-foreground" />
          {copy.language}
        </div>
        <div className="flex flex-wrap gap-3">
          {featuredLanguages.map((item) => (
            <LanguageChip
              key={item.code}
              language={item}
              selected={language === item.value}
              onClick={() => onLanguageChange(item.value)}
            />
          ))}
        </div>
        <button
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-sm"
          type="button"
          onClick={() => onShowAllLanguagesChange((current) => !current)}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              !showAllLanguages && "-rotate-90",
            )}
          />
          {showAllLanguages
            ? copy.showFewerLanguages
            : copy.showMoreLanguages}
        </button>
        {showAllLanguages && (
          <div className="mt-5 flex flex-wrap gap-3">
            {moreLanguages.map((item) => (
              <LanguageChip
                key={item.code}
                language={item}
                selected={language === item.value}
                showCode
                onClick={() => onLanguageChange(item.value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
