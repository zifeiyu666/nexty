import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("WallArtEditorDrawer", () => {
  test("exposes reusable song options and an empty studio state", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /export type WallArtSongOption = \{/);
    assert.match(source, /initialSong\?: WallArtSongOption;/);
    assert.match(source, /songOptions\?: WallArtSongOption\[\];/);
    assert.match(source, /const hasSongs = selectableSongs\.length > 0;/);
    assert.match(source, /disabled=\{!hasSongs\}/);
    assert.match(source, /Create a song first/);
    assert.match(source, /<Link href="\/create-song">Create Song<\/Link>/);
    assert.doesNotMatch(source, /selectableSongs\.length > 1/);
  });

  test("rebuilds template settings when selecting a different song", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /function handleSongSelection\(nextSongId: string\)/);
    assert.match(
      source,
      /createWallArtTemplateSettingsMap\(\s*nextSong\.title,\s*nextSong\.lyrics,\s*\)/,
    );
    assert.match(source, /setSelectedSongId\(nextSong\.id\)/);
    assert.match(source, /applyTemplateSettings\(nextTemplateSettings\[activeTemplate\]\)/);
  });

  test("keeps song select items padded away from the right edge", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );
    const primitiveSource = readFileSync(
      join(process.cwd(), "components/song/StudioGlassPrimitives.tsx"),
      "utf8",
    );

    assert.match(source, /studioGlassStyles\.selectContentItems/);
    assert.match(primitiveSource, /\[&_\[data-slot=select-item\]\]:pr-11/);
    assert.match(primitiveSource, /\[&_\[data-slot=select-item\]>span:first-child\]:right-4/);
    assert.match(source, /max-w-\[200px\] truncate lg:max-w-\[232px\]/);
  });

  test("uses a circular glass close button in the studio header", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );
    const primitiveSource = readFileSync(
      join(process.cwd(), "components/song/StudioGlassPrimitives.tsx"),
      "utf8",
    );

    assert.match(source, /closeLabel="Close wall art studio"/);
    assert.match(source, /<StudioHeader/);
    assert.match(primitiveSource, /className="group flex size-9 shrink-0 items-center justify-center rounded-full/);
    assert.match(primitiveSource, /group-hover:rotate-90/);
  });

  test("puts text content editing first in the text layer panel", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    const textLayerIndex = source.indexOf("Text layer");

    assert.notEqual(textLayerIndex, -1, "Text layer heading should exist");
    assert.ok(
      textLayerIndex < source.indexOf("<FontSelect", textLayerIndex),
      "Text layer content editor should appear before font controls",
    );
    assert.ok(
      textLayerIndex < source.indexOf('label="Move X"', textLayerIndex),
      "Text layer content editor should appear before position controls",
    );
    assert.ok(
      textLayerIndex < source.indexOf('label="Text color"', textLayerIndex),
      "Text layer content editor should appear before color controls",
    );
  });

  test("supports adding draggable custom text layers with rotation controls", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Add text/);
    assert.match(source, /customTexts/);
    assert.match(source, /data-custom-text-layer/);
    assert.match(source, /handleCustomTextPointerDown\(event, layer\)/);
    assert.match(source, /label="Rotate"/);
  });

  test("keeps frame rendering out of the right-side edit targets", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /\["frame", "Frame"\]/);
    assert.doesNotMatch(source, /activeTarget === "frame"/);
    assert.doesNotMatch(source, /setActiveTarget\("frame"\)/);
    assert.doesNotMatch(source, /Frame color|Frame width/);
  });

  test("renders a slimmer preview wood frame", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /frameWidth: 24,/);
    assert.match(source, /id=\{`\$\{spiralId\}-wood-base`\}/);
    assert.match(source, /strokeWidth=\{Math\.max\(4, Math\.round\(frameWidth \* 0\.28\)\)\}/);
    assert.doesNotMatch(source, /strokeWidth="10"/);
  });

  test("uses a circular crop flow for disc artwork uploads", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /target: "lyrics" \| "disc";/);
    assert.match(source, /const discArtworkUploadInputId = `\$\{template2Id\}-disc-artwork-upload`;/);
    assert.match(source, /openImageCropDraft\(file, "disc"\)/);
    assert.match(source, /imageCropDraft\.target === "disc"/);
    assert.match(source, /Crop disc artwork/);
    assert.match(source, /rounded-full/);
    assert.match(source, /setUploadedImage\(dataUrl\)/);
    assert.match(source, /setUseCover\(true\)/);
    assert.match(source, /htmlFor=\{discArtworkUploadInputId\}/);
    assert.match(source, /Replace artwork/);
    assert.doesNotMatch(
      source,
      /className=\{wallArtFieldClassName\}\s*type="file"\s*onChange=\{\(event\) =>\s*handleImageUpload/,
      "Disc artwork upload should use the visual crop-card interaction instead of a visible native file input.",
    );
  });

  test("uses lyric portrait hover presets as source image defaults", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /const lyricPortraitPresetImages = Array\.from\(\{ length: 4 \}/);
    assert.match(
      source,
      /src: `\/wallart\/color_preset\/lytric_fill_template\/color_preset\$\{index \+ 1\}\.png`/,
    );
    assert.match(
      source,
      /originSrc: `\/wallart\/color_preset\/lytric_fill_template\/color_preset_origin\$\{index \+ 1\}\.jpg`/,
    );
    assert.match(source, /imageLyricPresetIndex: number;/);
    assert.match(
      source,
      /imageLyricUploadedImage:\s*template === "imageLyrics"\s*\?\s*\(lyricPortraitPresetImages\[0\]\?\.originSrc \?\? ""\)\s*:\s*""/,
    );
    assert.match(source, /function applyImageLyricPreset\(index: number\)/);
    assert.match(source, /setImageLyricUploadedImage\(preset\.originSrc\)/);
    assert.match(source, /lyricPortraitPresetImages\.map\(\(preset, index\) =>/);
    assert.match(
      source,
      /switchTemplate\("imageLyrics"\);[\s\S]*applyImageLyricPreset\(index\);/,
    );
  });

  test("keeps template preset panels open while moving from template to panel", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/WallArtEditorDrawer.tsx"),
      "utf8",
    );
    const primitiveSource = readFileSync(
      join(process.cwd(), "components/song/StudioGlassPrimitives.tsx"),
      "utf8",
    );

    assert.match(
      source,
      /type PresetPanelKey = "imageLyrics" \| "template2" \| "spiral";/,
    );
    assert.match(
      source,
      /const presetPanelCloseTimeoutRef = useRef<number \| null>\(null\);/,
    );
    assert.match(
      source,
      /const \[openPresetPanel, setOpenPresetPanel\] =\s*useState<PresetPanelKey \| null>\(null\);/,
    );
    assert.match(source, /function keepPresetPanelOpen\(panel: PresetPanelKey\)/);
    assert.match(source, /function openTemplatePresetPanel\(/);
    assert.match(source, /function closePresetPanelImmediately\(\)/);
    assert.match(source, /function schedulePresetPanelClose\(\)/);
    assert.match(source, /createPortal\(/);
    assert.match(source, /document\.body/);
    assert.match(
      source,
      /const presetHoverBridgeClassName =\s*"fixed z-\[140\] hidden opacity-0"/,
    );
    assert.match(source, /const PRESET_PANEL_WIDTH = 220;/);
    assert.match(source, /const PRESET_PANEL_GAP = 10;/);
    assert.match(source, /getBoundingClientRect\(\)/);
    assert.match(source, /setPresetPanelPosition\(\{/);
    assert.match(source, /left: presetPanelPosition\.left/);
    assert.match(source, /rect\.top \+ rect\.height \/ 2 - panelHeight \/ 2/);
    assert.match(source, /top: presetPanelPosition\.bridgeTop/);
    assert.match(source, /height: presetPanelPosition\.panelHeight/);
    assert.match(source, /data-wall-art-preset-panel="true"/);
    assert.match(source, /onPointerDownOutside=\{\(event\) => \{/);
    assert.match(source, /target\.closest\("\[data-wall-art-preset-panel\]"\)/);
    assert.doesNotMatch(
      source,
      /className="block bg-white\/72 px-2 py-1\.5 text-\[10px\] font-bold text-\[#342a23\]"/,
      "Preset thumbnails should not render text labels below the images.",
    );
    assert.match(
      source,
      /width: Math\.max\(\s*0,\s*presetPanelPosition\.left - presetPanelPosition\.bridgeLeft,/,
    );
    assert.equal(
      source.match(/className=\{cn\(\s*presetHoverBridgeClassName,/g)?.length,
      1,
      "Preset panel hover bridge should be rendered once outside the scrolling template rail.",
    );
    assert.match(source, /"pointer-events-auto block"/);
    assert.match(source, /"pointer-events-none"/);
    assert.match(source, /"pointer-events-auto block opacity-100"/);
    assert.match(source, /"pointer-events-none opacity-0"/);
    assert.match(source, /openTemplatePresetPanel\("imageLyrics", event\)/);
    assert.match(source, /openTemplatePresetPanel\("template2", event\)/);
    assert.match(source, /openTemplatePresetPanel\("spiral", event\)/);
    const heartLyricIndex = source.indexOf('alt="Heart lyric"');
    const recordPosterIndex = source.indexOf('"Record poster"');
    const heartCardStart = source.lastIndexOf(
      "onMouseEnter={closePresetPanelImmediately}",
      heartLyricIndex,
    );
    const heartCardEnd = source.indexOf(
      'openTemplatePresetPanel("template2", event)',
      heartLyricIndex,
    );
    const recordCardStart = source.lastIndexOf(
      'openTemplatePresetPanel("template2", event)',
      recordPosterIndex,
    );
    assert.notEqual(
      heartCardStart,
      -1,
      "Heart Lyric should explicitly close any open preset panel.",
    );
    assert.equal(
      source
        .slice(heartCardStart, heartCardEnd)
        .includes('openTemplatePresetPanel("template2"'),
      false,
      "Heart Lyric should not open the Record Poster preset panel.",
    );
    assert.match(
      source.slice(recordCardStart, recordPosterIndex),
      /openTemplatePresetPanel\("template2", event\)/,
      "Record Poster should own the template2 preset hover.",
    );
    assert.doesNotMatch(source, />Lyric Portrait<\/p>/);
    assert.doesNotMatch(source, />Heart Lyric<\/p>/);
    assert.doesNotMatch(source, />Record Poster<\/p>/);
    assert.doesNotMatch(source, />Spiral Record<\/p>/);
    assert.doesNotMatch(source, /Hover to switch portrait presets\./);
    assert.doesNotMatch(source, /Hover to switch color presets\./);
    assert.doesNotMatch(source, /Heart-shaped lyric template\./);
    assert.doesNotMatch(source, /wallArtTemplateActiveBadgeClassName/);
    assert.match(source, /lg:grid-cols-\[148px_minmax\(0,1fr\)_280px\]/);
    assert.match(source, /wallArtTemplateThumbClassName = studioGlassStyles\.templateThumb/);
    assert.match(primitiveSource, /"aspect-\[3\/4\] max-h-\[8\.5rem\] w-full overflow-hidden/);
    assert.match(
      source,
      /"relative z-30 flex min-h-0 flex-col p-1\.5"/,
      "Template rail should sit above the preview stacking context.",
    );
    assert.match(
      source,
      /<section className="relative z-0 min-h-0 overflow-visible py-0\.5">/,
      "Preview section should not cover the preset panel.",
    );
    assert.match(source, /onMouseLeave=\{schedulePresetPanelClose\}/);
    assert.match(source, /openPresetPanel === "imageLyrics"/);
    assert.match(source, /openPresetPanel === "template2"/);
    assert.match(source, /openPresetPanel === "spiral"/);
    assert.doesNotMatch(
      source,
      /group-hover:visible group-hover:opacity-100/,
      "Preset panels should not depend only on CSS group-hover.",
    );
  });
});
