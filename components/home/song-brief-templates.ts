import {
  defaultGenre,
  defaultLanguage,
  occasions,
} from "@/components/song/custom-song-wizard/constants";
import type { StoredDraft } from "@/components/song/custom-song-wizard/types";

export type SongBriefTemplate = {
  name: string;
  relationship: string;
  occasion: {
    label: string;
    value: string;
  };
  message: string;
  story: string;
};

export const songBriefTemplates: SongBriefTemplate[] = [
  {
    name: "Maya",
    relationship: "best friend",
    occasion: { label: "Birthday", value: "birthday" },
    message: "Maya, may this year bring you every joy you give to others.",
    story:
      "Late-night talks, inside jokes, and the way you always cheer me on make every year brighter.",
  },
  {
    name: "Ethan",
    relationship: "husband",
    occasion: { label: "Wedding", value: "wedding" },
    message: "Ethan, today I choose you, and every tomorrow too.",
    story:
      "From our first nervous hello to this day, every step has led me back to you.",
  },
  {
    name: "Sofia",
    relationship: "girlfriend",
    occasion: { label: "Valentine's Day", value: "valentines-day" },
    message: "Sofia, loving you is my favorite part of every day.",
    story:
      "Coffee dates, shared laughter, and quiet Sunday mornings have made me love you more.",
  },
  {
    name: "Elena",
    relationship: "mom",
    occasion: { label: "Mother's Day", value: "mothers-day" },
    message: "Mom, thank you for making love feel safe and strong.",
    story:
      "Your kindness and courage guided me through every chapter, and I carry your warmth wherever I go.",
  },
  {
    name: "Daniel",
    relationship: "dad",
    occasion: { label: "Father's Day", value: "fathers-day" },
    message: "Dad, your belief in me still gives me courage.",
    story:
      "Your patient advice and quiet support taught me how to keep going.",
  },
];

export const messageSongBriefTemplates: SongBriefTemplate[] = [
  {
    name: "Nora",
    relationship: "best friend",
    occasion: { label: "Thank You", value: "thank-you" },
    message: "Nora, you made the hard days feel lighter just by being there.",
    story:
      "Late-night voice notes, emergency coffee runs, and the way you always know when I need encouragement.",
  },
  {
    name: "James",
    relationship: "husband",
    occasion: { label: "Anniversary", value: "anniversary" },
    message: "I would still choose you in every version of our story.",
    story:
      "We met on a rainy Tuesday, built a home full of Sunday pancakes, and still laugh at the same terrible jokes.",
  },
  {
    name: "Mia",
    relationship: "daughter",
    occasion: { label: "Birthday", value: "birthday" },
    message: "Never forget how brave, curious, and deeply loved you are.",
    story:
      "From dinosaur pajamas to kitchen dance parties, you have brought color and courage into every room.",
  },
  {
    name: "Alex",
    relationship: "partner",
    occasion: { label: "Just Because", value: "just-because" },
    message: "Distance changes the view, but it never changes what you mean to me.",
    story:
      "Airport goodbyes, long calls across time zones, and the playlist we keep adding to until we are together again.",
  },
];

const occasionValuesByLabel = new Map<string, string>([
  ...occasions.map(
    (occasion) =>
      [occasion.title.trim().toLowerCase(), occasion.value] as [
        string,
        string,
      ],
  ),
  ...songBriefTemplates.map(
    (template) =>
      [
        template.occasion.label.trim().toLowerCase(),
        template.occasion.value,
      ] as [string, string],
  ),
  ...messageSongBriefTemplates.map(
    (template) =>
      [
        template.occasion.label.trim().toLowerCase(),
        template.occasion.value,
      ] as [string, string],
  ),
]);

export function resolveSongBriefOccasion(occasion: string) {
  const trimmedOccasion = occasion.trim();
  return (
    occasionValuesByLabel.get(trimmedOccasion.toLowerCase()) ||
    trimmedOccasion ||
    null
  );
}

type CreateSongBriefDraftInput = {
  previousDraft?: StoredDraft;
  localeLanguage?: string;
  name: string;
  relationship: string;
  occasion: string;
  message: string;
  story: string;
};

export function createSongBriefDraft({
  previousDraft = {},
  localeLanguage = defaultLanguage,
  name,
  relationship,
  occasion,
  message,
  story,
}: CreateSongBriefDraftInput): StoredDraft {
  const trimmedName = name.trim();
  const trimmedRelationship = relationship.trim();
  const trimmedMessage = message.trim();

  return {
    ...previousDraft,
    genre: defaultGenre,
    language: localeLanguage,
    occasion: resolveSongBriefOccasion(occasion),
    recipients: [{ name: trimmedName, relationship: trimmedRelationship }],
    recipientNames: [trimmedName],
    recipientRelationships: [trimmedRelationship],
    story: story.trim(),
    spokenBlessing: trimmedMessage,
    spokenMode: trimmedMessage ? "text" : "recording",
    spokenIntro: undefined,
    generatedLyrics: undefined,
    lyricsGeneratedBy: undefined,
    lyricsInputKey: undefined,
    songTitle: undefined,
  };
}
