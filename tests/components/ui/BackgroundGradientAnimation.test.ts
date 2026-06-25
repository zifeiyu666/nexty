import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("background gradient animation component", () => {
  test("is installed in the shadcn ui directory with its demo", () => {
    const componentSource = readFileSync(
      join(process.cwd(), "components/ui/background-gradient-animation.tsx"),
      "utf8",
    );
    const demoSource = readFileSync(
      join(process.cwd(), "components/background-gradient-animation-demo.tsx"),
      "utf8",
    );

    assert.match(componentSource, /"use client";/);
    assert.match(componentSource, /export const BackgroundGradientAnimation/);
    assert.match(componentSource, /from "@\/lib\/utils"/);
    assert.match(componentSource, /animate-first/);
    assert.match(componentSource, /interactiveRef/);

    assert.match(
      demoSource,
      /import \{ BackgroundGradientAnimation \} from "@\/components\/ui\/background-gradient-animation";/,
    );
    assert.match(demoSource, /Gradients X Animations/);
  });

  test("registers the gradient animation classes in the global Tailwind theme", () => {
    const styles = readFileSync(
      join(process.cwd(), "styles/globals.css"),
      "utf8",
    );

    for (const animationName of [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
    ]) {
      assert.match(
        styles,
        new RegExp(`--animate-${animationName}: ${animationName} `),
      );
      assert.match(styles, new RegExp(`@keyframes ${animationName}`));
    }
  });
});
