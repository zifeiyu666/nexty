import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("CustomSongWizard lyric version comparison", () => {
  test("shows a comparison dialog before applying a generated lyrics version", () => {
    const wizardSource = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );
    const uiSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/wizard-ui.tsx",
      ),
      "utf8",
    );
    const dialogsSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/dialogs.tsx",
      ),
      "utf8",
    );

    assert.match(wizardSource, /LyricsVersionComparison/);
    assert.match(wizardSource, /LyricsVersionComparisonDialog/);
    assert.match(wizardSource, /setLyricsVersionComparison/);
    assert.match(
      wizardSource,
      /setGeneratedLyrics\(lyricsVersionComparison\.newLyrics\)/,
    );
    assert.match(dialogsSource, /Compare lyrics versions/);
    assert.match(dialogsSource, /LyricsVersionPanel/);
    assert.match(uiSource, /export function LyricsVersionPanel/);
    assert.match(dialogsSource, /Use original/);
    assert.match(dialogsSource, /Use new version/);
  });

  test("finalizes the selected song version before opening the paywall", () => {
    const wizardSource = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );
    const apiSource = readFileSync(
      join(process.cwd(), "components/song/custom-song-wizard/api.ts"),
      "utf8",
    );

    assert.match(wizardSource, /async function chooseSongVersion/);
    assert.match(apiSource, /export async function finalizeSongVersion/);
    assert.match(apiSource, /fetch\("\/api\/songs\/finalize"/);
    assert.match(
      wizardSource,
      /const providerVersionId = songVersion\?\.id \|\| version/,
    );
    assert.match(
      wizardSource,
      /setSelectedProviderVersion\(providerVersionId\)/,
    );
    assert.match(wizardSource, /finalizeSongVersion\(\{/);
    assert.match(
      wizardSource,
      /result\.error === "Insufficient song balance\."/,
    );
    assert.match(
      wizardSource,
      /versionId: selectedProviderVersion \|\| selectedVersion/,
    );
    assert.match(
      wizardSource,
      /router\.push\(`\/pricing\?\$\{params\.toString\(\)\}`\)/,
    );
    assert.doesNotMatch(
      wizardSource,
      /function chooseSongVersion\(version: string\) \{\s*setSelectedVersion\(version\);\s*setIsPaywallOpen\(true\);/,
    );
  });

  test("wires AI cover generation through the song waiting screen and finalize request", () => {
    const wizardSource = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );
    const songStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/SongStep.tsx",
      ),
      "utf8",
    );
    const uiSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/wizard-ui.tsx",
      ),
      "utf8",
    );
    const apiSource = readFileSync(
      join(process.cwd(), "components/song/custom-song-wizard/api.ts"),
      "utf8",
    );

    assert.match(apiSource, /export async function generateSongCover/);
    assert.match(apiSource, /fetch\("\/api\/songs\/cover\/generate"/);
    assert.match(wizardSource, /const \[coverImageUrl, setCoverImageUrl\]/);
    assert.match(wizardSource, /async function generateCoverWithAi/);
    assert.match(wizardSource, /generateSongCover\(\{/);
    assert.match(wizardSource, /coverImageUrl,/);
    assert.match(songStepSource, /onGenerateCover: \(\) => void/);
    assert.match(songStepSource, /coverImageUrl=\{coverImageUrl\}/);
    assert.match(uiSource, /isGeneratingCover/);
    assert.match(uiSource, /onClick=\{onGenerateCover\}/);
    assert.match(uiSource, /src=\{coverImageUrl\}/);
    assert.match(uiSource, /coverError/);
  });


  test("respin keeps users on the song step and starts a fresh preview", () => {
    const wizardSource = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );
    const songStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/SongStep.tsx",
      ),
      "utf8",
    );

    assert.match(wizardSource, /function respinSongPreview\(\)/);
    assert.match(wizardSource, /setSongStage\("loading"\)/);
    assert.match(wizardSource, /setSongTaskId\(""\)/);
    assert.match(wizardSource, /setLeadData\(null\)/);
    assert.match(wizardSource, /setActiveVersion\("A"\)/);
    assert.match(wizardSource, /onRespin=\{respinSongPreview\}/);
    assert.doesNotMatch(
      wizardSource,
      /onRegenerate=\{\(\) => \{[\s\S]*?setWizardStep\(1\);[\s\S]*?\}\}/,
    );
    assert.doesNotMatch(wizardSource, /function respinSongPreview\(\)[\s\S]*?setWizardStep\(1\)/);
    assert.match(songStepSource, /onRespin: \(\) => void/);
    assert.match(songStepSource, /SongResultView/);
    assert.match(songStepSource, /Try fresh takes/);
    assert.match(songStepSource, /Generate two fresh takes with the same lyrics and style\./);
    assert.doesNotMatch(songStepSource, /Change your inputs & recreate/);
  });

  test("song result view owns shared generated song UI", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/song-result/SongResultView.tsx"),
      "utf8",
    );

    assert.match(source, /export function SongResultView/);
    assert.match(source, /function SongCoverBackdrop/);
    assert.match(source, /function OrganicSongCover/);
    assert.match(source, /h-64 w-72/);
    assert.match(source, /sm:h-72 sm:w-80/);
    assert.match(source, /lg:grid-cols-\[288px_1fr\]/);
    assert.match(source, /backdrop-blur-xl/);
    assert.match(source, /inset_0_1px_0_rgba\(255,255,255,0\.76\)/);
    assert.doesNotMatch(source, /rounded-full border border-border bg-card/);
    assert.match(source, /viewBox="0 0 500 500"/);
    assert.match(source, /organicDecoPath/);
    assert.match(source, /organicCoverPath/);
    assert.match(source, /fill="#3f3f3f"/);
    assert.match(source, /organicCoverMorphPath/);
    assert.match(source, /pathAnimationTransition/);
    assert.match(source, /imageAnimationTransition/);
    assert.match(source, /decoAnimationTransition/);
    assert.match(source, /duration: 0\.8/);
    assert.match(source, /duration: 1\.3/);
    assert.match(source, /setTimeout\(\(\) => \{/);
    assert.match(source, /}, 75\)/);
    assert.match(source, /useReducedMotion/);
    assert.match(source, /<motion\.path/);
    assert.match(source, /<motion\.image/);
    assert.match(source, /onPointerEnter=\{queueCoverActivation\}/);
    assert.match(source, /onPointerDown=\{queueCoverActivation\}/);
    assert.match(source, /showPlaybackControl = false/);
    assert.match(source, /showVisualizer = false/);
    assert.match(source, /onPlaybackToggle/);
    assert.match(source, /song-cover-visualizer/);
    assert.match(source, /aria-pressed=\{isInteractive \? isPlaying : undefined\}/);
    assert.doesNotMatch(source, /scaleX: shouldMorph \? 0\.8 : 1/);
    assert.doesNotMatch(source, /scaleY: shouldMorph \? 1\.1 : 1/);
    assert.match(source, /scaleX: shouldMorph \? 1\.08 : 1/);
    assert.doesNotMatch(source, /hover:-translate-y-1/);
    assert.doesNotMatch(source, /y: shouldMorph \? -?\d+ : 0/);
    assert.match(source, /<clipPath id=\{clipPathId\}>/);
    assert.match(source, /href=\{imageUrl\}/);
    assert.match(source, /preserveAspectRatio="xMidYMid slice"/);
    assert.match(source, /motion-reduce:transition-none/);
    assert.doesNotMatch(source, /function GiftBoxCover/);
    assert.doesNotMatch(source, /clipPathUnits="objectBoundingBox"/);
    assert.match(source, /song-waveform-bar/);
    assert.match(source, /md:grid-cols-2/);
    assert.match(source, /before:bg-gradient-to-b/);
    assert.match(source, /Title: \{lyricTitle\}/);
    assert.match(source, /renderVersionAction/);
    assert.match(source, /bottomCta/);
  });

  test("sample player uses shared result UI while keeping sample flows", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/SampleSongPlayer.tsx"),
      "utf8",
    );

    assert.match(source, /SongResultView/);
    assert.match(source, /statusBanner=\{statusBanner\}/);
    assert.match(source, /disabled: Boolean\(data\.isExpired \|\| !songVersion\?\.audioUrl\)/);
    assert.match(source, /This sample has expired\./);
    assert.match(source, /regenerateHref/);
    assert.match(source, /Change your inputs & recreate/);
    assert.match(source, /Recreate/);
    assert.match(source, /const providerVersionId = songVersion\?\.id \|\| v/);
    assert.match(source, /finalizedVersion\.songUrl/);
    assert.match(
      source,
      /setSelectedProviderVersionForPaywall\(providerVersionId\)/,
    );
    assert.match(
      source,
      /selectedProviderVersionForPaywall \|\|\s*selectedVersionForPaywall/,
    );
    assert.match(source, /returnTo: `\/samples\/\$\{data\.songId\}`/);
  });

  test("choice cards use 3d parallax instead of pointer-follow translation", () => {
    const uiSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/wizard-ui.tsx",
      ),
      "utf8",
    );

    assert.match(uiSource, /const rotateX = useMotionValue\(0\)/);
    assert.match(uiSource, /const rotateY = useMotionValue\(0\)/);
    assert.match(uiSource, /transformPerspective: 760/);
    assert.match(uiSource, /transformStyle: "preserve-3d"/);
    assert.match(
      uiSource,
      /style=\{\{ x: springContentX, y: springContentY, z: 34 \}\}/,
    );
    assert.doesNotMatch(uiSource, /const motionX = useMotionValue\(0\)/);
    assert.doesNotMatch(uiSource, /style=\{\{ x: springX, y: springY \}\}/);
  });

  test("genre recommendations render separately and collapse more styles", () => {
    const styleStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/StyleStep.tsx",
      ),
      "utf8",
    );

    assert.match(styleStepSource, /recommendedGenres = occasion/);
    assert.match(styleStepSource, /selectedOccasionTitle\} Recommendations/);
    assert.match(
      styleStepSource,
      /const \[showMoreGenres, setShowMoreGenres\]/,
    );
    assert.match(styleStepSource, /const showOtherGenres =/);
    assert.match(styleStepSource, /aria-expanded=\{showOtherGenres\}/);
    assert.match(
      styleStepSource,
      /setShowMoreGenres\(\(current\) => !current\)/,
    );
    assert.match(styleStepSource, /More styles/);
    assert.doesNotMatch(styleStepSource, /Recommended for this occasion/);
    assert.doesNotMatch(styleStepSource, /May not fit this occasion/);
    assert.doesNotMatch(styleStepSource, /badge=\{/);
  });

  test("early song wizard choices use pointer cursors and hover feedback", () => {
    const uiSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/wizard-ui.tsx",
      ),
      "utf8",
    );
    const recipientStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/RecipientStep.tsx",
      ),
      "utf8",
    );
    const styleStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/StyleStep.tsx",
      ),
      "utf8",
    );

    assert.match(uiSource, /min-h-28 cursor-pointer/);
    assert.match(uiSource, /inline-flex cursor-pointer items-center/);
    assert.match(
      recipientStepSource,
      /inline-flex cursor-pointer items-center/,
    );
    assert.match(recipientStepSource, /cursor-pointer rounded-full border/);
    assert.match(styleStepSource, /inline-flex cursor-pointer items-center/);
    assert.match(styleStepSource, /hover:bg-primary\/10 hover:shadow-sm/);
    assert.match(styleStepSource, /cursor-pointer rounded-full px-4 py-2/);
  });

  test("story detail tip inserts highlighted templates", () => {
    const storyStepSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/steps/StoryStep.tsx",
      ),
      "utf8",
    );

    assert.match(storyStepSource, /detailTemplates/);
    assert.match(storyStepSource, /\[Nickname: \]/);
    assert.match(storyStepSource, /\[Remember when we: \]/);
    assert.match(storyStepSource, /\[Their funny habit\/quirk: \]/);
    assert.match(storyStepSource, /\[Something they are proud of: \]/);
    assert.match(storyStepSource, /Click words to use templates/);
    assert.match(storyStepSource, /insertTemplate\(template\.text\)/);
    assert.match(storyStepSource, /underline decoration-primary/);
  });

  test("story helper generates a GPT story with local fallback", () => {
    const wizardSource = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );
    const apiSource = readFileSync(
      join(process.cwd(), "components/song/custom-song-wizard/api.ts"),
      "utf8",
    );
    const routeSource = readFileSync(
      join(process.cwd(), "app/api/songs/story/route.ts"),
      "utf8",
    );
    const uiSource = readFileSync(
      join(
        process.cwd(),
        "components/song/custom-song-wizard/components/wizard-ui.tsx",
      ),
      "utf8",
    );

    assert.match(apiSource, /export async function generateStoryFromHelper/);
    assert.match(apiSource, /fetch\("\/api\/songs\/story"/);
    assert.match(apiSource, /sourceStory\?: string/);
    assert.match(routeSource, /generateSongStory/);
    assert.match(routeSource, /answers: z\.array/);
    assert.match(routeSource, /sourceStory: z\.string/);
    assert.match(uiSource, /AI is writing your story/);
    assert.match(uiSource, /lyric-ready story brief/);
    assert.match(wizardSource, /isPolishingStory/);
    assert.match(wizardSource, /polishStoryWithAi/);
    assert.match(wizardSource, /generateStoryFromHelper\(\{/);
    assert.match(wizardSource, /sourceStory: story/);
    assert.match(wizardSource, /question: storyHelperSteps\[index\]\?\.question/);
    assert.match(wizardSource, /setStory\(generatedStory\.story\)/);
    assert.match(wizardSource, /composeStoryFromHelper\(storyHelperAnswers\)/);
    assert.match(wizardSource, /onPolishStory=\{polishStoryWithAi\}/);
    assert.match(wizardSource, /isPolishingStory=\{isPolishingStory\}/);
    assert.match(wizardSource, /toast\.info\(/);
  });
});
