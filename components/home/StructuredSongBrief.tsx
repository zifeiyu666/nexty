"use client";

import { HeaderActionText } from "@/components/header/HeaderActionText";
import {
  createSongBriefDraft,
  messageSongBriefTemplates,
  songBriefTemplates,
  type SongBriefTemplate,
} from "@/components/home/song-brief-templates";
import {
  customOccasionValue,
  defaultLanguage,
  draftStorageKey,
  occasions,
  relationshipOptions,
} from "@/components/song/custom-song-wizard/constants";
import type { StoredDraft } from "@/components/song/custom-song-wizard/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { ArrowRight, ChevronDown, Dices, Edit3, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

type EditableFieldProps = {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  variant?: "a" | "b" | "c";
  suggestions?: string[];
  theme?: "dark" | "letter";
};

export type StructuredSongBriefProps = {
  variant?: "hero" | "letter";
  templates?: SongBriefTemplate[];
  introText?: string;
  leadText?: string;
  messageLeadText?: string;
  storyLeadText?: string;
  submitLabel?: string;
  advancedLabel?: string;
};

const languageByLocale: Record<string, string> = {
  en: "English",
  es: "Spanish",
  ja: "Japanese",
};
const occasionSuggestions = occasions
  .filter((occasion) => occasion.value !== customOccasionValue)
  .map((occasion) => occasion.title);

function insertPlainText(text: string) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function EditableField({
  ariaLabel,
  placeholder,
  value,
  onValueChange,
  className,
  multiline = false,
  variant = "a",
  suggestions,
  theme = "dark",
}: EditableFieldProps) {
  const fieldRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  // Bumped when a preset replaces the value so the editable span remounts
  // and browser-edited text nodes cannot shadow the React-rendered value.
  const [fieldRevision, setFieldRevision] = useState(0);
  const hasSuggestions = Boolean(suggestions?.length);
  const markerBaseClassName =
    `marker-stroke marker-stroke-${variant} ${theme === "letter" ? "marker-stroke-letter" : ""} cursor-text font-['Bradley_Hand','Comic_Sans_MS',cursive] text-inherit [font-weight:200] leading-inherit outline-none empty:before:content-[attr(data-placeholder)] ${
      hasSuggestions && !multiline ? "pl-2 pr-5" : "px-2"
    } ${
      theme === "letter"
        ? "text-[#4d332a] empty:before:text-[#9d7f73]"
        : "text-white/78 empty:before:text-white/58"
    }`;
  // Multiline fields stay inline so the marker highlight follows each
  // wrapped text fragment instead of painting one big block rectangle.
  const markerClassName = multiline
    ? `inline box-decoration-clone py-[6px] ${markerBaseClassName}`
    : `inline-block min-w-[6rem] text-center py-px ${markerBaseClassName}`;

  useEffect(() => {
    if (!suggestionsOpen) return;

    function handleDocumentPointerDown(event: PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
  }, [suggestionsOpen]);

  function syncValue() {
    onValueChange(fieldRef.current?.innerText.replace(/\n/g, " ").trim() || "");
  }

  function handlePaste(event: ClipboardEvent<HTMLSpanElement>) {
    event.preventDefault();
    insertPlainText(
      event.clipboardData.getData("text/plain").replace(/\s+/g, " "),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      fieldRef.current?.blur();
      return;
    }
    // Typing your own text dismisses the preset dropdown.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      setSuggestionsOpen(false);
    }
  }

  // Select the whole value on focus so the first keystroke replaces it
  // instead of making the user delete the template text manually.
  function handleFocus() {
    if (hasSuggestions) setSuggestionsOpen(true);
    window.setTimeout(() => {
      const el = fieldRef.current;
      if (!el || document.activeElement !== el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
    }, 0);
  }

  function selectSuggestion(option: string) {
    setSuggestionsOpen(false);
    setFieldRevision((revision) => revision + 1);
    onValueChange(option);
  }

  const editableSpan = (
    <span
      key={fieldRevision}
      ref={fieldRef}
      role="textbox"
      aria-label={ariaLabel}
      aria-placeholder={placeholder}
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={handleFocus}
      onBlur={syncValue}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className={`${markerClassName} ${className || ""}`}
    >
      {value}
    </span>
  );

  if (!suggestions?.length) return editableSpan;

  const selectedSuggestion = value.trim().toLowerCase();

  return (
    <span ref={wrapperRef} className="relative inline-block">
      {editableSpan}
      <button
        type="button"
        aria-expanded={suggestionsOpen}
        aria-label={`Choose ${ariaLabel.toLowerCase()} from presets`}
        title="Choose from presets"
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => {
          if (suggestionsOpen) {
            setSuggestionsOpen(false);
          } else {
            fieldRef.current?.focus();
          }
        }}
        className={`absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 transition-colors ${
          theme === "letter"
            ? "text-[#a07060] hover:text-[#6d3d31]"
            : "text-white/45 hover:text-white/85"
        }`}
      >
        <ChevronDown className="size-3" />
      </button>
      {suggestionsOpen ? (
        <span
          onPointerDown={(event) => event.preventDefault()}
          className={`absolute left-1/2 top-full z-30 mt-1.5 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl p-1.5 backdrop-blur-xl ${
            theme === "letter"
              ? "border border-[#dfc7bb] bg-[#fffaf4]/95 shadow-[0_18px_40px_rgba(91,55,42,0.18)]"
              : "border border-white/15 bg-[#262220]/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          }`}
        >
          <span className="flex flex-wrap justify-center gap-1">
            {suggestions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectSuggestion(option)}
                className={`cursor-pointer rounded-full px-2.5 py-1 font-['Bradley_Hand','Comic_Sans_MS',cursive] text-xs [font-weight:200] transition-colors ${
                  option.trim().toLowerCase() === selectedSuggestion
                    ? theme === "letter"
                      ? "bg-[#f1ddd2] text-[#5b342b]"
                      : "bg-white/16 text-white"
                    : theme === "letter"
                      ? "text-[#7b5a4f] hover:bg-[#f6e9e1] hover:text-[#4d2e25]"
                      : "text-white/75 hover:bg-white/12 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default function StructuredSongBrief({
  variant = "hero",
  templates = songBriefTemplates,
  introText = "Start with a few details. We will shape them into your song.",
  leadText = "I want to send a song to",
  messageLeadText = "I want to say",
  storyLeadText = "Our story",
  submitLabel = "Create immediately",
  advancedLabel = "Advanced Editing",
}: StructuredSongBriefProps) {
  const router = useRouter();
  const locale = useLocale();
  const activeTemplates = templates.length ? templates : messageSongBriefTemplates;
  const [templateIndex, setTemplateIndex] = useState(0);
  const [name, setName] = useState(activeTemplates[0].name);
  const [relationship, setRelationship] = useState(
    activeTemplates[0].relationship,
  );
  const [occasion, setOccasion] = useState(
    activeTemplates[0].occasion.label,
  );
  const [message, setMessage] = useState(activeTemplates[0].message);
  const [story, setStory] = useState(activeTemplates[0].story);
  const isLetter = variant === "letter";

  function applyTemplate(template: SongBriefTemplate, index: number) {
    setTemplateIndex(index);
    setName(template.name);
    setRelationship(template.relationship);
    setOccasion(template.occasion.label);
    setMessage(template.message);
    setStory(template.story);
  }

  function chooseRandomTemplate() {
    if (activeTemplates.length < 2) return;
    const offset = 1 + Math.floor(Math.random() * (activeTemplates.length - 1));
    const nextIndex = (templateIndex + offset) % activeTemplates.length;
    applyTemplate(activeTemplates[nextIndex], nextIndex);
  }

  function saveBriefAndStart(mode: "advanced" | "immediate" = "immediate") {
    const previousDraft = window.localStorage.getItem(draftStorageKey);
    let draft: StoredDraft = {};

    try {
      draft = previousDraft ? (JSON.parse(previousDraft) as StoredDraft) : {};
    } catch {
      // A malformed old draft should not prevent a new song from starting.
    }

    const nextDraft = createSongBriefDraft({
      previousDraft: draft,
      localeLanguage: languageByLocale[locale] || defaultLanguage,
      name,
      relationship,
      occasion,
      message,
      story,
    });

    window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
    router.push(mode === "immediate" ? "/create-song?step=lyrics" : "/create-song");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        saveBriefAndStart();
      }}
      className={`w-full max-w-[58rem] rounded-[1rem] p-3 text-left backdrop-blur-[10px] sm:p-3.5 ${
        isLetter
          ? "border border-[#d9bfb2] bg-[#fffaf2]/94 shadow-[0_28px_80px_rgba(75,43,31,0.18)]"
          : "bg-black/[0.14]"
      }`}
    >
      <p
        className={`mb-1.5 text-center text-xs leading-4 sm:text-[0.8rem] ${
          isLetter ? "text-[#866b60]" : "text-white/65"
        }`}
      >
        {introText}
      </p>

      <div
        className={`flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5 text-[0.8rem] leading-6 sm:text-sm sm:leading-7 ${
          isLetter ? "text-[#6d5147]" : "text-white/65"
        }`}
      >
        <span>{leadText}</span>
        <EditableField
          ariaLabel="Recipient name"
          placeholder="[ Name ]"
          value={name}
          onValueChange={setName}
          className="min-w-[5.75rem]"
          theme={isLetter ? "letter" : "dark"}
        />
        <span>my</span>
        <EditableField
          ariaLabel="Relationship"
          placeholder="[ Relationship ]"
          value={relationship}
          onValueChange={setRelationship}
          variant="b"
          className="min-w-[7.75rem]"
          suggestions={relationshipOptions}
          theme={isLetter ? "letter" : "dark"}
        />
        <span>for</span>
        <EditableField
          ariaLabel="Occasion"
          placeholder="[ Occasion ]"
          value={occasion}
          onValueChange={setOccasion}
          variant="c"
          className="min-w-[6rem]"
          suggestions={occasionSuggestions}
          theme={isLetter ? "letter" : "dark"}
        />
        <span className="basis-full h-0" aria-hidden="true" />
        <span>{messageLeadText}</span>
        <EditableField
          ariaLabel="Message to include"
          placeholder="[ Message ]"
          value={message}
          onValueChange={setMessage}
          variant="b"
          className="min-w-[6rem]"
          theme={isLetter ? "letter" : "dark"}
        />
        <span className="basis-full h-0" aria-hidden="true" />
        <span className="text-center">
          {storyLeadText} {" "}
          <EditableField
            ariaLabel="Shared story"
            placeholder="[ Your story ]"
            value={story}
            onValueChange={setStory}
            variant="c"
            multiline
            theme={isLetter ? "letter" : "dark"}
          />
        </span>
      </div>

      <div
        className={`mt-2 flex items-center justify-between gap-3 px-1 text-[0.8rem] leading-6 sm:text-sm sm:leading-7`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={chooseRandomTemplate}
          className={`size-7 rounded-full transition-transform hover:rotate-[18deg] sm:size-8 ${
            isLetter
              ? "text-[#8b6255] hover:bg-[#f3e2da] hover:text-[#5b342b]"
              : "text-white/72 hover:bg-white/14 hover:text-white"
          }`}
          aria-label="Choose another song template"
          title="Choose another template"
        >
          <Dices className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => saveBriefAndStart("advanced")}
            className={`group/nav-link h-7 shrink-0 overflow-hidden rounded-full px-3 text-[0.72rem] font-semibold shadow-none sm:h-8 sm:text-[0.76rem] ${
              isLetter
                ? "border-[#d8bdb0] bg-white/60 text-[#6a4539] hover:bg-[#f7e9e1] hover:text-[#4e2b23]"
                : "border-white/20 bg-white/[0.08] text-white/80 hover:bg-white/[0.14] hover:text-white"
            }`}
          >
            <HeaderActionText icon={<Edit3 className="size-3.5" />}>
              {advancedLabel}
            </HeaderActionText>
          </Button>
          <Button
            type="submit"
            className="group/nav-link h-7 shrink-0 overflow-hidden rounded-full bg-primary px-3 text-[0.76rem] font-semibold text-white shadow-[0_8px_18px_rgba(224,65,50,0.28)] hover:bg-primary/90 sm:h-8 sm:text-[0.8rem]"
          >
            <HeaderActionText icon={<Sparkles className="size-3.5" />}>
              {submitLabel} <ArrowRight className="size-3.5" />
            </HeaderActionText>
          </Button>
        </div>
      </div>
    </form>
  );
}
