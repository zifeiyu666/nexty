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
      "From late-night talks to big dreams, you have made every year brighter. I still smile at our coffee runs, inside jokes, and the way you always cheer me on.",
  },
  {
    name: "Ethan",
    relationship: "husband",
    occasion: { label: "Wedding", value: "wedding" },
    message: "Ethan, today I choose you, and every tomorrow too.",
    story:
      "We found home in each other and promised to keep choosing love. From our first nervous hello to this day surrounded by family, every step has led me back to you.",
  },
  {
    name: "Sofia",
    relationship: "girlfriend",
    occasion: { label: "Valentine's Day", value: "valentines-day" },
    message: "Sofia, loving you is my favorite part of every day.",
    story:
      "Coffee dates, shared laughter, and your hand in mine make life feel like a song. Every small adventure and quiet Sunday morning has made me love you more.",
  },
  {
    name: "Elena",
    relationship: "mom",
    occasion: { label: "Mother's Day", value: "mothers-day" },
    message: "Mom, thank you for making love feel safe and strong.",
    story:
      "Your kindness and courage have guided me through every chapter. I carry your laughter, your patient advice, and the warmth of home with me wherever I go.",
  },
  {
    name: "Daniel",
    relationship: "dad",
    occasion: { label: "Father's Day", value: "fathers-day" },
    message: "Dad, your belief in me still gives me courage.",
    story:
      "From your patient advice to your quiet support, you taught me how to keep going. I will always remember our weekend drives, your steady hands, and the confidence you gave me.",
  },
];

const occasionValuesByLabel = new Map(
  songBriefTemplates.map((template) => [
    template.occasion.label.trim().toLowerCase(),
    template.occasion.value,
  ]),
);

export function resolveSongBriefOccasion(occasion: string) {
  const trimmedOccasion = occasion.trim();
  return (
    occasionValuesByLabel.get(trimmedOccasion.toLowerCase()) ||
    trimmedOccasion ||
    null
  );
}
