"use client";

import { Button } from "@/components/ui/button";
import {
  defaultGenre,
  defaultLanguage,
  draftStorageKey,
} from "@/components/song/custom-song-wizard/constants";
import type { StoredDraft } from "@/components/song/custom-song-wizard/types";
import { useRouter } from "@/i18n/routing";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import {
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
};

const languageByLocale: Record<string, string> = {
  en: "English",
  es: "Spanish",
  ja: "Japanese",
};
const templateTextClassName =
  "font-['Bradley_Hand','Comic_Sans_MS',cursive] [font-weight:200] text-white/78";

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
}: EditableFieldProps) {
  const fieldRef = useRef<HTMLSpanElement>(null);
  const markerClassName =
    "inline-block min-w-[6rem] cursor-text rounded-[0.42rem] bg-[linear-gradient(177deg,transparent_8%,rgba(255,255,255,0.16)_8%,rgba(255,255,255,0.25)_88%,transparent_88%)] px-2 py-px font-['Bradley_Hand','Comic_Sans_MS',cursive] text-inherit [font-weight:200] leading-inherit text-white/78 outline-none transition-[background-color,box-shadow] empty:before:content-[attr(data-placeholder)] empty:before:text-white/58 hover:bg-white/[0.17] focus:bg-white/[0.25] focus:shadow-[0_0_0_2px_rgba(255,255,255,0.18)]";

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
    if (event.key !== "Enter") return;
    event.preventDefault();
    fieldRef.current?.blur();
  }

  return (
    <span
      ref={fieldRef}
      role="textbox"
      aria-label={ariaLabel}
      aria-placeholder={placeholder}
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={syncValue}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className={`${markerClassName} ${className || ""}`}
    >
      {value}
    </span>
  );
}

export default function StructuredSongBrief() {
  const router = useRouter();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occasion, setOccasion] = useState("");
  const [theme, setTheme] = useState("");
  const [message, setMessage] = useState("");
  const [story, setStory] = useState("");

  function saveBriefAndStart() {
    const storyParts = [
      theme.trim() && `Theme: ${theme.trim()}.`,
      message.trim() && `Message to include: ${message.trim()}.`,
      story.trim(),
    ].filter(Boolean);
    const previousDraft = window.localStorage.getItem(draftStorageKey);
    let draft: StoredDraft = {};

    try {
      draft = previousDraft ? (JSON.parse(previousDraft) as StoredDraft) : {};
    } catch {
      // A malformed old draft should not prevent a new song from starting.
    }

    const nextDraft: StoredDraft = {
      ...draft,
      genre: defaultGenre,
      language: languageByLocale[locale] || defaultLanguage,
      occasion: occasion.trim() || null,
      recipients: [{ name: name.trim(), relationship: relationship.trim() }],
      recipientNames: [name.trim()],
      recipientRelationships: [relationship.trim()],
      story: storyParts.join("\n\n"),
      generatedLyrics: undefined,
      lyricsGeneratedBy: undefined,
      lyricsInputKey: undefined,
      songTitle: undefined,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
    router.push("/create-song");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        saveBriefAndStart();
      }}
      className="w-full max-w-[48rem] rounded-[1.15rem] bg-white/[0.12] p-3 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl sm:p-3.5"
    >
      <p
        className={`mb-1.5 text-center text-xs leading-4 text-white/65 sm:text-[0.8rem] ${templateTextClassName}`}
      >
        Start with a few details. We will shape them into your song.
      </p>

      <div
        className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[0.8rem] leading-6 sm:text-sm sm:leading-7 ${templateTextClassName}`}
      >
        <span>I want to send a song to</span>
        <EditableField
          ariaLabel="Recipient name"
          placeholder="[ Name ]"
          value={name}
          onValueChange={setName}
          className="min-w-[5.75rem]"
        />
        <span>my</span>
        <EditableField
          ariaLabel="Relationship"
          placeholder="[ Relationship ]"
          value={relationship}
          onValueChange={setRelationship}
          className="min-w-[7.75rem]"
        />
        <span>for</span>
        <EditableField
          ariaLabel="Occasion"
          placeholder="[ Occasion ]"
          value={occasion}
          onValueChange={setOccasion}
          className="min-w-[6rem]"
        />
        <span>about</span>
        <EditableField
          ariaLabel="Song theme"
          placeholder="[ Theme ]"
          value={theme}
          onValueChange={setTheme}
          className="min-w-[5.25rem]"
        />
        <span>. I want to say</span>
        <EditableField
          ariaLabel="Message to include"
          placeholder="[ Message ]"
          value={message}
          onValueChange={setMessage}
          className="min-w-[6rem]"
        />
        <span>. Our story is</span>
        <EditableField
          ariaLabel="Shared story"
          placeholder="[ Your story ]"
          value={story}
          onValueChange={setStory}
          className="min-w-[6.75rem]"
        />
        <span>.</span>
      </div>

      <div
        className={`mt-2 flex justify-end px-1 text-[0.8rem] leading-6 sm:text-sm sm:leading-7 ${templateTextClassName}`}
      >
        <Button
          type="submit"
          className="h-7 shrink-0 rounded-[0.6rem] bg-primary px-3 text-[0.76rem] font-semibold text-white shadow-[0_8px_18px_rgba(224,65,50,0.28)] hover:bg-primary/90 sm:h-8 sm:text-[0.8rem]"
        >
          <Sparkles className="size-3.5" /> Create preview{" "}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </form>
  );
}
