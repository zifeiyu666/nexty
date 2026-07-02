import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("MusicVideoEditorDrawer", () => {
  test("exposes the three-panel music video studio surface", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Music Video Studio/);
    assert.match(source, /Templates/);
    assert.match(source, /Remotion Preview/);
    assert.match(source, /Media Assets/);
    assert.match(source, /Lyrics Storyline/);
    assert.match(source, /Generate Video/);
    assert.match(source, /StudioHeader/);
    assert.match(source, /StudioBlurBackdrop/);
    assert.match(source, /studioGlassStyles/);
  });

  test("supports reusable song options from pricing and switches active songs", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /export type MusicVideoSongOption = \{/);
    assert.match(source, /initialSong\?: MusicVideoSongOption;/);
    assert.match(source, /songOptions\?: MusicVideoSongOption\[\];/);
    assert.match(source, /const selectableSongs = useMemo/);
    assert.match(source, /const hasSongs = selectableSongs\.length > 0;/);
    assert.match(source, /aria-label="Choose song"/);
    assert.match(source, /disabled=\{!hasSongs\}/);
    assert.match(source, /function handleSongSelection\(nextSongId: string\)/);
    assert.match(source, /setSelectedSongId\(nextSong\.id\)/);
    assert.match(source, /const resetSongScopedState = useCallback/);
    assert.match(source, /setPhotos\(\[\]\)/);
    assert.match(source, /setLatestVideo\(null\)/);
  });

  test("turns the upload area into media and lyrics configuration tabs", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /PhotoUploadLyricsTabs/);
    assert.match(source, /TabsTrigger[\s\S]*value="photos"/);
    assert.match(source, /TabsTrigger[\s\S]*value="lyrics"/);
    assert.match(source, /TabsTrigger[\s\S]*value="overlay"/);
    assert.match(source, /Media/);
    assert.match(source, /Lyrics/);
    assert.match(source, /FX/);
    assert.match(source, /PhotoUploadPool/);
  });

  test("adds atmosphere overlay controls from bundled overlay videos", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /ATMOSPHERE_OVERLAY_OPTIONS/);
    assert.match(source, /atmosphereOverlay/);
    assert.match(source, /Atmosphere overlay/);
    assert.match(source, /No Overlay/);
    assert.match(source, /Overlay opacity/);
    assert.match(source, /overlayId/);
    assert.match(source, /buildPhotoSlideshowTimeline\(\{[\s\S]*atmosphereOverlay,/);
  });

  test("adds Remotion-safe lyric style controls from the WallArt font set", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /wallArtFonts/);
    assert.match(source, /LyricsFontPicker/);
    assert.match(source, /function LyricsStyleSettings/);
    assert.match(source, /<LyricsStyleSettings/);
    assert.match(source, /label="Size"[\s\S]*max=\{120\}/);
    assert.match(source, /Text color/);
    assert.match(source, /Border color/);
    assert.match(source, /label="Border"[\s\S]*max=\{15\}/);
    assert.match(source, /Position/);
    assert.match(source, /Entrance/);
    assert.match(source, /Motion Blur Slip/);
    assert.match(source, /Staggered Glow Reveal/);
    assert.match(source, /Rolling Flow/);
    assert.match(source, /const lockCenterPosition = forceCenterPosition \|\| isRollingFlow/);
    assert.match(source, /disabled=\{lockCenterPosition\}/);
    assert.match(source, /handleFontListWheel/);
    assert.match(source, /onWheel=\{handleFontListWheel\}/);
  });

  test("passes lyric style settings into preview and render timelines", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const \[lyricsStyle, setLyricsStyle\]/);
    assert.match(source, /function handleChangeLyricsStyle/);
    assert.match(source, /lyricsStyle,/);
    assert.match(source, /onChangeLyricsStyle=\{handleChangeLyricsStyle\}/);
    assert.match(source, /buildPhotoSlideshowTimeline\(\{[\s\S]*lyricsStyle,/);
  });

  test("uses Remotion Player and exposes completed video download", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /@remotion\/player/);
    assert.match(source, /PhotoSlideshowComposition/);
    assert.match(source, /Download MP4/);
    assert.match(source, /Download Now \(Temporary\)/);
    assert.match(source, /Saving permanent copy/);
  });

  test("lets users drag the preview progress bar to seek", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function handleSeek/);
    assert.match(source, /const targetFrame = Math\.round\(safeTime \* PHOTO_SLIDESHOW_FPS\);/);
    assert.match(source, /player\.seekTo\(targetFrame\)/);
    assert.match(source, /type="range"/);
    assert.match(source, /aria-label="Seek music video preview"/);
    assert.doesNotMatch(source, /const \[currentTime, setCurrentTime\]/);
    assert.match(source, /const \[previewTime, setPreviewTime\]/);
  });

  test("keeps Remotion Player input props stable during passive playback", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const playerInputProps = useMemo\(\(\) => \(\{ timeline \}\), \[timeline\]\);/);
    assert.match(source, /inputProps=\{playerInputProps\}/);
    assert.doesNotMatch(source, /inputProps=\{\{ timeline \}\}/);
  });

  test("throttles passive preview progress updates to avoid audio resync churn", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const PREVIEW_TIME_UPDATE_INTERVAL_SECONDS = 0\.25;/);
    assert.match(
      source,
      /Math\.abs\(safeTime - lastPreviewTimeRef\.current\) <[\s\S]*PREVIEW_TIME_UPDATE_INTERVAL_SECONDS/,
    );
  });

  test("lets users switch the preview between 9:16 and 16:9", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /type PreviewAspectRatio = "portrait" \| "landscape"/);
    assert.match(source, /const \[previewAspectRatio, setPreviewAspectRatio\]/);
    assert.match(source, /useState<PreviewAspectRatio>\("landscape"\)/);
    assert.match(source, /aria-label="Switch preview aspect ratio"/);
    assert.match(source, /9:16/);
    assert.match(source, /16:9/);
    assert.match(source, /compositionHeight=\{previewDimensions\.height\}/);
    assert.match(source, /compositionWidth=\{previewDimensions\.width\}/);
    assert.match(source, /key=\{`\$\{timeline\.templateId\}-\$\{previewDimensions\.label\}`\}/);
    assert.match(source, /onToggleAspectRatio/);
    assert.match(source, /const renderDimensions = previewAspectRatioOptions\[previewAspectRatio\]/);
    assert.match(source, /dimensions: renderDimensions/);
    assert.match(source, /height: renderDimensions\.height/);
    assert.match(source, /width: renderDimensions\.width/);
  });

  test("places video generation in the preview header controls", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(
      source,
      /<div className="flex shrink-0 flex-wrap items-center gap-1\.5">[\s\S]*Generate Video[\s\S]*aria-label="Switch preview aspect ratio"[\s\S]*onClick=\{togglePlayback\}/,
    );
  });

  test("uploads image and video media assets to R2 before starting a Lambda render", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /\/mv\/assets\/presign/);
    assert.match(source, /presignedUrl/);
    assert.match(source, /video\/mp4/);
    assert.match(source, /video\/quicktime/);
    assert.match(source, /video\/webm/);
    assert.match(source, /video\/x-m4v/);
    assert.match(source, /getUploadedMediaType/);
    assert.match(source, /<video/);
    assert.match(source, /\/mv\/render/);
    assert.match(source, /\/api\/musicvideos\/\$\{videoId\}\/refresh/);
  });

  test("ships photo slideshow, minimal vinyl, and wave radio as editable templates", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Photo Stream Memory Slideshow/);
    assert.match(source, /Minimal Vinyl Record/);
    assert.match(source, /Dynamic Lyrics Video/);
    assert.match(source, /WaveRadioComposition/);
    assert.match(source, /buildWaveRadioTimeline/);
    assert.match(source, /WaveRadioEditor/);
    assert.match(source, /onChangeLyricsStyle/);
    assert.match(source, /forceCenterPosition/);
    assert.match(source, /WAVE_RADIO_BACKGROUND_OPTIONS/);
    assert.match(source, /waveRadioBackgroundId/);
    assert.match(source, /MinimalVinylComposition/);
    assert.match(source, /buildMinimalVinylTimeline/);
    assert.match(source, /data-minimal-vinyl-editor/);
    assert.doesNotMatch(source, /Vinyl Settings/);
    assert.doesNotMatch(source, /Lyric Roll/);
    assert.doesNotMatch(source, /Lyric Broadcast/);
  });

  test("uses the generated photo lyric MV image as the slideshow template demo", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /demoImageSrc/);
    assert.match(source, /aspect-\[4\/3\]/);
    assert.match(
      source,
      /\/images\/features\/photo-lyric-mv-template\.webp/,
    );
    assert.match(source, /Photo lyric MV template demo/);
  });

  test("uses the generated wave radio image as the dynamic template demo", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(
      source,
      /\/images\/features\/dynamic-wave-radio-template\.webp/,
    );
    assert.match(source, /Dynamic wave radio music visualizer template demo/);
  });

  test("keeps the right editor panel vertically scrollable", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /data-music-video-editor-scroll/);
    assert.match(source, /overflow-y-auto/);
  });

  test("pins uploaded media in a dedicated scrollable media rail", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /data-photo-media-rail/);
    assert.match(source, /data-photo-media-rail-scroll/);
    assert.match(source, /grid-cols-\[82px_minmax\(0,1fr\)\]/);
    assert.match(source, /xl:grid-cols-\[92px_minmax\(0,1fr\)\]/);
  });

  test("reserves room for the media rail scrollbar beside thumbnails", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /scrollbarGutter: "stable"/);
    assert.match(source, /space-y-1\.5 pb-2 pr-3/);
  });

  test("keeps narrow lyric cards inside the editor column after media upload", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /data-music-video-editor-main/);
    assert.match(source, /data-lyric-photo-card/);
    assert.match(source, /grid-cols-\[50px_minmax\(0,1fr\)\]/);
    assert.match(source, /text-balance/);
    assert.match(source, /text-pretty/);
  });

  test("softens inherited non-cover lyric media", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /isInheritedPhoto/);
    assert.match(source, /opacity-55 grayscale-\[35%\]/);
    assert.match(source, /resolvedPhoto && !resolvedPhoto\.isCover/);
  });

  test("lets the editor panel resize while truncating long text", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /editorWidth/);
    assert.match(source, /--music-video-editor-width/);
    assert.match(source, /data-music-video-editor-resizer/);
    assert.match(
      source,
      /lg:grid-cols-\[156px_minmax\(280px,1fr\)_minmax\(320px,var\(--music-video-editor-width\)\)\]/,
    );
    assert.match(
      source,
      /xl:grid-cols-\[164px_minmax\(320px,1fr\)_minmax\(340px,var\(--music-video-editor-width\)\)\]/,
    );
    assert.match(source, /MAX_EDITOR_VIEWPORT_RATIO/);
    assert.match(source, /getResponsiveEditorMaxWidth/);
    assert.match(source, /line-clamp-1/);
    assert.match(source, /truncate/);
  });

  test("shows the cover photo as a read-only default media item", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /coverPhoto/);
    assert.match(source, /data-cover-photo/);
    assert.match(source, /Cover/);
    assert.match(source, /isCover/);
  });

  test("allows the cover photo to be assigned to lyric cues", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /draggable=\{!photo\.isCover\}/);
    assert.doesNotMatch(source, /event\.preventDefault\(\);[\s\S]*?return;[\s\S]*?event\.dataTransfer\.setData\("text\/plain", photo\.id\)/);
    assert.doesNotMatch(source, /selectedPhotoId !== "song-artwork"/);
  });

  test("starts media drags from the visible thumbnail instead of the browser image drag", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function setPhotoDragData/);
    assert.match(source, /<button[\s\S]*draggable[\s\S]*onDragStart=\{\(event\) => setPhotoDragData\(event, photo\.id\)\}/);
    assert.match(source, /<img[\s\S]*draggable=\{false\}/);
  });

  test("adds a confirmed one-click movie action after media upload", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /canOneClickMovie/);
    assert.match(source, /photos\.length > 0/);
    assert.match(source, /Auto Movie/);
    assert.match(
      source,
      /Uploaded media assets will be distributed across[\s\S]*lyric change points/,
    );
    assert.match(source, /buildEvenPhotoAssignments\(\{ cues, photos \}\)/);
    assert.match(source, /buildRandomTransitionAssignments\(\{ cues \}\)/);
  });

  test("adds transition nodes with preview looping controls", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Transition Node/);
    assert.match(source, /Popover/);
    assert.match(source, /Cross Dissolve/);
    assert.match(source, /Motion Blur/);
    assert.match(source, /Light Leak/);
    assert.match(source, /Zoom In\/Out/);
    assert.match(source, /previewTransitionLoop/);
    assert.match(source, /seekTo/);
  });

  test("loops transition previews for one second before and after the cut", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const TRANSITION_PREVIEW_SECONDS = 1;/);
    assert.match(source, /const TRANSITION_PREVIEW_TAIL_SECONDS = 1;/);
  });

  test("clears transition preview looping when the preview is paused", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function handlePausePreview\(\)/);
    assert.match(
      source,
      /setIsPlaying\(false\);[\s\S]*setPreviewTransitionLoop\(null\);/,
    );
    assert.match(source, /onPause=\{handlePausePreview\}/);
  });

  test("does not restart transition preview playback on every progress update", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const onPlayRef = useRef\(onPlay\);/);
    assert.match(source, /onPlayRef\.current = onPlay;/);
    assert.match(
      source,
      /player\.seekTo\(previewTransitionLoop\.startFrame\);[\s\S]*player\.play\(\);[\s\S]*onPlayRef\.current\(\);[\s\S]*}, \[previewTransitionLoop\]\);/,
    );
  });

  test("does not seek the preview when hovering transition options", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /onMouseEnter=\{\(\) => onPreviewTransition\(toCueId\)\}/);
  });

  test("resets preview playback when switching editable templates", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function handleSelectTemplate\(template: TemplateCard\)/);
    assert.match(
      source,
      /setPreviewTransitionLoop\(null\);[\s\S]*setIsPlaying\(false\);[\s\S]*setActiveTemplate\(template\.id\);/,
    );
    assert.match(source, /key=\{`\$\{timeline\.templateId\}-\$\{previewDimensions\.label\}`\}/);
  });

  test("logs concrete render failures to the browser console", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function logMusicVideoRenderError/);
    assert.match(source, /console\.error\("\[MusicVideoEditorDrawer\] Render failed"/);
    assert.match(
      source,
      /console\.error\([\s\S]*"\[MusicVideoEditorDrawer\] Render status refresh failed"/,
    );
    assert.match(source, /console\.error\("\[MusicVideoEditorDrawer\] Failed to start render"/);
  });
});
