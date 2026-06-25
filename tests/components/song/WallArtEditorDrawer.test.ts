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
    assert.match(source, /function schedulePresetPanelClose\(\)/);
    assert.match(
      source,
      /const presetHoverBridgeClassName =\s*"fixed left-\[176px\] top-\[110px\] z-40 h-\[calc\(100svh-126px\)\] w-\[28px\] opacity-0"/,
    );
    assert.equal(
      source.match(/className=\{cn\(\s*presetHoverBridgeClassName,/g)?.length,
      3,
      "Each preset-enabled template should use the wider hover bridge.",
    );
    assert.match(source, /"pointer-events-auto"/);
    assert.match(source, /"pointer-events-none"/);
    assert.match(source, /onMouseEnter=\{\(\) => keepPresetPanelOpen\("imageLyrics"\)\}/);
    assert.match(source, /onMouseEnter=\{\(\) => keepPresetPanelOpen\("template2"\)\}/);
    assert.match(source, /onMouseEnter=\{\(\) => keepPresetPanelOpen\("spiral"\)\}/);
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
