"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Cake,
  Check,
  ChevronDown,
  Clock3,
  Coffee,
  Disc3,
  Edit3,
  Flame,
  Gift,
  Globe2,
  Guitar,
  Headphones,
  Heart,
  ImageIcon,
  Keyboard,
  Languages,
  Leaf,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Mail,
  Mic2,
  MicOff,
  MoonStar,
  Music2,
  PartyPopper,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Wand2,
  X,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import ChooseButton from "@/components/song/ChooseButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  applyLyricsLineRewrite,
  composeLyricsText,
  createLyricsLineRewriteSuggestions,
  EditableLyricLine,
  LyricsLineRewriteSuggestion,
  parseLyricsText,
} from "@/lib/ai/song-lyrics";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

type Occasion = string;
type WizardStep = 1 | 2 | 3 | 4 | 5;
type SongStage = "loading" | "player";
type LyricsStage = "loading" | "editor";

type LyricLine = {
  time: number;
  line: string;
};

type SongVersion = {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
};

type CaptureLeadResponse = {
  userId: string;
  email: string;
  isNewGuest: boolean;
  songId: string;
  previewAudioUrl: string;
  previewLimitSeconds?: number | null;
  expiresAt?: string;
  lyrics: LyricLine[];
  versions?: SongVersion[];
};

type GenreOption = {
  value: string;
  label: string;
  icon: ReactNode;
  accent: string;
};

type LanguageOption = {
  code: string;
  label: string;
};

const draftStorageKey = "custom-song-wizard-draft-v1";

const stepSlugs: Record<WizardStep, string> = {
  1: "style",
  2: "recipient",
  3: "story",
  4: "lyrics",
  5: "song",
};

const slugToStep = Object.entries(stepSlugs).reduce(
  (acc, [stepValue, slug]) => {
    acc[slug] = Number(stepValue) as WizardStep;
    return acc;
  },
  {} as Record<string, WizardStep>
);

type StoredDraft = {
  email?: string;
  generatedLyrics?: string;
  genre?: string;
  language?: string;
  lyricsGeneratedBy?: "ai";
  lyricsInputKey?: string;
  occasion?: Occasion | null;
  recipientNames?: string[];
  songStage?: SongStage;
  songTitle?: string;
  story?: string;
  vocalGender?: string;
};

const steps: Array<{ id: WizardStep; label: string }> = [
  { id: 1, label: "STYLE" },
  { id: 2, label: "RECIPIENT" },
  { id: 3, label: "STORY" },
  { id: 4, label: "LYRICS" },
  { id: 5, label: "SONG" },
];

const genres: GenreOption[] = [
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
  {
    value: "You Choose For Me",
    label: "You Choose For Me",
    icon: <Sparkles className="size-6" />,
    accent: "text-accent-foreground",
  },
];

const vocalGenderOptions = ["Male", "Female", "Pick for me"];

const featuredLanguages: LanguageOption[] = [
  { code: "EN", label: "English" },
  { code: "DE", label: "German" },
  { code: "FR", label: "French" },
  { code: "IT", label: "Italian" },
  { code: "ES", label: "Spanish" },
  { code: "PT", label: "Portuguese" },
  { code: "NL", label: "Dutch" },
];

const moreLanguages: LanguageOption[] = [
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

const occasions: Array<{
  value: Occasion;
  icon: ReactNode;
  title: string;
  subtitle: string;
}> = [
  {
    value: "mothers-day",
    icon: <Leaf className="size-6" />,
    title: "Mother's Day",
    subtitle: "A warm thank-you song for mom.",
  },
  {
    value: "birthday",
    icon: <Cake className="size-6" />,
    title: "Birthday",
    subtitle: "A celebratory song for their day.",
  },
  {
    value: "just-because",
    icon: <Sparkles className="size-6" />,
    title: "Just Because",
    subtitle: "A surprise song without needing a reason.",
  },
  {
    value: "anniversary",
    icon: <Heart className="size-6" />,
    title: "Anniversary",
    subtitle: "A romantic keepsake for your story.",
  },
  {
    value: "wedding",
    icon: <PartyPopper className="size-6" />,
    title: "Wedding",
    subtitle: "A heartfelt song for the big day.",
  },
  {
    value: "fathers-day",
    icon: <UserRound className="size-6" />,
    title: "Father's Day",
    subtitle: "A gratitude song for dad.",
  },
  {
    value: "valentines-day",
    icon: <Heart className="size-6" />,
    title: "Valentine's Day",
    subtitle: "A love song for your favorite person.",
  },
  {
    value: "congratulations",
    icon: <Gift className="size-6" />,
    title: "Congratulations",
    subtitle: "Celebrate a milestone or big win.",
  },
  {
    value: "get-well-soon",
    icon: <Heart className="size-6" />,
    title: "Get Well Soon",
    subtitle: "A gentle song for comfort and hope.",
  },
  {
    value: "thank-you",
    icon: <Heart className="size-6" />,
    title: "Thank You",
    subtitle: "Say what ordinary words cannot.",
  },
  {
    value: "in-memoriam",
    icon: <Leaf className="size-6" />,
    title: "In Memoriam",
    subtitle: "A respectful song for remembrance.",
  },
  {
    value: "something-else",
    icon: <Plus className="size-6" />,
    title: "Something else",
    subtitle: "Use your own context and details.",
  },
];

const storyPlaceholders: Record<string, string> = {
  anniversary:
    "e.g., We met in 2018 at a cozy coffee shop in Seattle. He always calls me 'Little Piggy'. We traveled to Iceland together last year...",
  "mothers-day":
    "e.g., My mom sings while cooking Sunday dinner. She taught me to be brave, always texts me before big days, and still calls me her sunshine...",
  wedding:
    "e.g., Our first dance is for Maya and Theo. They met at a bookstore, got engaged in Lisbon, and love dancing in the kitchen after midnight...",
  birthday:
    "e.g., Jamie and I became friends in college. We survived terrible karaoke nights, a road trip with no AC, and still laugh about the pizza incident...",
};

const helperTags = [
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

type StoryHelperStep = {
  group: 1 | 2 | 3;
  mode: "choice" | "detail";
  question: string;
  options?: string[];
};

const storyHelperSteps: StoryHelperStep[] = [
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

const loadingMessages = [
  "Analyzing your beautiful story...",
  "Weaving memories into poetic lyrics...",
  "Tuning studio-quality instruments...",
];

const lyricGenerationSteps = [
  "Understanding your story",
  "Writing the verses & chorus",
  "Shaping the title",
];

const fallbackLyrics: LyricLine[] = [
  { time: 0, line: "I kept the small things you told me" },
  { time: 6, line: "Turned every laugh into a melody" },
  { time: 12, line: "If home is a voice, then yours is mine" },
  { time: 18, line: "Thirty seconds, but a lifetime inside" },
  { time: 24, line: "This is your story learning how to shine" },
];

const stepVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

function createLyricsInputKey({
  genre,
  language,
  occasion,
  recipientNames,
  story,
  vocalGender,
}: {
  genre: string;
  language: string;
  occasion: Occasion | null;
  recipientNames: string[];
  story: string;
  vocalGender: string;
}) {
  return JSON.stringify({
    genre,
    language,
    occasion,
    recipientNames: recipientNames.map((name) => name.trim()).filter(Boolean),
    story: story.trim(),
    vocalGender,
  });
}

export function CustomSongWizard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const storyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [genre, setGenre] = useState("Pop");
  const [vocalGender, setVocalGender] = useState("Female");
  const [language, setLanguage] = useState("English");
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [recipientNames, setRecipientNames] = useState<string[]>([""]);
  const [story, setStory] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [selectedLyricLineIds, setSelectedLyricLineIds] = useState<string[]>([]);
  const [lyricRewriteSuggestions, setLyricRewriteSuggestions] = useState<
    LyricsLineRewriteSuggestion[]
  >([]);
  const [lyricRewriteInstruction, setLyricRewriteInstruction] = useState("");
  const [lyricRewriteError, setLyricRewriteError] = useState("");
  const [isRewritingLyricLines, setIsRewritingLyricLines] = useState(false);
  const [lyricsGeneratedBy, setLyricsGeneratedBy] = useState<"ai" | null>(null);
  const [lyricsInputKey, setLyricsInputKey] = useState("");
  const [lyricsRequestInputKey, setLyricsRequestInputKey] = useState("");
  const [lyricsStage, setLyricsStage] = useState<LyricsStage>("loading");
  const [lyricsTaskId, setLyricsTaskId] = useState("");
  const [lyricsError, setLyricsError] = useState("");
  const [lyricLoadingStep, setLyricLoadingStep] = useState(0);
  const [songStage, setSongStage] = useState<SongStage>("loading");
  const [songTaskId, setSongTaskId] = useState("");
  const [songError, setSongError] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadingCopyIndex, setLoadingCopyIndex] = useState(0);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadData, setLeadData] = useState<CaptureLeadResponse | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(60);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("A");
  const [activeVersion, setActiveVersion] = useState("A");
  const [isStoryHelperOpen, setIsStoryHelperOpen] = useState(false);
  const [storyHelperStep, setStoryHelperStep] = useState(0);
  const [storyHelperAnswers, setStoryHelperAnswers] = useState<string[]>(
    Array(storyHelperSteps.length).fill("")
  );
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const selectedOccasion = useMemo(
    () => occasions.find((item) => item.value === occasion),
    [occasion]
  );
  const recipientNameList = useMemo(
    () => recipientNames.map((name) => name.trim()).filter(Boolean),
    [recipientNames]
  );
  const recipientLabel = recipientNameList.join(" and ") || "your";
  const isLoggedIn = Boolean(session?.user);
  const lyrics = leadData?.lyrics?.length ? leadData.lyrics : fallbackLyrics;
  const songVersions = leadData?.versions?.length
    ? leadData.versions
    : leadData?.previewAudioUrl
      ? [
          {
            id: "A",
            title: songTitle || "Your Custom Song",
            audioUrl: leadData.previewAudioUrl,
          },
        ]
      : [];
  const currentVersionIndex = activeVersion === "B" ? 1 : 0;
  const currentVersion = songVersions[currentVersionIndex] || songVersions[0];
  const previewLimitSeconds = leadData?.previewLimitSeconds ?? null;
  const displayDuration =
    previewLimitSeconds ||
    currentVersion?.duration ||
    audioDuration;
  const storyWordCount = story.trim()
    ? story.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const currentLyricsInputKey = createLyricsInputKey({
    genre,
    language,
    occasion,
    recipientNames,
    story,
    vocalGender,
  });
  const editableLyricLines = useMemo(
    () => parseLyricsText(generatedLyrics),
    [generatedLyrics]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepFromUrl = slugToStep[params.get("step") || ""] || 1;
    const queryLyrics = params.get("lyrics") || "";

    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft) as StoredDraft;

        if (draft.genre) setGenre(draft.genre);
        if (draft.vocalGender) setVocalGender(draft.vocalGender);
        if (draft.language) setLanguage(draft.language);
        if (draft.occasion !== undefined) setOccasion(draft.occasion || null);
        if (draft.recipientNames?.length) {
          setRecipientNames(draft.recipientNames.slice(0, 3));
        }
        if (draft.story !== undefined) setStory(draft.story);
        const restoredLyricsInputKey = createLyricsInputKey({
          genre: draft.genre || "Pop",
          language: draft.language || "English",
          occasion: draft.occasion || null,
          recipientNames: draft.recipientNames?.length
            ? draft.recipientNames.slice(0, 3)
            : [""],
          story: draft.story || "",
          vocalGender: draft.vocalGender || "Female",
        });
        const canRestoreLyrics =
          draft.lyricsGeneratedBy === "ai" &&
          draft.lyricsInputKey === restoredLyricsInputKey &&
          Boolean(draft.generatedLyrics?.trim());

        if (canRestoreLyrics) {
          if (draft.songTitle !== undefined) setSongTitle(draft.songTitle);
          setGeneratedLyrics(draft.generatedLyrics || "");
          setLyricsGeneratedBy("ai");
          setLyricsInputKey(restoredLyricsInputKey);
          setLyricsStage("editor");
        }
        if (draft.email !== undefined) setEmail(draft.email);
        if (draft.songStage) setSongStage(draft.songStage);
      }
    } catch (error) {
      console.warn("[CustomSongWizard] Failed to restore draft:", error);
    }

    if (queryLyrics.trim()) {
      const queryRecipients = (params.get("recipients") || "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 3);
      const queryOccasion = params.get("occasion");

      setGenre(params.get("genre") || "Pop");
      setVocalGender(params.get("vocalGender") || "Female");
      setLanguage(params.get("language") || "English");
      setOccasion(queryOccasion || null);
      setRecipientNames(queryRecipients.length ? queryRecipients : [""]);
      setStory(params.get("story") || "");
      setSongTitle(params.get("title") || "Your Custom Song");
      setGeneratedLyrics(queryLyrics);
      setLyricsGeneratedBy("ai");
      setLyricsStage("editor");
      setStep(queryOccasion ? 4 : stepFromUrl);
      setIsHydrated(true);
      return;
    }

    setStep(stepFromUrl);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const url = new URL(window.location.href);
    url.searchParams.set("step", stepSlugs[step]);
    window.history.replaceState({ step }, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [isHydrated, step]);

  useEffect(() => {
    if (!isHydrated) return;

    const draft: StoredDraft = {
      email,
      generatedLyrics,
      genre,
      language,
      lyricsGeneratedBy: lyricsGeneratedBy || undefined,
      lyricsInputKey,
      occasion,
      recipientNames,
      songStage,
      songTitle,
      story,
      vocalGender,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    email,
    generatedLyrics,
    genre,
    isHydrated,
    language,
    lyricsGeneratedBy,
    lyricsInputKey,
    occasion,
    recipientNames,
    songStage,
    songTitle,
    story,
    vocalGender,
  ]);

  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      setStep(slugToStep[params.get("step") || ""] || 1);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!email && session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [email, session?.user?.email]);

  const requestLyricsGeneration = useCallback(async () => {
    if (!occasion || story.trim().length < 10) return;

    setLyricsStage("loading");
    setLyricsError("");
    setLyricsTaskId("");
    setLyricsGeneratedBy(null);
    setLyricsInputKey("");
    setLyricsRequestInputKey(currentLyricsInputKey);
    setSongTitle("");
    setGeneratedLyrics("");
    setLyricLoadingStep(0);

    try {
      const response = await fetch("/api/songs/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          genre,
          language,
          recipientNames: recipientNames.map((name) => name.trim()).filter(Boolean),
          story,
          vocalGender,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to start lyrics generation.");
      }
      if (result.data.status === "succeeded") {
        setSongTitle(result.data.title || "Your Custom Song");
        setGeneratedLyrics(result.data.lyrics || "");
        setLyricsGeneratedBy("ai");
        setLyricsInputKey(currentLyricsInputKey);
        setLyricsRequestInputKey("");
        setLyricsStage("editor");
        return;
      }
      setLyricsTaskId(result.data.taskId);
    } catch (error) {
      setLyricsError(
        error instanceof Error ? error.message : "Unable to start lyrics generation."
      );
      setLyricsRequestInputKey("");
      setLyricsStage("editor");
    }
  }, [
    currentLyricsInputKey,
    genre,
    language,
    occasion,
    recipientNames,
    story,
    vocalGender,
  ]);

  useEffect(() => {
    if (step !== 4) return;
    if (lyricsError) return;
    if (lyricsStage === "loading" && lyricsRequestInputKey === currentLyricsInputKey) {
      return;
    }

    if (
      lyricsGeneratedBy === "ai" &&
      lyricsInputKey === currentLyricsInputKey &&
      songTitle.trim() &&
      generatedLyrics.trim()
    ) {
      setLyricsStage("editor");
      return;
    }

    requestLyricsGeneration();
  }, [
    currentLyricsInputKey,
    generatedLyrics,
    lyricsError,
    lyricsGeneratedBy,
    lyricsInputKey,
    lyricsRequestInputKey,
    lyricsStage,
    requestLyricsGeneration,
    songTitle,
    step,
  ]);

  useEffect(() => {
    if (step !== 4 || lyricsStage !== "loading") return;

    const timer = window.setInterval(() => {
      setLyricLoadingStep((current) =>
        Math.min(lyricGenerationSteps.length - 1, current + 1)
      );
    }, 2500);

    return () => window.clearInterval(timer);
  }, [lyricsStage, step]);

  useEffect(() => {
    if (!lyricsTaskId || lyricsStage !== "loading") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/songs/lyrics/status?taskId=${encodeURIComponent(lyricsTaskId)}`
        );
        const result = await response.json();
        if (cancelled) return;

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Unable to check lyrics status.");
        }

        if (result.data.status === "succeeded") {
          setSongTitle(result.data.title || "Your Custom Song");
          setGeneratedLyrics(result.data.lyrics || "");
          setLyricsGeneratedBy("ai");
          setLyricsInputKey(currentLyricsInputKey);
          setLyricsRequestInputKey("");
          setLyricsStage("editor");
          setLyricsTaskId("");
          return;
        }

        if (result.data.status === "failed") {
          throw new Error(result.data.error || "Lyrics generation failed.");
        }
      } catch (error) {
        if (cancelled) return;
        setLyricsError(
          error instanceof Error ? error.message : "Unable to generate lyrics."
        );
        setLyricsRequestInputKey("");
        setLyricsStage("editor");
      }
    };

    poll();
    const timer = window.setInterval(poll, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [lyricsStage, lyricsTaskId]);

  useEffect(() => {
    const lyricLineIds = new Set(
      editableLyricLines
        .filter((line) => line.kind === "lyric")
        .map((line) => line.id)
    );
    setSelectedLyricLineIds((current) =>
      current.filter((lineId) => lyricLineIds.has(lineId))
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((suggestion) => lyricLineIds.has(suggestion.lineId))
    );
  }, [editableLyricLines]);

  const requestSongGeneration = useCallback(async () => {
    if (!occasion || !songTitle.trim() || !generatedLyrics.trim()) return;
    if (!session?.user && !email.trim()) {
      setIsLeadModalOpen(true);
      return;
    }

    setIsLeadModalOpen(false);
    setSongTaskId("");
    setSongError("");
    setLeadData(null);
    setPreviewTime(0);
    setIsPlaying(false);
    setProgress(8);

    try {
      const response = await fetch("/api/songs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user ? undefined : email.trim(),
          occasion,
          genre,
          language,
          recipientNames: recipientNames.map((name) => name.trim()).filter(Boolean),
          story,
          title: songTitle,
          lyrics: generatedLyrics,
          vocalGender,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to start song generation.");
      }
      setSongTaskId(result.data.songId);
      setProgress(18);
    } catch (error) {
      setSongError(
        error instanceof Error ? error.message : "Unable to start song generation."
      );
    }
  }, [
    email,
    generatedLyrics,
    genre,
    language,
    occasion,
    recipientNames,
    session?.user,
    songTitle,
    story,
    vocalGender,
  ]);

  useEffect(() => {
    if (step !== 5 || songStage !== "loading") return;
    if (songTaskId || songError) return;
    requestSongGeneration();
  }, [requestSongGeneration, songError, songStage, songTaskId, step]);

  useEffect(() => {
    if (!songTaskId || songStage !== "loading") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/songs/generate/status?songId=${encodeURIComponent(songTaskId)}`
        );
        const result = await response.json();
        if (cancelled) return;

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Unable to check song status.");
        }

        setProgress((current) => Math.min(92, current + 12));

        if (result.data.status === "succeeded") {
          const versions = result.data.versions || [];
          if (result.data.sampleUrl) {
            router.push(result.data.sampleUrl);
            return;
          }

          setLeadData({
            userId: session?.user?.id || "guest",
            email: session?.user?.email || email,
            isNewGuest: !session?.user,
            songId: result.data.songId,
            previewAudioUrl: versions[0]?.audioUrl || "",
            previewLimitSeconds: result.data.previewLimitSeconds,
            expiresAt: result.data.expiresAt,
            lyrics: fallbackLyrics,
            versions,
          });
          setProgress(100);
          setSongStage("player");
          setPreviewTime(0);
          setIsPlaying(false);
          setActiveVersion("A");
          toast.success("Your song preview is ready.");
          return;
        }

        if (result.data.status === "failed") {
          throw new Error(result.data.error || "Song generation failed.");
        }
      } catch (error) {
        if (cancelled) return;
        setSongError(error instanceof Error ? error.message : "Unable to generate song.");
      }
    };

    poll();
    const timer = window.setInterval(poll, 6000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [email, router, session?.user, songStage, songTaskId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const limit = leadData?.previewLimitSeconds;
      if (limit && audio.currentTime >= limit) {
        audio.pause();
        audio.currentTime = limit;
        setIsPlaying(false);
        toast.info("This preview is limited to 1 minute.");
      }
      setPreviewTime(Number(audio.currentTime.toFixed(2)));
    };
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [leadData?.previewLimitSeconds, leadData?.previewAudioUrl]);

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.stop?.();
    };
  }, []);

  const activeLyricIndex = lyrics.reduce((activeIndex, lyric, index) => {
    return previewTime >= lyric.time ? index : activeIndex;
  }, 0);

  const canContinue =
    (step === 1 && Boolean(genre)) ||
    (step === 2 && Boolean(occasion) && recipientNames.some((name) => name.trim())) ||
    (step === 3 && story.trim().length >= 10) ||
    (step === 4 && songTitle.trim().length > 0 && generatedLyrics.trim().length > 0);

  function appendHelperText(text: string) {
    setStory((current) => {
      const separator = current.trim().length ? "\n\n" : "";
      return `${current}${separator}${text}`;
    });
  }

  function insertStoryText(text: string) {
    const textarea = storyTextareaRef.current;

    setStory((current) => {
      if (!textarea) {
        const separator = current.trim().length ? " " : "";
        return `${current}${separator}${text}`;
      }

      const start = textarea.selectionStart ?? current.length;
      const end = textarea.selectionEnd ?? current.length;
      const before = current.slice(0, start);
      const after = current.slice(end);
      const leadingSpace = before && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "";
      const trailingSpace = after && !after.startsWith(" ") && !after.startsWith("\n") ? " " : "";
      const nextStory = `${before}${leadingSpace}${text}${trailingSpace}${after}`;

      window.requestAnimationFrame(() => {
        const nextCursor = start + leadingSpace.length + text.length;
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      });

      return nextStory;
    });
  }

  function startStoryHelper() {
    setStoryHelperStep(0);
    setStoryHelperAnswers(Array(storyHelperSteps.length).fill(""));
    setIsCreatingStory(false);
    setIsStoryHelperOpen(true);
  }

  function closeStoryHelper() {
    setIsStoryHelperOpen(false);
    setIsCreatingStory(false);
  }

  function updateStoryHelperAnswer(value: string) {
    setStoryHelperAnswers((current) =>
      current.map((answer, index) =>
        index === storyHelperStep ? value : answer
      )
    );
  }

  function composeStoryFromHelper(answers: string[]) {
    const clean = answers.map((answer) => answer.trim()).filter(Boolean);
    const firstLine = [answers[0], answers[1]]
      .map((answer) => answer.trim())
      .filter(Boolean)
      .join(". ");
    const secondLine = [answers[2], answers[3]]
      .map((answer) => answer.trim())
      .filter(Boolean)
      .join(". ");
    const thirdLine = [answers[4], answers[5]]
      .map((answer) => answer.trim())
      .filter(Boolean)
      .join(". ");

    if (!clean.length) return "";

    return [firstLine, secondLine, thirdLine]
      .filter(Boolean)
      .map((line) => (/[.!?]$/.test(line) ? line : `${line}.`))
      .join("\n\n");
  }

  function goToNextStoryHelperStep() {
    if (storyHelperStep < storyHelperSteps.length - 1) {
      setStoryHelperStep((current) => current + 1);
      return;
    }

    setIsCreatingStory(true);
    window.setTimeout(() => {
      const composedStory = composeStoryFromHelper(storyHelperAnswers);
      if (composedStory) setStory(composedStory);
      setIsCreatingStory(false);
      setIsStoryHelperOpen(false);
      window.requestAnimationFrame(() => storyTextareaRef.current?.focus());
    }, 850);
  }

  function goToPreviousStoryHelperStep() {
    if (storyHelperStep === 0) return;
    setStoryHelperStep((current) => current - 1);
  }

  function toggleRecording() {
    if (isRecording) {
      speechRecognitionRef.current?.stop?.();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info("Speech recognition is not available in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang =
      language === "Chinese"
        ? "zh-CN"
        : language === "Spanish"
          ? "es-ES"
          : language === "French"
            ? "fr-FR"
            : language === "German"
              ? "de-DE"
              : "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript)
        .filter(Boolean)
        .join(" ")
        .trim();

      if (transcript) insertStoryText(transcript);
    };
    recognition.onerror = () => {
      toast.error("Recording stopped before we could capture speech.");
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    speechRecognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function updateRecipientName(index: number, value: string) {
    setRecipientNames((current) =>
      current.map((name, itemIndex) => (itemIndex === index ? value : name))
    );
  }

  function addRecipientName() {
    setRecipientNames((current) =>
      current.length >= 3 ? current : [...current, ""]
    );
  }

  function removeRecipientName(index: number) {
    setRecipientNames((current) => {
      if (current.length === 1) return [""];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function rewriteLyrics() {
    setSongTitle("");
    setGeneratedLyrics("");
    setSelectedLyricLineIds([]);
    setLyricRewriteSuggestions([]);
    setLyricRewriteInstruction("");
    setLyricRewriteError("");
    requestLyricsGeneration();
  }

  function updateLyricLine(lineId: string, text: string) {
    setGeneratedLyrics((current) =>
      composeLyricsText(
        parseLyricsText(current).map((line) =>
          line.id === lineId ? { ...line, text } : line
        )
      )
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((suggestion) => suggestion.lineId !== lineId)
    );
    setLyricRewriteError("");
  }

  function toggleLyricLineSelection(lineId: string, selected: boolean) {
    setSelectedLyricLineIds((current) =>
      selected
        ? Array.from(new Set([...current, lineId]))
        : current.filter((id) => id !== lineId)
    );
    setLyricRewriteError("");
  }

  async function rewriteSelectedLyricLines() {
    const selectedLines = editableLyricLines.filter(
      (line) => selectedLyricLineIds.includes(line.id) && line.kind === "lyric"
    );

    if (!selectedLines.length) {
      setLyricRewriteError("Select at least one lyric line to rewrite.");
      return;
    }

    setIsRewritingLyricLines(true);
    setLyricRewriteError("");

    try {
      const response = await fetch("/api/songs/lyrics/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          genre,
          language,
          recipientNames: recipientNameList,
          fullLyrics: generatedLyrics,
          selectedLines: selectedLines.map((line) => line.text),
          instruction: lyricRewriteInstruction,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to rewrite selected lines.");
      }

      setLyricRewriteSuggestions(
        createLyricsLineRewriteSuggestions(
          editableLyricLines,
          selectedLines.map((line) => line.id),
          result.data.lines || []
        )
      );
      setSelectedLyricLineIds([]);
      toast.success("Rewrite suggestions are ready.");
    } catch (error) {
      setLyricRewriteError(
        error instanceof Error ? error.message : "Unable to rewrite selected lines."
      );
    } finally {
      setIsRewritingLyricLines(false);
    }
  }

  function acceptLyricRewriteSuggestion(lineId: string) {
    const suggestion = lyricRewriteSuggestions.find((item) => item.lineId === lineId);
    if (!suggestion) return;

    setGeneratedLyrics((current) =>
      composeLyricsText(
        applyLyricsLineRewrite(parseLyricsText(current), [lineId], [
          suggestion.rewrittenText,
        ])
      )
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((item) => item.lineId !== lineId)
    );
  }

  function keepOriginalLyricLine(lineId: string) {
    setLyricRewriteSuggestions((current) =>
      current.filter((item) => item.lineId !== lineId)
    );
  }

  function setWizardStep(nextStep: WizardStep, mode: "push" | "replace" = "push") {
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepSlugs[nextStep]);

    if (mode === "replace") {
      window.history.replaceState({ step: nextStep }, "", `${url.pathname}?${url.searchParams.toString()}`);
    } else {
      window.history.pushState({ step: nextStep }, "", `${url.pathname}?${url.searchParams.toString()}`);
    }

    setStep(nextStep);
  }

  function goBack() {
    if (step === 1) return;
    if (step === 5) {
      setSongStage("loading");
      setLeadData(null);
      setSongTaskId("");
      setSongError("");
      setPreviewTime(0);
      setIsPlaying(false);
      audioRef.current?.pause();
    }
    setWizardStep(Math.max(1, step - 1) as WizardStep);
  }

  function goForward() {
    if (!canContinue) return;
    if (step === 4) {
      if (!isLoggedIn && !email.trim()) {
        setEmailError("");
        setIsLeadModalOpen(true);
        return;
      }
      setSongStage("loading");
      setSongTaskId("");
      setSongError("");
      setWizardStep(5);
      return;
    }
    setWizardStep(Math.min(5, step + 1) as WizardStep);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Please enter a valid email to unlock your preview.");
      return;
    }

    if (!occasion || !genre || story.trim().length < 10) {
      setEmailError("Please complete your song details before capturing a lead.");
      return;
    }

    setIsSubmittingLead(true);
    setLeadData(null);
    setSongTaskId("");
    setSongError("");
    setIsLeadModalOpen(false);
    setSongStage("loading");
    setWizardStep(5);
    toast.success("Your email is saved.");
    setIsSubmittingLead(false);
  }

  async function unlockFullSong() {
    const stripePriceId = process.env.NEXT_PUBLIC_SONG_STRIPE_PRICE_ID;

    if (!stripePriceId) {
      toast.info("Song checkout is ready for wiring.", {
        description:
          "Set NEXT_PUBLIC_SONG_STRIPE_PRICE_ID to enable the Stripe redirect.",
      });
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/payment/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "stripe",
          stripePriceId,
          songId: leadData?.songId,
          leadEmail: leadData?.email || email.trim(),
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        toast.info("Guest checkout needs the next backend step.", {
          description:
            "The current checkout route requires a signed-in session; your preview and email are captured.",
        });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to start checkout.");
      }

      if (result.data?.url) {
        router.push(result.data.url);
        return;
      }

      throw new Error("Checkout URL was not returned.");
    } catch (error) {
      toast.error("Checkout could not be started.", {
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  function toggleSongPlayback(version: string, audioUrl: string) {
    if (!audioUrl) {
      toast.error("This song version is not ready yet.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (activeVersion === version && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const limit = leadData?.previewLimitSeconds;
    setActiveVersion(version);

    if (audio.getAttribute("src") !== audioUrl) {
      audio.src = audioUrl;
      audio.currentTime = 0;
      setPreviewTime(0);
    } else if (limit && audio.currentTime >= limit) {
      audio.currentTime = 0;
      setPreviewTime(0);
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsPlaying(false);
        toast.error("Unable to play this song preview.");
      });
  }

  function chooseSongVersion(version: string) {
    setSelectedVersion(version);
    setIsPaywallOpen(true);
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-muted pb-20 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-accent/20" />

      <div className="relative mx-auto w-full max-w-[1040px] px-4 py-5 sm:px-6">
        {!(step === 5 && songStage === "player") && (
          <StepProgress currentStep={step} />
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepFrame key="style">
              <StepHeading
                title="Let's pick your music style"
                description="Choose the sound, the voice, and the language. You can let us pick for you any time."
              />

              <div className="mx-auto mt-8 max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-bold">
                    <Music2 className="size-5 text-accent-foreground" />
                    Genre
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Pick one</p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  {genres.map((item) => {
                    const selected = genre === item.value;
                    const isAutoPick = item.value === "You Choose For Me";

                    return (
                      <button
                        key={item.value}
                        className={cn(
                          "relative flex min-h-28 flex-col items-center justify-center rounded-2xl border bg-card p-3.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                          selected
                            ? "border-primary/20 bg-primary/10"
                            : isAutoPick
                              ? "border-dashed border-border bg-card"
                              : "border-border"
                        )}
                        type="button"
                        onClick={() => setGenre(item.value)}
                      >
                        {selected && (
                          <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        )}
                        <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
                          <span className={item.accent}>{item.icon}</span>
                        </span>
                        <span className="text-sm font-bold leading-snug">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-9">
                  <div className="mb-4 flex items-center gap-2 text-base font-bold">
                    <Mic2 className="size-5 text-accent-foreground" />
                    Vocal gender
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {vocalGenderOptions.map((option) => {
                      const selected = vocalGender === option;
                      const auto = option === "Pick for me";

                      return (
                        <button
                          key={option}
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5",
                            selected
                              ? "bg-primary/10 text-primary"
                              : auto
                                ? "border-2 border-dashed border-border bg-transparent text-foreground"
                                : "bg-card text-foreground"
                          )}
                          type="button"
                          onClick={() => setVocalGender(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-9">
                  <div className="mb-4 flex items-center gap-2 text-base font-bold">
                    <Globe2 className="size-5 text-accent-foreground" />
                    Language
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {featuredLanguages.map((item) => (
                      <LanguageChip
                        key={item.code}
                        language={item}
                        selected={language === item.label}
                        onClick={() => setLanguage(item.label)}
                      />
                    ))}
                  </div>
                  <button
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
                    type="button"
                    onClick={() => setShowAllLanguages((current) => !current)}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        !showAllLanguages && "-rotate-90"
                      )}
                    />
                    {moreLanguages.length} more languages
                  </button>
                  {showAllLanguages && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {moreLanguages.map((item) => (
                        <LanguageChip
                          key={item.code}
                          language={item}
                          selected={language === item.label}
                          showCode
                          onClick={() => setLanguage(item.label)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame key="recipient">
              <StepHeading
                title="Who's this song for?"
                description="Tell us the names and the occasion so we can make it personal."
              />
              <div className="mx-auto mt-8 max-w-5xl space-y-8">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <UserRound className="size-5 text-primary" />
                      Who's this song for?
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Up to 3 names
                    </p>
                  </div>
                  <div className="space-y-3">
                    {recipientNames.map((name, index) => (
                      <div key={index} className="flex gap-3">
                        <Input
                          className="h-12 rounded-xl border-border bg-card px-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20"
                          placeholder={index === 0 ? "Recipient name" : "Another name"}
                          value={name}
                          onChange={(event) =>
                            updateRecipientName(index, event.target.value)
                          }
                        />
                        <Button
                          aria-label="Remove name"
                          className="h-12 w-12 shrink-0 rounded-xl bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
                          disabled={recipientNames.length === 1 && !name.trim()}
                          type="button"
                          variant="ghost"
                          onClick={() => removeRecipientName(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {recipientNames.length < 3 && (
                    <button
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      type="button"
                      onClick={addRecipientName}
                    >
                      <Plus className="size-4 text-primary" />
                      Add another name
                    </button>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    Adding more than one name? The song will mention each of them.
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <PartyPopper className="size-5 text-primary" />
                      Occasion
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Pick one</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {occasions.map((item) => {
                      const selected = occasion === item.value;

                      return (
                        <button
                          key={item.value}
                          className={cn(
                            "relative flex min-h-28 flex-col items-center justify-center rounded-2xl border bg-card p-3.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                            selected
                              ? "border-primary/20 bg-primary/10"
                              : "border-border"
                          )}
                          type="button"
                          onClick={() => setOccasion(item.value)}
                        >
                          {selected && (
                            <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-4" />
                            </span>
                          )}
                          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-primary">
                            {item.icon}
                          </span>
                          <span className="text-sm font-bold leading-snug">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame key="story">
              <div className="mx-auto mt-16 max-w-5xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-lg font-black text-foreground">
                    <Edit3 className="size-5 text-primary" />
                    Your story
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    80-600 words works best
                  </span>
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Button
                    className="rounded-full bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-primary/10 hover:text-primary"
                    type="button"
                    variant="ghost"
                    onClick={startStoryHelper}
                  >
                    <Wand2 className="size-5 text-primary" />
                    Help me write
                  </Button>
                  <Button
                    className={cn(
                      "rounded-full px-4 text-sm font-bold shadow-sm",
                      isRecording
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "bg-card text-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                    type="button"
                    variant="ghost"
                    onClick={toggleRecording}
                  >
                    {isRecording ? (
                      <MicOff className="size-5 text-primary" />
                    ) : (
                      <Mic2 className="size-5 text-primary" />
                    )}
                    {isRecording ? "Stop recording" : "Speak"}
                  </Button>
                  {isRecording && (
                    <span className="text-sm font-semibold text-primary/70">
                      Listening...
                    </span>
                  )}
                </div>
                <Textarea
                  ref={storyTextareaRef}
                  className="min-h-[230px] resize-y rounded-2xl border-border bg-card p-5 text-base leading-8 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  placeholder={
                    occasion
                      ? storyPlaceholders[occasion]
                      : "e.g., Tell us about the person, the moment, and the details that should become lyrics..."
                  }
                  value={story}
                  onChange={(event) => setStory(event.target.value)}
                />
                <div className="-mt-9 mr-4 flex justify-end text-sm text-muted-foreground">
                  {storyWordCount} words
                </div>
                <div className="mt-8 flex gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-muted-foreground">
                  <Lightbulb className="mt-1 size-5 shrink-0 text-primary" />
                  <p className="text-base leading-7">
                    <span className="font-black text-foreground">
                      Little details matter.
                    </span>{" "}
                    Mention their nickname, a shared memory, their quirks, or
                    something they're proud of. Our lyrics feel most personal
                    when they include things only you two would know.
                  </p>
                </div>
              </div>
            </StepFrame>
          )}

          {step === 4 && (
            <StepFrame key={`lyrics-${lyricsStage}`}>
              {lyricsStage === "loading" ? (
                <LyricsGenerationView
                  activeStep={lyricLoadingStep}
                  names={recipientNames}
                />
              ) : (
                <div className="mx-auto mt-14 max-w-2xl space-y-4">
                  {lyricsError && (
                    <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                      <p className="font-bold text-foreground">Lyrics generation failed</p>
                      <p className="mt-1 leading-6">{lyricsError}</p>
                      <Button
                        className="mt-3 h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                        type="button"
                        onClick={rewriteLyrics}
                      >
                        <RefreshCw className="size-4" />
                        Try again
                      </Button>
                    </div>
                  )}
                  <EditableBlock
                    actionText="You can edit"
                    icon={<span className="text-primary">Aa</span>}
                    label="Song Title"
                  >
                    <Input
                      className="h-auto rounded-xl border-0 bg-muted px-3.5 py-3 text-base font-bold text-foreground shadow-none focus-visible:ring-primary/25 md:text-xl"
                      value={songTitle}
                      onChange={(event) => setSongTitle(event.target.value)}
                    />
                  </EditableBlock>

                  <EditableBlock
                    actionText="Write a new version"
                    icon={<Edit3 className="size-4 text-primary" />}
                    label="Lyrics"
                    onAction={rewriteLyrics}
                  >
                    <LyricsLineEditor
                      error={lyricRewriteError}
                      instruction={lyricRewriteInstruction}
                      isRewriting={isRewritingLyricLines}
                      lines={editableLyricLines}
                      selectedLineIds={selectedLyricLineIds}
                      suggestions={lyricRewriteSuggestions}
                      onAcceptSuggestion={acceptLyricRewriteSuggestion}
                      onInstructionChange={setLyricRewriteInstruction}
                      onKeepOriginal={keepOriginalLyricLine}
                      onLineChange={updateLyricLine}
                      onRewriteSelected={rewriteSelectedLyricLines}
                      onSelectionChange={toggleLyricLineSelection}
                    />
                  </EditableBlock>
                </div>
              )}
            </StepFrame>
          )}

          {step === 5 && songStage === "loading" && (
            <StepFrame key="song-generating">
              {songError ? (
                <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <RefreshCw className="size-5" />
                  </div>
                  <h2 className="text-xl font-black text-foreground">
                    Song generation needs another try
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {songError}
                  </p>
                  <Button
                    className="mt-5 h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                    type="button"
                    onClick={() => {
                      setSongError("");
                      setSongTaskId("");
                      requestSongGeneration();
                    }}
                  >
                    <RefreshCw className="size-4" />
                    Try again
                  </Button>
                </div>
              ) : (
                <SongGenerationPage
                  note={personalNote}
                  onNoteChange={setPersonalNote}
                  progress={progress}
                  recipientLabel={recipientLabel}
                />
              )}
            </StepFrame>
          )}

          {step === 5 && songStage === "player" && (
            <StepFrame key="player">
              <div className="mx-auto max-w-4xl pt-4">
                <audio ref={audioRef} preload="metadata" src={currentVersion?.audioUrl} />
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-accent-foreground">
                    <ShieldCheck className="size-4" />
                    Ready · Only you can see this preview
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-accent-foreground">
                    <Clock3 className="size-4" />
                    {leadData?.expiresAt
                      ? `Preview expires ${new Date(leadData.expiresAt).toLocaleDateString()}`
                      : "Preview expires in 3 days"}
                  </span>
                  {previewLimitSeconds && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                      <LockKeyhole className="size-4" />
                      1 minute preview
                    </span>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[210px_1fr] lg:items-center">
                  <div className="mx-auto size-48 overflow-hidden rounded-full bg-gradient-to-br from-accent via-primary/20 to-foreground shadow-2xl shadow-primary/20">
                    <div className="relative h-full w-full">
                      <div className="absolute left-10 top-14 h-20 w-8 rounded-full bg-foreground/55" />
                      <div className="absolute left-8 top-9 size-10 rounded-full bg-foreground/60" />
                      <div className="absolute right-14 top-16 h-24 w-9 rounded-full bg-foreground/45" />
                      <div className="absolute right-14 top-10 size-11 rounded-full bg-foreground/50" />
                      <div className="absolute bottom-8 left-1/2 h-24 w-12 -translate-x-1/2 rounded-full bg-foreground/70" />
                      <div className="absolute bottom-28 left-1/2 size-11 -translate-x-1/2 rounded-full bg-foreground/75" />
                      <div className="absolute bottom-6 left-4 right-4 h-10 rounded-[50%] border border-border" />
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 font-[cursive] text-xl text-accent-foreground">
                      ta-da!
                    </p>
                    <h1 className="max-w-2xl text-xl font-black leading-tight text-foreground md:text-4xl">
                      {songTitle || "Your Custom Song"}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <InfoPill icon={<Heart className="size-4" />} label={selectedOccasion?.title || "For someone special"} />
                      <InfoPill icon={<Cake className="size-4" />} label={selectedOccasion?.title.split("/")[0].trim() || "Birthday"} />
                      <InfoPill icon={<Gift className="size-4" />} label={genre} />
                      <InfoPill icon={<Mic2 className="size-4" />} label={vocalGender} />
                      <InfoPill icon={<Languages className="size-4" />} label={language} />
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-primary">
                    <Heart className="size-4" />
                    Message for {selectedOccasion?.title.split("/")[0].trim() || "recipient"}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-card-foreground">
                    {story.split(/[.!?\n]/)[0]?.trim() ||
                      "A personal song made from your story and memories."}
                  </p>
                </div>

                <div className="mt-9 text-center">
                  <p className="font-[cursive] text-xl text-accent-foreground">
                    here they are...
                  </p>
                  <h2 className="text-xl font-black text-foreground md:text-2xl">
                    Two takes. Pick the one that feels right.
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Same lyrics, two different recordings. Play both previews
                    below and choose the one that fits the moment.
                  </p>
                </div>

                <div className="mx-auto mt-6 grid max-w-3xl gap-4 md:grid-cols-2">
                  {["A", "B"].map((version, index) => {
                    const songVersion = songVersions[index];
                    const isActiveVersion = activeVersion === version;
                    const isThisPlaying = isActiveVersion && isPlaying;

                    return (
                    <div
                      key={version}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-primary-foreground",
                            index === 0 ? "bg-foreground" : "bg-primary"
                          )}
                        >
                          {version}
                        </span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                            Version {version}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {songVersion?.title || songTitle || "Your Custom Song"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                        <button
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full text-primary-foreground transition",
                            index === 0
                              ? "bg-foreground hover:bg-foreground/90"
                              : "bg-primary hover:bg-primary/90"
                          )}
                          type="button"
                          onClick={() => toggleSongPlayback(version, songVersion?.audioUrl || "")}
                          aria-label={`Play version ${version}`}
                        >
                          {isThisPlaying ? (
                            <Pause className="size-4 fill-current" />
                          ) : (
                            <Play className="ml-0.5 size-4 fill-current" />
                          )}
                        </button>
                        <div className="flex flex-1 items-center gap-1 overflow-hidden">
                          {Array.from({ length: 28 }).map((_, barIndex) => (
                            <span
                              key={barIndex}
                              className="w-full rounded-full bg-border"
                              style={{
                                height: `${8 + ((barIndex * 11 + index * 5) % 24)}px`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {isActiveVersion ? previewTime.toFixed(0) : "0"}s / {Math.ceil(displayDuration)}s
                        </span>
                      </div>

                      <div className="mt-3 border-t border-border pt-3">
                        <ChooseButton
                          className={cn(
                            "h-10 w-full rounded-full text-xs font-black text-primary-foreground",
                            index === 0
                              ? "bg-foreground hover:bg-foreground/90"
                              : "bg-primary hover:bg-primary/90"
                          )}
                          onChoose={() => chooseSongVersion(version)}
                        >
                          <Gift className="size-4" />
                          Choose this one
                        </ChooseButton>
                      </div>
                    </div>
                    );
                  })}
                </div>

                <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border-2 border-ring bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary-foreground">
                        <Edit3 className="size-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                          Written for {selectedOccasion?.title.split("/")[0].trim() || "you"}
                        </p>
                        <h3 className="text-lg font-black text-foreground">
                          The lyrics
                        </h3>
                      </div>
                    </div>
                    <button
                      className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      type="button"
                      aria-label="Collapse lyrics"
                    >
                      <ChevronDown className="size-4 rotate-180" />
                    </button>
                  </div>
                  <div className="max-h-[330px] overflow-y-auto p-5 text-sm leading-7 text-foreground">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedLyrics}
                    </pre>
                  </div>
                </div>

                <button
                  className="mx-auto mt-6 flex w-full max-w-3xl items-center justify-between rounded-2xl border border-dashed border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                  type="button"
                  onClick={() => {
                    setSongStage("loading");
                    setLeadData(null);
                    setWizardStep(1);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <RefreshCw className="size-4" />
                    </span>
                    <div>
                      <p className="font-[cursive] text-base text-accent-foreground">
                        not quite right?
                      </p>
                      <p className="text-base font-black text-foreground">
                        Change your inputs & recreate
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tweak the genre, occasion, story or anything else and
                        get a fresh pair of versions.
                      </p>
                    </div>
                  </span>
                  <ChevronDown className="size-5 text-muted-foreground" />
                </button>
              </div>
            </StepFrame>
          )}
        </AnimatePresence>
      </div>

      {step < 5 && !(step === 4 && lyricsStage === "loading") && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-4 shadow-xl backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-5xl gap-3">
            <Button
              className="h-12 w-32 rounded-full bg-muted text-sm font-bold text-muted-foreground hover:bg-muted disabled:text-muted-foreground"
              disabled={step === 1}
              type="button"
              variant="ghost"
              onClick={goBack}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              className="h-12 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 disabled:bg-primary/30"
              disabled={!canContinue}
              type="button"
              onClick={goForward}
            >
              {step === 4 ? "Create my song" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes song-wave {
          0%,
          100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>

      <AnimatePresence>
        {isStoryHelperOpen && (
          <StoryHelperModal
            answer={storyHelperAnswers[storyHelperStep] || ""}
            isCreating={isCreatingStory}
            onAnswerChange={updateStoryHelperAnswer}
            onBack={goToPreviousStoryHelperStep}
            onClose={closeStoryHelper}
            onNext={goToNextStoryHelperStep}
            step={storyHelperStep}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLeadModalOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-4 py-8 backdrop-blur-xl"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md rounded-[2rem] border border-border bg-background/90 p-6 text-foreground shadow-2xl shadow-foreground/20 backdrop-blur-2xl sm:p-8"
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                🎉
              </div>
              <h2 className="text-2xl font-bold">Where should we send your song?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This generated song will be linked to the email below. We will
                send the finished music to this inbox when recording is done.
              </p>

              <form className="mt-6 space-y-3" onSubmit={submitLead}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-full border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-primary">{emailError}</p>
                )}
                <Button
                  className="h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmittingLead}
                  type="submit"
                >
                  {isSubmittingLead ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Music2 className="size-4" />
                  )}
                  Continue
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No credit card required · Takes 2 mins
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaywallOpen && (
          <PaywallModal
            onClose={() => setIsPaywallOpen(false)}
            onContinue={() => router.push("/pricing")}
            recipientLabel={recipientLabel}
            songTitle={songTitle || "Your Custom Song"}
            version={selectedVersion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function PaywallModal({
  onClose,
  onContinue,
  recipientLabel,
  songTitle,
  version,
}: {
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
            className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
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
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Not yet
          </Button>
          <Button
            className="h-10 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
            type="button"
            onClick={onContinue}
          >
            <LockKeyhole className="size-4" />
            Continue to checkout
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SongGenerationPage({
  note,
  onNoteChange,
  progress,
  recipientLabel,
}: {
  note: string;
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
          <div className="mx-auto flex aspect-square w-full max-w-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground">
            <ImageIcon className="size-9" />
            <p className="mt-4 text-sm font-medium">Pick a cover below</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-full bg-foreground text-sm font-bold text-primary-foreground hover:bg-foreground/90"
              type="button"
            >
              <Wand2 className="size-4" />
              Generate with AI
            </Button>
            <Button
              className="h-11 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground"
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

function LyricsGenerationView({
  activeStep,
  names,
}: {
  activeStep: number;
  names: string[];
}) {
  const recipientLabel =
    names.map((name) => name.trim()).filter(Boolean).join(" and ") ||
    "your";

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
                active || complete ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  active
                    ? "bg-primary text-primary-foreground"
                    : complete
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
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

function StoryHelperModal({
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
              <h2 className="text-xl font-black leading-tight">
                Story Helper
              </h2>
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
              <h3 className="text-xl font-black">Creating your story...</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                This will just take a moment
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
                              : "text-foreground hover:bg-muted"
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
                        onChange={(event) =>
                          onAnswerChange(event.target.value)
                        }
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

function StepProgress({ currentStep }: { currentStep: WizardStep }) {
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
                      : "border-border bg-card text-muted-foreground"
                )}
              >
                {complete ? <Check className="size-4" /> : item.id}
              </div>
              <div
                className={cn(
                  "text-xs font-bold tracking-[0.12em]",
                  active ? "text-foreground" : "text-muted-foreground"
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

function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-16 max-w-3xl text-center">
      <h1 className="text-4xl font-black leading-tight tracking-normal text-foreground md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 text-base leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}

function LyricsLineEditor({
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
    suggestions.map((suggestion) => [suggestion.lineId, suggestion])
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
                    selected || suggestion ? "bg-rose-50/90 dark:bg-rose-950/20" : "bg-transparent"
                  )}
                >
                  <div className="grid grid-cols-[1.35rem_1fr] items-center gap-1.5">
                    <Checkbox
                      aria-label="Select lyric line"
                      checked={selected}
                      className={cn(
                        "size-3.5 justify-self-center transition-opacity",
                        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
                      onChange={(event) => onLineChange(line.id, event.target.value)}
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

function EditableBlock({
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

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground shadow-sm">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

function LanguageChip({
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
        "inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5",
        selected ? "bg-primary/10 text-primary" : "bg-card text-foreground"
      )}
      type="button"
      onClick={onClick}
    >
      {showCode && (
        <span className="font-black uppercase tracking-[0.08em] text-muted-foreground">
          {language.code}
        </span>
      )}
      {language.label}
    </button>
  );
}

function StepFrame({ children }: { children: ReactNode }) {
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

export default CustomSongWizard;
