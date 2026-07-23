"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import LoginDialog from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import {
  applyLyricsLineRewrite,
  composeLyricsText,
  createLyricsLineRewriteSuggestions,
  LyricsLineRewriteSuggestion,
  parseLyricsText,
} from "@/lib/ai/song-lyrics";
import { addSpokenIntroToLyrics } from "@/lib/ai/spoken-intro";
import { normalizeSpokenIntroContentType } from "@/lib/audio/spoken-intro-upload";
import { authClient } from "@/lib/auth/auth-client";
import {
  GenreWarningDialog,
  LyricsVersionComparisonDialog,
  NewLyricsVersionDialog,
} from "@/components/song/custom-song-wizard/components/dialogs";

import {
  createCheckoutSession,
  createSongCoverUpload,
  finalizeSongVersion,
  generateSongCover,
  generateStoryFromHelper,
  createSpokenIntroUpload,
  getLyricsGenerationStatus,
  getSongGenerationStatus,
  rewriteLyricsLines,
  startLyricsGeneration,
  startSongGeneration,
  transcribeSpokenIntro,
} from "@/components/song/custom-song-wizard/api";
import {
  customOccasionValue,
  defaultGenre,
  defaultLanguage,
  defaultVocalGender,
  draftStorageKey,
  fallbackLyrics,
  genres,
  isCustomOccasion,
  lyricGenerationSteps,
  occasions,
  slugToStep,
  stepSlugs,
  storyHelperSteps,
} from "@/components/song/custom-song-wizard/constants";
import {
  cleanRecipients,
  createLyricsInputKey,
  getRecommendedGenresForOccasion,
  isLegacyEmptyStyleDraft,
  normalizeRecipientsFromDraft,
} from "@/components/song/custom-song-wizard/draft";
import {
  useAudioPreview,
  useFocusCustomOccasionInput,
  useStopSpeechRecognitionOnUnmount,
} from "@/components/song/custom-song-wizard/hooks";
import {
  PaywallModal,
  StepFrame,
  StepHeading,
  StepProgress,
  StoryHelperModal,
} from "@/components/song/custom-song-wizard/components/wizard-ui";
import { LyricsStep } from "@/components/song/custom-song-wizard/steps/LyricsStep";
import { RecipientStep } from "@/components/song/custom-song-wizard/steps/RecipientStep";
import { SongStep } from "@/components/song/custom-song-wizard/steps/SongStep";
import { StoryStep } from "@/components/song/custom-song-wizard/steps/StoryStep";
import { StyleStep } from "@/components/song/custom-song-wizard/steps/StyleStep";
import { cn } from "@/lib/utils";
import type { SongCoverArtDirection } from "@/types/song-cover";
import type {
  CaptureLeadResponse,
  GenreOption,
  LyricsStage,
  LyricsVersionComparison,
  Occasion,
  RecipientInput,
  SongStage,
  SongVersion,
  SpokenIntroDraft,
  StoredDraft,
  WizardStep,
} from "@/components/song/custom-song-wizard/types";

const CREATE_SONG_LYRICS_PATH = "/create-song?step=lyrics";

export function CustomSongWizard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const storyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const blessingAudioRef = useRef<HTMLAudioElement | null>(null);
  const blessingRecorderRef = useRef<MediaRecorder | null>(null);
  const blessingChunksRef = useRef<Blob[]>([]);
  const customOccasionInputRef = useRef<HTMLInputElement | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [genre, setGenre] = useState(defaultGenre);
  const [vocalGender, setVocalGender] = useState(defaultVocalGender);
  const [language, setLanguage] = useState(defaultLanguage);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [customOccasionInput, setCustomOccasionInput] = useState("");
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { name: "", relationship: "" },
  ]);
  const [story, setStory] = useState("");
  const [spokenMode, setSpokenMode] = useState<"recording" | "text">(
    "recording",
  );
  const [spokenBlessing, setSpokenBlessing] = useState("");
  const [spokenIntro, setSpokenIntro] = useState<SpokenIntroDraft | null>(null);
  const [isRecordingBlessing, setIsRecordingBlessing] = useState(false);
  const [isUploadingBlessing, setIsUploadingBlessing] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [isNewLyricsVersionDialogOpen, setIsNewLyricsVersionDialogOpen] =
    useState(false);
  const [newLyricsVersionInstruction, setNewLyricsVersionInstruction] =
    useState("");
  const [pendingLyricsComparisonSource, setPendingLyricsComparisonSource] =
    useState<{ lyrics: string; title: string } | null>(null);
  const [lyricsVersionComparison, setLyricsVersionComparison] =
    useState<LyricsVersionComparison | null>(null);
  const [selectedLyricLineIds, setSelectedLyricLineIds] = useState<string[]>(
    [],
  );
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
  const [isMockMode, setIsMockMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingCopyIndex, setLoadingCopyIndex] = useState(0);
  const [leadData, setLeadData] = useState<CaptureLeadResponse | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverPrompt, setCoverPrompt] = useState("");
  const [coverArt, setCoverArt] = useState<SongCoverArtDirection | null>(null);
  const [coverError, setCoverError] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(60);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [finalizingVersion, setFinalizingVersion] = useState<string | null>(
    null,
  );
  const [selectedVersion, setSelectedVersion] = useState("A");
  const [selectedProviderVersion, setSelectedProviderVersion] = useState("A");
  const [activeVersion, setActiveVersion] = useState("A");
  const [isStoryHelperOpen, setIsStoryHelperOpen] = useState(false);
  const [storyHelperStep, setStoryHelperStep] = useState(0);
  const [storyHelperAnswers, setStoryHelperAnswers] = useState<string[]>(
    Array(storyHelperSteps.length).fill(""),
  );
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isPolishingStory, setIsPolishingStory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingGenre, setPendingGenre] = useState<GenreOption | null>(null);

  const selectedOccasion = useMemo(() => {
    const matchedOccasion = occasions.find((item) => item.value === occasion);
    if (matchedOccasion) return matchedOccasion;
    if (!isCustomOccasion(occasion)) return undefined;

    return {
      value: occasion as Occasion,
      icon: <Plus className="size-6" />,
      title: occasion as string,
      subtitle: "A custom reason for this song.",
    };
  }, [occasion]);
  const showCustomOccasionInput =
    occasion === customOccasionValue || isCustomOccasion(occasion);
  const cleanRecipientList = useMemo(
    () => cleanRecipients(recipients),
    [recipients],
  );
  const recipientNameList = useMemo(
    () => cleanRecipientList.map((recipient) => recipient.name).filter(Boolean),
    [cleanRecipientList],
  );
  const recipientRelationshipList = useMemo(
    () => cleanRecipientList.map((recipient) => recipient.relationship),
    [cleanRecipientList],
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
    previewLimitSeconds || currentVersion?.duration || audioDuration;
  const storyWordCount = story.trim()
    ? story.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const hasSelectedOccasion = Boolean(
    occasion &&
      (occasion !== customOccasionValue || customOccasionInput.trim()),
  );
  const selectedOccasionTitle =
    selectedOccasion?.title || "For someone special";
  const selectedOccasionShortTitle =
    selectedOccasionTitle.split("/")[0].trim() || "recipient";
  const recommendedGenreValues = useMemo(
    () => getRecommendedGenresForOccasion(occasion),
    [occasion],
  );
  const recommendedGenreSet = useMemo(
    () => new Set(recommendedGenreValues),
    [recommendedGenreValues],
  );
  const sortedGenres = useMemo(() => {
    const order = new Map(
      recommendedGenreValues.map((value, index) => [value, index]),
    );

    return [...genres].sort((a, b) => {
      const aRecommended = recommendedGenreSet.has(a.value);
      const bRecommended = recommendedGenreSet.has(b.value);

      if (aRecommended && bRecommended) {
        return (order.get(a.value) ?? 999) - (order.get(b.value) ?? 999);
      }

      if (aRecommended !== bRecommended) return aRecommended ? -1 : 1;
      return (
        genres.findIndex((item) => item.value === a.value) -
        genres.findIndex((item) => item.value === b.value)
      );
    });
  }, [recommendedGenreSet, recommendedGenreValues]);
  const selectedGenreIsNotRecommended =
    Boolean(genre) && !recommendedGenreSet.has(genre);
  const currentLyricsInputKey = createLyricsInputKey({
    genre,
    language,
    occasion,
    recipients,
    story,
    spokenBlessing: spokenMode === "text" ? spokenBlessing : "",
    spokenMode,
    vocalGender,
  });
  const editableLyricLines = useMemo(
    () => parseLyricsText(generatedLyrics),
    [generatedLyrics],
  );
  const withTextSpokenIntro = useCallback(
    (lyrics: string) =>
      spokenMode === "text"
        ? addSpokenIntroToLyrics(lyrics, spokenBlessing)
        : lyrics,
    [spokenBlessing, spokenMode],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepFromUrl = slugToStep[params.get("step") || ""] || 1;
    const queryLyrics = params.get("lyrics") || "";
    const queryOccasion = params.get("occasion");

    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft) as StoredDraft;

        const legacyEmptyStyleDraft = isLegacyEmptyStyleDraft(draft);
        const draftGenre = legacyEmptyStyleDraft ? defaultGenre : draft.genre;
        const draftVocalGender = legacyEmptyStyleDraft
          ? defaultVocalGender
          : draft.vocalGender;
        const draftLanguage = draft.language || defaultLanguage;

        if (draftGenre) setGenre(draftGenre);
        if (draftVocalGender) setVocalGender(draftVocalGender);
        setLanguage(draftLanguage);
        if (draft.occasion !== undefined) {
          const draftOccasion = draft.occasion || null;
          setOccasion(draftOccasion);
          if (draftOccasion && isCustomOccasion(draftOccasion)) {
            setCustomOccasionInput(draftOccasion);
          }
        }
        const draftRecipients = normalizeRecipientsFromDraft(draft);
        setRecipients(draftRecipients);
        if (draft.story !== undefined) setStory(draft.story);
        if (draft.personalNote !== undefined)
          setPersonalNote(draft.personalNote);
        if (draft.spokenMode) setSpokenMode(draft.spokenMode);
        if (draft.spokenBlessing !== undefined)
          setSpokenBlessing(draft.spokenBlessing);
        if (draft.spokenIntro) setSpokenIntro(draft.spokenIntro);
        const restoredLyricsInputKey = createLyricsInputKey({
          genre: draftGenre || defaultGenre,
          language: draftLanguage,
          occasion: draft.occasion || null,
          recipients: draftRecipients,
          story: draft.story || "",
          spokenBlessing:
            draft.spokenMode === "text" ? draft.spokenBlessing || "" : "",
          spokenMode: draft.spokenMode || "recording",
          vocalGender: draftVocalGender || defaultVocalGender,
        });
        const canRestoreLyrics =
          draft.lyricsGeneratedBy === "ai" &&
          draft.lyricsInputKey === restoredLyricsInputKey &&
          Boolean(draft.generatedLyrics?.trim());

        if (canRestoreLyrics) {
          if (draft.songTitle !== undefined) setSongTitle(draft.songTitle);
          if (draft.coverArt) setCoverArt(draft.coverArt);
          setGeneratedLyrics(
            draft.spokenMode === "text"
              ? addSpokenIntroToLyrics(
                  draft.generatedLyrics || "",
                  draft.spokenBlessing || "",
                )
              : draft.generatedLyrics || "",
          );
          setLyricsGeneratedBy("ai");
          setLyricsInputKey(restoredLyricsInputKey);
          setLyricsStage("editor");
        }
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
      const queryRelationships = (params.get("relationships") || "")
        .split(",")
        .map((relationship) => relationship.trim())
        .slice(0, 3);

      setGenre(params.get("genre") || defaultGenre);
      setVocalGender(params.get("vocalGender") || defaultVocalGender);
      setLanguage(params.get("language") || defaultLanguage);
      setOccasion(queryOccasion || null);
      if (queryOccasion && isCustomOccasion(queryOccasion)) {
        setCustomOccasionInput(queryOccasion);
      }
      setRecipients(
        queryRecipients.length
          ? queryRecipients.map((name, index) => ({
              name,
              relationship: queryRelationships[index] || "",
            }))
          : [{ name: "", relationship: "" }],
      );
      setStory(params.get("story") || "");
      setSongTitle(params.get("title") || "Your Custom Song");
      setGeneratedLyrics(queryLyrics);
      setLyricsGeneratedBy("ai");
      setLyricsStage("editor");
      setStep(queryOccasion ? 4 : stepFromUrl);
      setIsHydrated(true);
      return;
    }

    if (queryOccasion) {
      setOccasion(queryOccasion);
      if (isCustomOccasion(queryOccasion)) {
        setCustomOccasionInput(queryOccasion);
      }
    }

    setStep(stepFromUrl);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const url = new URL(window.location.href);
    url.searchParams.set("step", stepSlugs[step]);
    window.history.replaceState(
      { step },
      "",
      `${url.pathname}?${url.searchParams.toString()}`,
    );
  }, [isHydrated, step]);

  useEffect(() => {
    if (!isHydrated) return;

    const draft: StoredDraft = {
      coverArt: coverArt || undefined,
      generatedLyrics,
      genre,
      language,
      lyricsGeneratedBy: lyricsGeneratedBy || undefined,
      lyricsInputKey,
      occasion,
      personalNote,
      recipients,
      recipientNames: recipientNameList,
      recipientRelationships: recipientRelationshipList,
      songStage,
      songTitle,
      story,
      spokenBlessing,
      spokenIntro: spokenIntro || undefined,
      spokenMode,
      vocalGender,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    coverArt,
    generatedLyrics,
    genre,
    isHydrated,
    language,
    lyricsGeneratedBy,
    lyricsInputKey,
    occasion,
    personalNote,
    recipientNameList,
    recipientRelationshipList,
    recipients,
    songStage,
    songTitle,
    story,
    spokenBlessing,
    spokenIntro,
    spokenMode,
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

  const resetCoverGeneration = useCallback(() => {
    setCoverImageUrl("");
    setCoverPrompt("");
    setCoverError("");
    setIsGeneratingCover(false);
  }, []);

  const requestLyricsGeneration = useCallback(
    async ({
      comparisonSource,
      revisionInstruction = "",
    }: {
      comparisonSource?: { lyrics: string; title: string } | null;
      revisionInstruction?: string;
    } = {}) => {
      if (!occasion || story.trim().length < 10) return;
      const trimmedRevisionInstruction = revisionInstruction.trim();
      const isComparisonGeneration = Boolean(comparisonSource);

      setLyricsStage("loading");
      setLyricsError("");
      setLyricsTaskId("");
      if (!isComparisonGeneration) {
        setLyricsGeneratedBy(null);
        setLyricsInputKey("");
        setSongTitle("");
        setGeneratedLyrics("");
        setCoverArt(null);
        resetCoverGeneration();
      }
      setPendingLyricsComparisonSource(comparisonSource ?? null);
      setLyricsRequestInputKey(currentLyricsInputKey);
      setLyricLoadingStep(0);

      try {
        const data = await startLyricsGeneration({
          occasion,
          genre,
          language,
          recipients: cleanRecipientList,
          recipientNames: recipientNameList,
          recipientRelationships: recipientRelationshipList,
          revisionInstruction: trimmedRevisionInstruction || undefined,
          story,
          vocalGender,
        });
        if (data.status === "succeeded") {
          if (comparisonSource) {
            setLyricsVersionComparison({
              originalTitle: comparisonSource.title,
              originalLyrics: comparisonSource.lyrics,
              newTitle: data.title || "Your Custom Song",
              newLyrics: data.lyrics || "",
              newCoverArt: data.coverArt,
            });
            setPendingLyricsComparisonSource(null);
            setLyricsRequestInputKey("");
            setLyricsStage("editor");
            return;
          }

          setSongTitle(data.title || "Your Custom Song");
          setGeneratedLyrics(withTextSpokenIntro(data.lyrics || ""));
          setCoverArt(data.coverArt || null);
          setLyricsGeneratedBy("ai");
          setLyricsInputKey(currentLyricsInputKey);
          setPendingLyricsComparisonSource(null);
          setLyricsRequestInputKey("");
          setLyricsStage("editor");
          return;
        }
        setLyricsTaskId(data.taskId);
      } catch (error) {
        setLyricsError(
          error instanceof Error
            ? error.message
            : "Unable to start lyrics generation.",
        );
        setLyricsRequestInputKey("");
        setPendingLyricsComparisonSource(null);
        setLyricsStage("editor");
      }
    },
    [
      currentLyricsInputKey,
      genre,
      language,
      occasion,
      cleanRecipientList,
      recipientNameList,
      recipientRelationshipList,
      resetCoverGeneration,
      story,
      vocalGender,
      withTextSpokenIntro,
    ],
  );

  useEffect(() => {
    if (step !== 4) return;
    if (lyricsError) return;
    if (
      lyricsStage === "loading" &&
      lyricsRequestInputKey === currentLyricsInputKey
    ) {
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
        Math.min(lyricGenerationSteps.length - 1, current + 1),
      );
    }, 2500);

    return () => window.clearInterval(timer);
  }, [lyricsStage, step]);

  useEffect(() => {
    if (!lyricsTaskId || lyricsStage !== "loading") return;

    let cancelled = false;
    const poll = async () => {
      try {
        const data = await getLyricsGenerationStatus(lyricsTaskId);
        if (cancelled) return;

        if (data.status === "succeeded") {
          if (pendingLyricsComparisonSource) {
            setLyricsVersionComparison({
              originalTitle: pendingLyricsComparisonSource.title,
              originalLyrics: pendingLyricsComparisonSource.lyrics,
              newTitle: data.title || "Your Custom Song",
              newLyrics: data.lyrics || "",
              newCoverArt: data.coverArt,
            });
            setPendingLyricsComparisonSource(null);
            setLyricsRequestInputKey("");
            setLyricsStage("editor");
            setLyricsTaskId("");
            return;
          }

          setSongTitle(data.title || "Your Custom Song");
          setGeneratedLyrics(withTextSpokenIntro(data.lyrics || ""));
          setCoverArt(data.coverArt || null);
          setLyricsGeneratedBy("ai");
          setLyricsInputKey(currentLyricsInputKey);
          setPendingLyricsComparisonSource(null);
          setLyricsRequestInputKey("");
          setLyricsStage("editor");
          setLyricsTaskId("");
          return;
        }

        if (data.status === "failed") {
          throw new Error(data.error || "Lyrics generation failed.");
        }
      } catch (error) {
        if (cancelled) return;
        setLyricsError(
          error instanceof Error ? error.message : "Unable to generate lyrics.",
        );
        setLyricsRequestInputKey("");
        setPendingLyricsComparisonSource(null);
        setLyricsStage("editor");
      }
    };

    poll();
    const timer = window.setInterval(poll, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    currentLyricsInputKey,
    lyricsStage,
    lyricsTaskId,
    pendingLyricsComparisonSource,
    withTextSpokenIntro,
  ]);

  useEffect(() => {
    const lyricLineIds = new Set(
      editableLyricLines
        .filter((line) => line.kind === "lyric")
        .map((line) => line.id),
    );
    setSelectedLyricLineIds((current) =>
      current.filter((lineId) => lyricLineIds.has(lineId)),
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((suggestion) => lyricLineIds.has(suggestion.lineId)),
    );
  }, [editableLyricLines]);

  const requestSongGeneration = useCallback(async () => {
    if (!occasion || !songTitle.trim() || !generatedLyrics.trim()) return;
    if (!session?.user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setSongTaskId("");
    setSongError("");
    setIsMockMode(false);
    setLeadData(null);
    setPreviewTime(0);
    setIsPlaying(false);
    setProgress(8);
    setCoverError("");

    try {
      const data = await startSongGeneration({
        occasion,
        genre,
        language,
        recipients: cleanRecipientList,
        recipientNames: recipientNameList,
        recipientRelationships: recipientRelationshipList,
        story,
        title: songTitle,
        lyrics: generatedLyrics,
        spokenIntro:
          spokenMode === "recording" ? spokenIntro || undefined : undefined,
        vocalGender,
      });
      setSongTaskId(data.songId);
      setIsMockMode(data.mockMode);
      setProgress(18);
    } catch (error) {
      setSongError(
        error instanceof Error
          ? error.message
          : "Unable to start song generation.",
      );
    }
  }, [
    generatedLyrics,
    genre,
    language,
    occasion,
    cleanRecipientList,
    recipientNameList,
    recipientRelationshipList,
    session?.user,
    songTitle,
    spokenIntro,
    spokenMode,
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
        const data = await getSongGenerationStatus(songTaskId);
        if (cancelled) return;
        setIsMockMode(data.mockMode);

        setProgress((current) => Math.min(92, current + 12));

        if (data.status === "succeeded") {
          const versions = data.versions || [];

          setLeadData({
            userId: session?.user?.id || "",
            songId: data.songId,
            previewAudioUrl: versions[0]?.audioUrl || "",
            previewLimitSeconds: data.previewLimitSeconds,
            expiresAt: data.expiresAt,
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

        if (data.status === "failed") {
          throw new Error(data.error || "Song generation failed.");
        }
      } catch (error) {
        if (cancelled) return;
        setSongError(
          error instanceof Error ? error.message : "Unable to generate song.",
        );
      }
    };

    poll();
    const timer = window.setInterval(poll, 6000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [router, session?.user, songStage, songTaskId]);

  useAudioPreview({
    audioRef,
    previewAudioUrl: leadData?.previewAudioUrl,
    previewLimitSeconds: leadData?.previewLimitSeconds,
    onDurationChange: setAudioDuration,
    onEnded: () => setIsPlaying(false),
    onPreviewLimitReached: () => setIsPlaying(false),
    onTimeChange: setPreviewTime,
  });

  useFocusCustomOccasionInput({
    inputRef: customOccasionInputRef,
    shouldFocus: showCustomOccasionInput,
  });

  useStopSpeechRecognitionOnUnmount({ speechRecognitionRef });

  const activeLyricIndex = lyrics.reduce((activeIndex, lyric, index) => {
    return previewTime >= lyric.time ? index : activeIndex;
  }, 0);

  const canContinue =
    (step === 1 &&
      hasSelectedOccasion &&
      cleanRecipientList.some((recipient) => recipient.name)) ||
    (step === 2 && Boolean(genre)) ||
    (step === 3 && story.trim().length >= 10) ||
    (step === 4 &&
      songTitle.trim().length > 0 &&
      generatedLyrics.trim().length > 0);

  async function generateCoverWithAi() {
    if (!occasion || !songTitle.trim() || !generatedLyrics.trim()) {
      setCoverError("Finish the lyrics before generating a cover.");
      return;
    }

    setCoverError("");
    setIsGeneratingCover(true);

    try {
      const result = await generateSongCover({
        coverArt: coverArt || undefined,
        occasion,
        genre,
        language,
        recipients: cleanRecipientList,
        recipientNames: recipientNameList,
        recipientRelationships: recipientRelationshipList,
        story,
        title: songTitle,
        lyrics: generatedLyrics,
        vocalGender,
        songId: leadData?.songId || songTaskId || undefined,
      });

      setCoverImageUrl(result.imageUrl);
      setCoverPrompt(result.prompt);
      toast.success("Your album cover is ready.");
    } catch (error) {
      setCoverError(
        error instanceof Error
          ? error.message
          : "Unable to generate cover image.",
      );
    } finally {
      setIsGeneratingCover(false);
    }
  }

  async function uploadSongCover(file: File) {
    const allowedContentTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ] as const;
    if (
      !allowedContentTypes.includes(
        file.type as (typeof allowedContentTypes)[number],
      )
    ) {
      setCoverError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCoverError("Choose an image under 10MB.");
      return;
    }

    setCoverError("");
    setIsUploadingCover(true);
    try {
      const upload = await createSongCoverUpload({
        contentType: file.type as (typeof allowedContentTypes)[number],
        fileName: file.name,
        size: file.size,
      });
      const response = await fetch(upload.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": upload.contentType },
        body: file,
      });
      if (!response.ok) throw new Error("Unable to upload the album cover.");

      setCoverImageUrl(upload.publicObjectUrl);
      setCoverPrompt("");
      toast.success("Your album cover was uploaded.");
    } catch (error) {
      setCoverError(
        error instanceof Error
          ? error.message
          : "Unable to upload the album cover.",
      );
    } finally {
      setIsUploadingCover(false);
    }
  }

  function savePersonalNote() {
    const note = personalNote.trim();
    if (!note) {
      toast.info("Write a personal note before saving.");
      return;
    }

    if (note !== personalNote) setPersonalNote(note);
    toast.success("Personal note saved to your draft.");
  }

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
      const leadingSpace =
        before && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "";
      const trailingSpace =
        after && !after.startsWith(" ") && !after.startsWith("\n") ? " " : "";
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
        index === storyHelperStep ? value : answer,
      ),
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

  async function polishStoryWithAi() {
    if (!occasion || story.trim().length < 10) return;

    setIsPolishingStory(true);

    try {
      const generatedStory = await generateStoryFromHelper({
        occasion,
        genre,
        language,
        recipients: cleanRecipientList,
        recipientNames: recipientNameList,
        recipientRelationships: recipientRelationshipList,
        answers: [],
        sourceStory: story,
        vocalGender,
      });

      if (generatedStory.story.trim()) {
        setStory(generatedStory.story);
        toast.success("AI polished your story.");
      }
    } catch (error) {
      console.error("[Story Helper] Failed to polish story:", error);
      toast.info("AI story polishing is unavailable right now.");
    } finally {
      setIsPolishingStory(false);
      window.requestAnimationFrame(() => storyTextareaRef.current?.focus());
    }
  }

  async function goToNextStoryHelperStep() {
    if (storyHelperStep < storyHelperSteps.length - 1) {
      setStoryHelperStep((current) => current + 1);
      return;
    }

    setIsCreatingStory(true);
    const composedStory = composeStoryFromHelper(storyHelperAnswers);

    try {
      if (!occasion) {
        throw new Error("Choose an occasion before creating a story.");
      }

      const generatedStory = await generateStoryFromHelper({
        occasion,
        genre,
        language,
        recipients: cleanRecipientList,
        recipientNames: recipientNameList,
        recipientRelationships: recipientRelationshipList,
        answers: storyHelperAnswers.map((answer, index) => ({
          question:
            storyHelperSteps[index]?.question || `Question ${index + 1}`,
          answer,
        })),
        vocalGender,
      });

      if (generatedStory.story.trim()) {
        setStory(generatedStory.story);
      } else if (composedStory) {
        setStory(composedStory);
      }
    } catch (error) {
      console.error("[Story Helper] Failed to generate AI story:", error);
      if (composedStory) setStory(composedStory);
      toast.info(
        "We used your answers directly because AI story writing was unavailable.",
      );
    } finally {
      setIsCreatingStory(false);
      setIsStoryHelperOpen(false);
      window.requestAnimationFrame(() => storyTextareaRef.current?.focus());
    }
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
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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

  async function uploadAndTranscribeBlessing(file: File) {
    const contentType = normalizeSpokenIntroContentType(file.type);
    if (!contentType) {
      toast.error("Please choose a WebM, MP3, MP4, WAV, or OGG recording.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Keep your recording under 12MB.");
      return;
    }
    setIsUploadingBlessing(true);
    try {
      const upload = await createSpokenIntroUpload({
        contentType,
        fileName: file.name,
        size: file.size,
      });
      const put = await fetch(upload.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": upload.contentType },
        body: file,
      });
      if (!put.ok) throw new Error("Unable to upload your recording.");
      const transcription = await transcribeSpokenIntro({
        audioKey: upload.key,
        audioUrl: upload.publicObjectUrl,
      });
      if (transcription.durationSeconds > 45)
        throw new Error("Please keep your blessing under 45 seconds.");
      setSpokenIntro({
        audioKey: upload.key,
        audioUrl: upload.publicObjectUrl,
        ...transcription,
      });
      setSpokenBlessing(transcription.transcript);
      toast.success("Your voice blessing is ready.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to process your recording.",
      );
    } finally {
      setIsUploadingBlessing(false);
    }
  }

  async function toggleBlessingRecording() {
    if (isRecordingBlessing) {
      blessingRecorderRef.current?.stop();
      return;
    }
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? { mimeType: "audio/webm;codecs=opus" }
          : undefined,
      );
      blessingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) blessingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecordingBlessing(false);
        const blob = new Blob(blessingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size)
          void uploadAndTranscribeBlessing(
            new File([blob], "voice-blessing.webm", { type: blob.type }),
          );
      };
      recorder.start();
      blessingRecorderRef.current = recorder;
      setIsRecordingBlessing(true);
      window.setTimeout(
        () => recorder.state === "recording" && recorder.stop(),
        45000,
      );
    } catch {
      toast.error("Microphone access is required to record your blessing.");
    }
  }

  function toggleBlessingPlayback() {
    if (!spokenIntro) return;
    const audio = blessingAudioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  function updateSpokenBlessing(value: string) {
    setSpokenBlessing(value);
    if (spokenMode === "recording" && spokenIntro) {
      setSpokenIntro({ ...spokenIntro, transcript: value });
    }
  }

  function updateRecipient(
    index: number,
    field: keyof RecipientInput,
    value: string,
  ) {
    setRecipients((current) =>
      current.map((recipient, itemIndex) =>
        itemIndex === index ? { ...recipient, [field]: value } : recipient,
      ),
    );
  }

  function selectOccasion(value: Occasion) {
    if (value === customOccasionValue) {
      setOccasion(customOccasionInput.trim() || customOccasionValue);
      return;
    }

    setOccasion(value);
  }

  function selectCustomOccasion(value: string) {
    setCustomOccasionInput(value);
    setOccasion(value.trim() || customOccasionValue);
  }

  function selectGenreOption(item: GenreOption) {
    if (recommendedGenreSet.has(item.value)) {
      setGenre(item.value);
      return;
    }

    setPendingGenre(item);
  }

  function confirmPendingGenre() {
    if (pendingGenre) setGenre(pendingGenre.value);
    setPendingGenre(null);
  }

  function addRecipientName() {
    setRecipients((current) =>
      current.length >= 3
        ? current
        : [...current, { name: "", relationship: "" }],
    );
  }

  function removeRecipientName(index: number) {
    setRecipients((current) => {
      if (current.length === 1) return [{ name: "", relationship: "" }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function resetLyricsForGeneration() {
    setSongTitle("");
    setGeneratedLyrics("");
    setCoverArt(null);
    setSelectedLyricLineIds([]);
    setLyricRewriteSuggestions([]);
    setLyricRewriteInstruction("");
    setLyricRewriteError("");
    setLyricsVersionComparison(null);
    resetCoverGeneration();
  }

  function rewriteLyrics() {
    resetLyricsForGeneration();
    requestLyricsGeneration();
  }

  function openNewLyricsVersionDialog() {
    setNewLyricsVersionInstruction("");
    setLyricsVersionComparison(null);
    setIsNewLyricsVersionDialogOpen(true);
  }

  function generateNewLyricsVersion() {
    const revisionInstruction = newLyricsVersionInstruction;
    const comparisonSource = {
      title: songTitle || "Your Custom Song",
      lyrics: generatedLyrics,
    };

    setIsNewLyricsVersionDialogOpen(false);
    setSelectedLyricLineIds([]);
    setLyricRewriteSuggestions([]);
    setLyricRewriteInstruction("");
    setLyricRewriteError("");
    setNewLyricsVersionInstruction("");
    requestLyricsGeneration({
      comparisonSource,
      revisionInstruction,
    });
  }

  function keepOriginalLyricsVersion() {
    setLyricsVersionComparison(null);
  }

  function useNewLyricsVersion() {
    if (!lyricsVersionComparison) return;

    setSongTitle(lyricsVersionComparison.newTitle);
    setGeneratedLyrics(withTextSpokenIntro(lyricsVersionComparison.newLyrics));
    setCoverArt(lyricsVersionComparison.newCoverArt || null);
    setLyricsGeneratedBy("ai");
    setLyricsInputKey(currentLyricsInputKey);
    setLyricsVersionComparison(null);
    setSelectedLyricLineIds([]);
    setLyricRewriteSuggestions([]);
    setLyricRewriteInstruction("");
    setLyricRewriteError("");
    resetCoverGeneration();
    toast.success("New lyrics version applied.");
  }

  function updateLyricLine(lineId: string, text: string) {
    resetCoverGeneration();
    setGeneratedLyrics((current) =>
      composeLyricsText(
        parseLyricsText(current).map((line) =>
          line.id === lineId ? { ...line, text } : line,
        ),
      ),
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((suggestion) => suggestion.lineId !== lineId),
    );
    setLyricRewriteError("");
  }

  function toggleLyricLineSelection(lineId: string, selected: boolean) {
    setSelectedLyricLineIds((current) =>
      selected
        ? Array.from(new Set([...current, lineId]))
        : current.filter((id) => id !== lineId),
    );
    setLyricRewriteError("");
  }

  async function rewriteSelectedLyricLines() {
    const selectedLines = editableLyricLines.filter(
      (line) => selectedLyricLineIds.includes(line.id) && line.kind === "lyric",
    );

    if (!selectedLines.length) {
      setLyricRewriteError("Select at least one lyric line to rewrite.");
      return;
    }

    setIsRewritingLyricLines(true);
    setLyricRewriteError("");

    try {
      const data = await rewriteLyricsLines({
        occasion,
        genre,
        language,
        recipients: cleanRecipientList,
        recipientNames: recipientNameList,
        recipientRelationships: recipientRelationshipList,
        fullLyrics: generatedLyrics,
        selectedLines: selectedLines.map((line) => line.text),
        instruction: lyricRewriteInstruction,
        story,
        vocalGender,
      });

      setLyricRewriteSuggestions(
        createLyricsLineRewriteSuggestions(
          editableLyricLines,
          selectedLines.map((line) => line.id),
          data.lines || [],
        ),
      );
      setSelectedLyricLineIds([]);
      toast.success("Rewrite suggestions are ready.");
    } catch (error) {
      setLyricRewriteError(
        error instanceof Error
          ? error.message
          : "Unable to rewrite selected lines.",
      );
    } finally {
      setIsRewritingLyricLines(false);
    }
  }

  function acceptLyricRewriteSuggestion(lineId: string) {
    const suggestion = lyricRewriteSuggestions.find(
      (item) => item.lineId === lineId,
    );
    if (!suggestion) return;

    setGeneratedLyrics((current) =>
      composeLyricsText(
        applyLyricsLineRewrite(
          parseLyricsText(current),
          [lineId],
          [suggestion.rewrittenText],
        ),
      ),
    );
    setLyricRewriteSuggestions((current) =>
      current.filter((item) => item.lineId !== lineId),
    );
  }

  function keepOriginalLyricLine(lineId: string) {
    setLyricRewriteSuggestions((current) =>
      current.filter((item) => item.lineId !== lineId),
    );
  }

  function setWizardStep(
    nextStep: WizardStep,
    mode: "push" | "replace" = "push",
  ) {
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepSlugs[nextStep]);

    if (mode === "replace") {
      window.history.replaceState(
        { step: nextStep },
        "",
        `${url.pathname}?${url.searchParams.toString()}`,
      );
    } else {
      window.history.pushState(
        { step: nextStep },
        "",
        `${url.pathname}?${url.searchParams.toString()}`,
      );
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
      resetCoverGeneration();
      audioRef.current?.pause();
    }
    setWizardStep(Math.max(1, step - 1) as WizardStep);
  }

  function goForward() {
    if (!canContinue) return;
    if (step === 4) {
      if (!isLoggedIn) {
        setIsLoginDialogOpen(true);
        return;
      }
      setSongStage("loading");
      setSongTaskId("");
      setSongError("");
      setCoverError("");
      setWizardStep(5);
      return;
    }
    setWizardStep(Math.min(5, step + 1) as WizardStep);
  }

  function respinSongPreview() {
    audioRef.current?.pause();
    setPreviewTime(0);
    setIsPlaying(false);
    setActiveVersion("A");
    setLeadData(null);
    setSongTaskId("");
    setSongError("");
    setProgress(8);
    setSongStage("loading");
    resetCoverGeneration();
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
      const checkout = await createCheckoutSession({
        stripePriceId,
        songId: leadData?.songId,
      });

      if (checkout.unauthorized) {
        toast.info("Please sign in to continue checkout.", {
          description: "Your song preview is saved to your account.",
        });
        return;
      }

      router.push(checkout.url);
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

  async function chooseSongVersion(version: string) {
    setSelectedVersion(version);
    const versionIndex = version === "B" ? 1 : 0;
    const songVersion = songVersions[versionIndex] || songVersions[0];
    const providerVersionId = songVersion?.id || version;
    setSelectedProviderVersion(providerVersionId);

    console.log("[CustomSongWizard] Choose song version", {
      version,
      providerVersionId,
      songId: leadData?.songId,
      hasLeadData: Boolean(leadData),
      previewLimitSeconds: leadData?.previewLimitSeconds,
      isLoggedIn,
      sessionUserId: session?.user?.id,
      versionIds: songVersions.map((item) => item.id),
    });

    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (!leadData?.songId || !songVersion?.audioUrl) {
      console.warn("[CustomSongWizard] Missing song data for finalize", {
        version,
        providerVersionId,
        songId: leadData?.songId,
        hasAudioUrl: Boolean(songVersion?.audioUrl),
      });
      toast.error("This song version is not ready yet.");
      return;
    }

    setFinalizingVersion(version);

    try {
      const result = await finalizeSongVersion({
        coverImageUrl: coverImageUrl || undefined,
        personalNote: personalNote.trim() || undefined,
        songId: leadData.songId,
        versionId: providerVersionId,
      });

      console.log("[CustomSongWizard] Finalize response", {
        version,
        providerVersionId,
        songId: leadData.songId,
        ok: result.ok,
        status: result.status,
        success: result.success,
        error: result.error,
        songUrl: result.data?.songUrl,
        alreadyFinalized: result.data?.alreadyFinalized,
      });

      if (result.status === 401) {
        toast.info("Please sign in to save this song.");
        return;
      }

      if (!result.ok || !result.success) {
        if (result.error === "Insufficient song balance.") {
          setIsPaywallOpen(true);
          return;
        }

        toast.error(result.error || "Unable to save this song.");
        return;
      }

      router.push(result.data?.songUrl || `/songs/${result.data?.songId}`);
    } catch (error) {
      console.error("[CustomSongWizard] Finalize request failed", {
        version,
        providerVersionId,
        songId: leadData.songId,
        error,
      });
      toast.error("Unable to save this song.", {
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setFinalizingVersion(null);
    }
  }

  const isSongResultStep = step === 5 && songStage === "player";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#fff9f5] pb-36 text-foreground">
      <CreateSongBackground occasion={step === 5 ? null : occasion} />

      <div
        className={cn(
          "relative z-10 mx-auto w-full py-5",
          isSongResultStep ? "max-w-none px-0" : "max-w-[1040px] px-4 sm:px-6",
        )}
      >
        {!(step === 5 && songStage === "player") && (
          <StepProgress currentStep={step} />
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepFrame key="recipient">
              <StepHeading
                title="Who's this song for?"
                description="Tell us the names and the occasion so we can make it personal."
              />
              <RecipientStep
                customOccasionInput={customOccasionInput}
                customOccasionInputRef={customOccasionInputRef}
                occasion={occasion}
                recipients={recipients}
                showCustomOccasionInput={showCustomOccasionInput}
                onAddRecipient={addRecipientName}
                onRecipientChange={updateRecipient}
                onRemoveRecipient={removeRecipientName}
                onSelectCustomOccasion={selectCustomOccasion}
                onSelectOccasion={selectOccasion}
              />
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame key="style">
              <StepHeading
                title="Choose the music style"
                description="Pick the genre, voice, and language for this custom song."
              />
              <StyleStep
                genre={genre}
                language={language}
                occasion={occasion}
                recommendedGenreSet={recommendedGenreSet}
                selectedGenreIsNotRecommended={selectedGenreIsNotRecommended}
                selectedOccasionTitle={selectedOccasionTitle}
                showAllLanguages={showAllLanguages}
                sortedGenres={sortedGenres}
                vocalGender={vocalGender}
                onGenreSelect={selectGenreOption}
                onLanguageChange={setLanguage}
                onShowAllLanguagesChange={setShowAllLanguages}
                onVocalGenderChange={setVocalGender}
              />
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame key="story">
              <StoryStep
                isRecording={isRecording}
                isRecordingBlessing={isRecordingBlessing}
                isUploadingBlessing={isUploadingBlessing}
                isPolishingStory={isPolishingStory}
                occasion={occasion}
                story={story}
                storyTextareaRef={storyTextareaRef}
                storyWordCount={storyWordCount}
                spokenBlessing={spokenBlessing}
                spokenIntro={spokenIntro}
                spokenMode={spokenMode}
                onOpenHelper={startStoryHelper}
                onPolishStory={polishStoryWithAi}
                onStoryChange={setStory}
                onToggleRecording={toggleRecording}
                onSpokenBlessingChange={updateSpokenBlessing}
                onSpokenModeChange={setSpokenMode}
                onToggleBlessingRecording={toggleBlessingRecording}
                onUploadBlessing={uploadAndTranscribeBlessing}
                onToggleBlessingPlayback={toggleBlessingPlayback}
              />
              <audio
                ref={blessingAudioRef}
                preload="metadata"
                src={spokenIntro?.audioUrl}
              />
            </StepFrame>
          )}

          {step === 4 && (
            <StepFrame key={`lyrics-${lyricsStage}`}>
              <LyricsStep
                editableLyricLines={editableLyricLines}
                lyricLoadingStep={lyricLoadingStep}
                lyricRewriteError={lyricRewriteError}
                lyricRewriteInstruction={lyricRewriteInstruction}
                lyricRewriteSuggestions={lyricRewriteSuggestions}
                lyricsError={lyricsError}
                lyricsStage={lyricsStage}
                recipientNameList={recipientNameList}
                selectedLyricLineIds={selectedLyricLineIds}
                songTitle={songTitle}
                isRewritingLyricLines={isRewritingLyricLines}
                onAcceptLyricRewriteSuggestion={acceptLyricRewriteSuggestion}
                onKeepOriginalLyricLine={keepOriginalLyricLine}
                onLyricLineChange={updateLyricLine}
                onLyricLineSelectionChange={toggleLyricLineSelection}
                onLyricRewriteInstructionChange={setLyricRewriteInstruction}
                onOpenNewLyricsVersionDialog={openNewLyricsVersionDialog}
                onRewriteLyrics={rewriteLyrics}
                onRewriteSelectedLyricLines={rewriteSelectedLyricLines}
                onSongTitleChange={setSongTitle}
              />
            </StepFrame>
          )}

          {step === 5 && (
            <StepFrame
              key={songStage === "loading" ? "song-generating" : "player"}
            >
              <SongStep
                activeVersion={activeVersion}
                audioRef={audioRef}
                coverError={coverError}
                coverImageUrl={coverImageUrl}
                coverPrompt={coverPrompt}
                currentVersion={currentVersion}
                displayDuration={displayDuration}
                finalizingVersion={finalizingVersion}
                generatedLyrics={generatedLyrics}
                genre={genre}
                language={language}
                leadData={leadData}
                personalNote={personalNote}
                previewLimitSeconds={previewLimitSeconds}
                previewTime={previewTime}
                progress={progress}
                recipientLabel={recipientLabel}
                selectedOccasion={selectedOccasion}
                songError={songError}
                songStage={songStage}
                songTitle={songTitle}
                songVersions={songVersions}
                story={story}
                vocalGender={vocalGender}
                isGeneratingCover={isGeneratingCover}
                isUploadingCover={isUploadingCover}
                isMockMode={isMockMode}
                isPlaying={isPlaying}
                onChooseVersion={chooseSongVersion}
                onGenerateCover={generateCoverWithAi}
                onUploadCover={uploadSongCover}
                onNoteChange={setPersonalNote}
                onSaveNote={savePersonalNote}
                onPlaybackToggle={toggleSongPlayback}
                onRespin={respinSongPreview}
                onRetryGeneration={() => {
                  setSongError("");
                  setSongTaskId("");
                  requestSongGeneration();
                }}
              />
            </StepFrame>
          )}
        </AnimatePresence>
      </div>

      {step < 5 && !(step === 4 && lyricsStage === "loading") && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/80 px-4 py-4 shadow-xl shadow-primary/5 backdrop-blur-xl sm:px-8">
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

      <GenreWarningDialog
        pendingGenre={pendingGenre}
        onConfirm={confirmPendingGenre}
        onOpenChange={(open) => {
          if (!open) setPendingGenre(null);
        }}
      />

      <NewLyricsVersionDialog
        instruction={newLyricsVersionInstruction}
        open={isNewLyricsVersionDialogOpen}
        onGenerate={generateNewLyricsVersion}
        onInstructionChange={setNewLyricsVersionInstruction}
        onOpenChange={setIsNewLyricsVersionDialogOpen}
      />

      <LyricsVersionComparisonDialog
        comparison={lyricsVersionComparison}
        onKeepOriginal={keepOriginalLyricsVersion}
        onUseNew={useNewLyricsVersion}
      />

      <AnimatePresence>
        {isPaywallOpen && (
          <PaywallModal
            isLoading={isCheckoutLoading}
            onClose={() => {
              if (isCheckoutLoading) return;
              setIsPaywallOpen(false);
            }}
            onContinue={() => {
              if (isCheckoutLoading) return;

              if (!leadData?.songId) {
                toast.error("This song preview is not ready yet.");
                return;
              }

              setIsCheckoutLoading(true);
              const params = new URLSearchParams({
                type: "unlock_song",
                songId: leadData.songId,
                versionId: selectedProviderVersion || selectedVersion,
              });
              params.set("returnTo", `/samples/${leadData.songId}`);
              router.push(`/pricing?${params.toString()}`);
            }}
            recipientLabel={recipientLabel}
            songTitle={songTitle || "Your Custom Song"}
            version={selectedVersion}
          />
        )}
      </AnimatePresence>

      <LoginDialog
        callbackPath={CREATE_SONG_LYRICS_PATH}
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </section>
  );
}

const occasionBackgrounds: Record<string, string> = {
  anniversary: "/occasion-backgrounds/avif/anniversary.avif",
  birthday: "/occasion-backgrounds/avif/birthday.avif",
  congratulations: "/occasion-backgrounds/avif/congratulations.avif",
  "fathers-day": "/occasion-backgrounds/avif/fathers-day.avif",
  "get-well-soon": "/occasion-backgrounds/avif/get-well-soon.avif",
  "in-memoriam": "/occasion-backgrounds/avif/in-memoriam.avif",
  "just-because": "/occasion-backgrounds/avif/just-because.avif",
  "mothers-day": "/occasion-backgrounds/avif/mothers-day.avif",
  "something-else": "/occasion-backgrounds/avif/something-else.avif",
  "thank-you": "/occasion-backgrounds/avif/thank-you.avif",
  "valentines-day": "/occasion-backgrounds/avif/valentines-day.avif",
  wedding: "/occasion-backgrounds/avif/wedding.avif",
};

function getOccasionBackgroundSrc(occasion: Occasion | null) {
  if (!occasion) return "";
  if (occasionBackgrounds[occasion]) return occasionBackgrounds[occasion];
  if (isCustomOccasion(occasion)) {
    return occasionBackgrounds[customOccasionValue];
  }
  return "";
}

function CreateSongBackground({ occasion }: { occasion: Occasion | null }) {
  const occasionBackgroundSrc = getOccasionBackgroundSrc(occasion);
  const decorations = [
    {
      symbol: "♪",
      className:
        "left-[10%] top-[23%] text-[58px] text-rose-200/35 blur-[5px] rotate-[-16deg]",
    },
    {
      symbol: "♥",
      className:
        "left-[15%] top-[31%] text-[28px] text-rose-200/40 blur-[6px] rotate-[10deg]",
    },
    {
      symbol: "♫",
      className:
        "right-[11%] top-[7%] text-[86px] text-rose-300/42 blur-[2px] rotate-[12deg]",
    },
    {
      symbol: "♫",
      className:
        "right-[16%] top-[30%] text-[74px] text-rose-300/40 blur-[3px] rotate-[-6deg]",
    },
    {
      symbol: "♥",
      className:
        "right-[30%] top-[18%] hidden text-[24px] text-rose-200/45 blur-[2px] rotate-[-12deg] md:block",
    },
    {
      symbol: "♪",
      className:
        "left-[7%] bottom-[18%] hidden text-[70px] text-orange-200/20 blur-[8px] rotate-[18deg] lg:block",
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,228,218,0.76)_0%,rgba(255,246,239,0.58)_34%,rgba(255,252,248,0.94)_74%,rgba(255,255,255,0.98)_100%)]" />
      {occasionBackgroundSrc && (
        <div className="absolute -left-4 top-0 h-[min(82vh,820px)] w-[min(60vw,760px)] min-w-[500px] opacity-80 sm:-left-6">
          <img
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-left-top blur-[1.25px] saturate-[0.96]"
            decoding="async"
            src={occasionBackgroundSrc}
            style={{
              maskImage:
                "linear-gradient(140deg, transparent 0%, black 14%, black 52%, transparent 86%), linear-gradient(180deg, transparent 0%, black 12%, black 76%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(140deg, transparent 0%, black 14%, black 52%, transparent 86%), linear-gradient(180deg, transparent 0%, black 12%, black 76%, transparent 100%)",
              WebkitMaskComposite: "source-in",
            }}
          />
          <div className="absolute -inset-y-10 -left-10 w-[130vw] bg-[linear-gradient(115deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.24)_18%,rgba(255,255,255,0.72)_46%,rgba(255,255,255,0.94)_72%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute -left-8 -top-8 h-52 w-64 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0)_76%)] blur-xl" />
        </div>
      )}
      <div className="absolute -left-[14%] -top-[18%] h-[470px] w-[45vw] min-w-[360px] rounded-full bg-[radial-gradient(circle,rgba(236,125,105,0.28)_0%,rgba(255,204,190,0.18)_42%,rgba(255,255,255,0)_72%)] blur-3xl" />
      <div className="absolute -right-[14%] -top-[18%] h-[500px] w-[48vw] min-w-[380px] rounded-full bg-[radial-gradient(circle,rgba(223,93,76,0.24)_0%,rgba(255,205,192,0.16)_46%,rgba(255,255,255,0)_74%)] blur-3xl" />
      <div className="absolute left-1/2 top-[16%] h-[520px] w-[58vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.82)_0%,rgba(255,250,246,0.58)_48%,rgba(255,255,255,0)_74%)] blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.55)_28%,rgba(255,255,255,0)_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_24%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_26%)]" />

      {decorations.map((item, index) => (
        <span
          key={`${item.symbol}-${index}`}
          aria-hidden="true"
          className={cn(
            "absolute select-none font-serif leading-none",
            item.className,
          )}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

export default CustomSongWizard;
