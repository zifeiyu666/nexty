import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("WallArtEditorDrawer", () => {
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
});
