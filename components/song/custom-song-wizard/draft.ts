import {
  defaultGenre,
  defaultLanguage,
  fallbackRecommendedGenres,
  recommendedGenresByOccasion,
} from "./constants";
import { isCustomOccasion } from "./constants";
import type { Occasion, RecipientInput, StoredDraft } from "./types";

export function createLyricsInputKey({
  genre,
  language,
  occasion,
  recipients,
  story,
  vocalGender,
}: {
  genre: string;
  language: string;
  occasion: Occasion | null;
  recipients: RecipientInput[];
  story: string;
  vocalGender: string;
}) {
  return JSON.stringify({
    genre,
    language,
    occasion,
    recipients: cleanRecipients(recipients),
    story: story.trim(),
    vocalGender,
  });
}

export function isLegacyEmptyStyleDraft(draft: StoredDraft) {
  const hasRecipients =
    draft.recipients?.some(
      (recipient) => recipient.name.trim() || recipient.relationship.trim(),
    ) || draft.recipientNames?.some((name) => name.trim());
  const hasProgress = Boolean(
    draft.generatedLyrics?.trim() ||
      draft.lyricsGeneratedBy ||
      draft.lyricsInputKey ||
      draft.occasion ||
      hasRecipients ||
      draft.songTitle?.trim() ||
      draft.story?.trim(),
  );

  return (
    !hasProgress &&
    draft.genre === "Pop" &&
    draft.vocalGender === "Female" &&
    (!draft.language || draft.language === defaultLanguage)
  );
}

export function normalizeRecipientsFromDraft(
  draft: StoredDraft,
): RecipientInput[] {
  const recipients =
    draft.recipients?.map((recipient) => ({
      name: recipient.name || "",
      relationship: recipient.relationship || "",
    })) ||
    draft.recipientNames?.map((name, index) => ({
      name,
      relationship: draft.recipientRelationships?.[index] || "",
    })) ||
    [];

  const normalized = recipients.slice(0, 3);
  return normalized.length ? normalized : [{ name: "", relationship: "" }];
}

export function cleanRecipients(recipients: RecipientInput[]) {
  return recipients
    .map((recipient) => ({
      name: recipient.name.trim(),
      relationship: recipient.relationship.trim(),
    }))
    .filter((recipient) => recipient.name);
}

export function getRecommendedGenresForOccasion(occasion: Occasion | null) {
  const occasionGenres =
    occasion && !isCustomOccasion(occasion)
      ? recommendedGenresByOccasion[occasion]
      : null;

  return Array.from(
    new Set([defaultGenre, ...(occasionGenres || fallbackRecommendedGenres)]),
  );
}
