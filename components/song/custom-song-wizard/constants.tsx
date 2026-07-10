import {
  AudioLines,
  Cake,
  CalendarHeart,
  Coffee,
  Disc3,
  Flame,
  Flower2,
  Gem,
  Globe2,
  Guitar,
  HandHeart,
  Headphones,
  Heart,
  HeartPulse,
  Keyboard,
  Leaf,
  Mic2,
  MoonStar,
  Music2,
  PartyPopper,
  Plus,
  Ribbon,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  GenreOption,
  LanguageOption,
  LyricLine,
  Occasion,
  WizardStep,
} from "./types";

export const draftStorageKey = "custom-song-wizard-draft-v1";
export const defaultGenre = "You Choose For Me";
export const defaultVocalGender = "Pick for me";
export const defaultLanguage = "English";
export const relationshipOptions = [
  "Mother",
  "Father",
  "Partner",
  "Wife",
  "Husband",
  "Girlfriend",
  "Boyfriend",
  "Daughter",
  "Son",
  "Sister",
  "Brother",
  "Grandmother",
  "Grandfather",
  "Best friend",
  "Friend",
  "Colleague",
  "Teacher",
  "Mentor",
];

export const stepSlugs: Record<WizardStep, string> = {
  1: "recipient",
  2: "style",
  3: "story",
  4: "lyrics",
  5: "song",
};

export const slugToStep = Object.entries(stepSlugs).reduce(
  (acc, [stepValue, slug]) => {
    acc[slug] = Number(stepValue) as WizardStep;
    return acc;
  },
  {} as Record<string, WizardStep>,
);

export const steps: Array<{ id: WizardStep; label: string }> = [
  { id: 1, label: "RECIPIENT" },
  { id: 2, label: "STYLE" },
  { id: 3, label: "STORY" },
  { id: 4, label: "LYRICS" },
  { id: 5, label: "SONG" },
];

export const genres: GenreOption[] = [
  {
    value: "You Choose For Me",
    label: "You Choose For Me",
    icon: <Sparkles className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Pop",
    label: "Pop",
    icon: <Mic2 className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Classic Rock",
    label: "Classic Rock",
    icon: <Guitar className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Hard Rock",
    label: "Hard Rock",
    icon: <Flame className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Pop Rock",
    label: "Pop Rock",
    icon: <Zap className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Indie Rock",
    label: "Indie Rock",
    icon: <Disc3 className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Folk Rock",
    label: "Folk Rock",
    icon: <Leaf className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Hip Hop",
    label: "Hip Hop",
    icon: <Mic2 className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "R&B",
    label: "R&B",
    icon: <Music2 className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Electronic dance music (EDM)",
    label: "Electronic dance music (EDM)",
    icon: <AudioLines className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Country",
    label: "Country",
    icon: <Disc3 className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Jazz",
    label: "Jazz",
    icon: <Keyboard className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Classical",
    label: "Classical",
    icon: <Music2 className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Reggae",
    label: "Reggae",
    icon: <Globe2 className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Romantic Ballad",
    label: "Romantic Ballad",
    icon: <Heart className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Folk Pop",
    label: "Folk Pop",
    icon: <Leaf className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Folk Country",
    label: "Folk Country",
    icon: <Leaf className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Acoustic",
    label: "Acoustic",
    icon: <Guitar className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Kids & Family",
    label: "Kids & Family",
    icon: <Disc3 className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Lullaby",
    label: "Lullaby",
    icon: <MoonStar className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Lo-Fi Chill",
    label: "Lo-Fi Chill",
    icon: <Coffee className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Birthday Pop",
    label: "Birthday Pop",
    icon: <Cake className="size-6" />,
    accent: "text-primary",
  },
  {
    value: "Latin Pop",
    label: "Latin Pop",
    icon: <Music2 className="size-6" />,
    accent: "text-accent-foreground",
  },
  {
    value: "Synthwave",
    label: "Synthwave",
    icon: <Headphones className="size-6" />,
    accent: "text-accent-foreground",
  },
];

export const fallbackRecommendedGenres = [
  defaultGenre,
  "Pop",
  "Acoustic",
  "Romantic Ballad",
  "Folk Pop",
];

export const recommendedGenresByOccasion: Record<string, string[]> = {
  "mothers-day": ["Acoustic", "Folk Pop", "Romantic Ballad", "Pop", "Country"],
  "fathers-day": ["Country", "Folk Rock", "Classic Rock", "Acoustic", "Pop"],
  birthday: [
    "Birthday Pop",
    "Pop",
    "Pop Rock",
    "Kids & Family",
    "Electronic dance music (EDM)",
  ],
  anniversary: ["Romantic Ballad", "R&B", "Acoustic", "Jazz", "Pop"],
  wedding: ["Romantic Ballad", "Classical", "Acoustic", "R&B", "Pop"],
  "valentines-day": ["Romantic Ballad", "R&B", "Jazz", "Acoustic", "Pop"],
  "thank-you": ["Acoustic", "Folk Pop", "Country", "Pop", "Romantic Ballad"],
  congratulations: [
    "Pop",
    "Pop Rock",
    "Electronic dance music (EDM)",
    "Country",
    "Hip Hop",
  ],
  "get-well-soon": [
    "Acoustic",
    "Lullaby",
    "Folk Pop",
    "Lo-Fi Chill",
    "Classical",
  ],
  "in-memoriam": ["Classical", "Acoustic", "Folk Pop", "Jazz", "Lullaby"],
  "just-because": ["Pop", "Acoustic", "Folk Pop", "Lo-Fi Chill", "Indie Rock"],
};

export const vocalGenderOptions = [defaultVocalGender, "Male", "Female"];

export const featuredLanguages: LanguageOption[] = [
  { code: "EN", label: "English" },
  { code: "DE", label: "German" },
  { code: "FR", label: "French" },
  { code: "IT", label: "Italian" },
  { code: "ES", label: "Spanish" },
  { code: "PT", label: "Portuguese" },
  { code: "NL", label: "Dutch" },
];

export const moreLanguages: LanguageOption[] = [
  { code: "PL", label: "Polish" },
  { code: "SV", label: "Swedish" },
  { code: "NO", label: "Norwegian" },
  { code: "DA", label: "Danish" },
  { code: "FI", label: "Finnish" },
  { code: "IS", label: "Icelandic" },
  { code: "CS", label: "Czech" },
  { code: "SK", label: "Slovak" },
  { code: "HU", label: "Hungarian" },
  { code: "RO", label: "Romanian" },
  { code: "BG", label: "Bulgarian" },
  { code: "HR", label: "Croatian" },
  { code: "SR", label: "Serbian" },
  { code: "SL", label: "Slovenian" },
  { code: "MK", label: "Macedonian" },
  { code: "BS", label: "Bosnian" },
  { code: "SQ", label: "Albanian" },
  { code: "EL", label: "Greek" },
  { code: "ET", label: "Estonian" },
  { code: "LV", label: "Latvian" },
  { code: "LT", label: "Lithuanian" },
  { code: "MT", label: "Maltese" },
  { code: "GA", label: "Irish" },
  { code: "CY", label: "Welsh" },
  { code: "EU", label: "Basque" },
  { code: "CA", label: "Catalan" },
  { code: "GL", label: "Galician" },
  { code: "ZH", label: "Chinese" },
  { code: "HI", label: "Hindi" },
  { code: "KO", label: "Korean" },
  { code: "RU", label: "Russian" },
  { code: "AR", label: "Arabic" },
  { code: "TR", label: "Turkish" },
];

export type OccasionOption = {
  value: Occasion;
  icon: ReactNode;
  title: string;
  subtitle: string;
  art: {
    src: string;
    alt: string;
    className?: string;
  };
};

export const occasions: OccasionOption[] = [
  {
    value: "mothers-day",
    icon: <Flower2 className="size-6" />,
    title: "Mother's Day",
    subtitle: "A warm thank-you song for mom.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/mothers-day.webp",
      alt: "Mother and child music gift illustration",
      className: "rotate-3",
    },
  },
  {
    value: "birthday",
    icon: <Cake className="size-6" />,
    title: "Birthday",
    subtitle: "A celebratory song for their day.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/birthday.webp",
      alt: "Birthday song celebration illustration",
      className: "-rotate-2",
    },
  },
  {
    value: "just-because",
    icon: <Sparkles className="size-6" />,
    title: "Just Because",
    subtitle: "A surprise song without needing a reason.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/just-because.webp",
      alt: "Surprise custom song gift illustration",
      className: "rotate-6",
    },
  },
  {
    value: "anniversary",
    icon: <CalendarHeart className="size-6" />,
    title: "Anniversary",
    subtitle: "A romantic keepsake for your story.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/anniversary.webp",
      alt: "Anniversary couple song illustration",
      className: "-rotate-3",
    },
  },
  {
    value: "wedding",
    icon: <Gem className="size-6" />,
    title: "Wedding",
    subtitle: "A heartfelt song for the big day.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/wedding.webp",
      alt: "Wedding song keepsake illustration",
      className: "rotate-2",
    },
  },
  {
    value: "fathers-day",
    icon: <ShieldCheck className="size-6" />,
    title: "Father's Day",
    subtitle: "A gratitude song for dad.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/fathers-day.webp",
      alt: "Father and child music gift illustration",
      className: "-rotate-5",
    },
  },
  {
    value: "valentines-day",
    icon: <Heart className="size-6" />,
    title: "Valentine's Day",
    subtitle: "A love song for your favorite person.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/valentines-day.webp",
      alt: "Valentine love song illustration",
      className: "rotate-4",
    },
  },
  {
    value: "congratulations",
    icon: <Trophy className="size-6" />,
    title: "Congratulations",
    subtitle: "Celebrate a milestone or big win.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/congratulations.webp",
      alt: "Congratulations milestone song illustration",
      className: "-rotate-2",
    },
  },
  {
    value: "get-well-soon",
    icon: <HeartPulse className="size-6" />,
    title: "Get Well Soon",
    subtitle: "A gentle song for comfort and hope.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/get-well-soon.webp",
      alt: "Get well soon comfort song illustration",
      className: "rotate-3",
    },
  },
  {
    value: "thank-you",
    icon: <HandHeart className="size-6" />,
    title: "Thank You",
    subtitle: "Say what ordinary words cannot.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/thank-you.webp",
      alt: "Thank you song gift illustration",
      className: "-rotate-4",
    },
  },
  {
    value: "in-memoriam",
    icon: <Ribbon className="size-6" />,
    title: "In Memoriam",
    subtitle: "A respectful song for remembrance.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/in-memoriam.webp",
      alt: "Memorial song remembrance illustration",
      className: "rotate-2",
    },
  },
  {
    value: "something-else",
    icon: <Plus className="size-6" />,
    title: "Something else",
    subtitle: "Use your own context and details.",
    art: {
      src: "/images/create-song/occasion-cards/v2-webp/something-else.webp",
      alt: "Custom occasion song idea illustration",
      className: "rotate-5",
    },
  },
];

export const customOccasionValue = "something-else";
export const suggestedCustomOccasions = [
  "Retirement",
  "Housewarming",
  "Graduation",
  "New Baby",
  "Friendship",
  "Apology",
  "Long Distance",
  "New Job",
];

export function isCustomOccasion(value: Occasion | null | undefined) {
  return Boolean(
    value &&
      value !== customOccasionValue &&
      !occasions.some((item) => item.value === value),
  );
}

export const storyPlaceholders: Record<string, string> = {
  anniversary:
    "e.g., We met in 2018 at a cozy coffee shop in Seattle. He always calls me 'Little Piggy'. We traveled to Iceland together last year...",
  "mothers-day":
    "e.g., My mom sings while cooking Sunday dinner. She taught me to be brave, always texts me before big days, and still calls me her sunshine...",
  wedding:
    "e.g., Our first dance is for Maya and Theo. They met at a bookstore, got engaged in Lisbon, and love dancing in the kitchen after midnight...",
  birthday:
    "e.g., Jamie and I became friends in college. We survived terrible karaoke nights, a road trip with no AC, and still laugh about the pizza incident...",
};

export const helperTags = [
  {
    label: "Our First Meeting",
    text: "Our first meeting felt unforgettable because ",
  },
  {
    label: "Inside Jokes",
    text: "One inside joke that always makes us laugh is ",
  },
  {
    label: "What I Want to Say",
    text: "What I really want to say in this song is ",
  },
];

export type StoryHelperStep = {
  group: 1 | 2 | 3;
  mode: "choice" | "detail";
  question: string;
  options?: string[];
};

export const storyHelperSteps: StoryHelperStep[] = [
  {
    group: 1,
    mode: "choice",
    question: "What do you admire most about them?",
    options: [
      "Kind and caring",
      "Funny and joyful",
      "Strong and inspiring",
      "Always supportive",
      "Truly unique",
    ],
  },
  {
    group: 1,
    mode: "detail",
    question: "Share one short example.",
  },
  {
    group: 2,
    mode: "choice",
    question: "Which memory with them should we include?",
    options: [
      "A big milestone",
      "A trip together",
      "A quiet everyday moment",
      "A funny moment",
      "A tough day we got through",
    ],
  },
  {
    group: 2,
    mode: "detail",
    question: "What happened, and why did it matter?",
  },
  {
    group: 3,
    mode: "choice",
    question: "What message should they hear today?",
    options: [
      "Thank you",
      "I love you",
      "I am proud of you",
      "You inspire me",
      "I am here for you",
    ],
  },
  {
    group: 3,
    mode: "detail",
    question: "Any final words to include?",
  },
];

export const loadingMessages = [
  "Analyzing your beautiful story...",
  "Weaving memories into poetic lyrics...",
  "Tuning studio-quality instruments...",
];

export const lyricGenerationSteps = [
  "Understanding your story",
  "Writing the verses & chorus",
  "Shaping the title",
];

export const fallbackLyrics: LyricLine[] = [
  { time: 0, line: "I kept the small things you told me" },
  { time: 6, line: "Turned every laugh into a melody" },
  { time: 12, line: "If home is a voice, then yours is mine" },
  { time: 18, line: "Thirty seconds, but a lifetime inside" },
  { time: 24, line: "This is your story learning how to shine" },
];

export const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};
