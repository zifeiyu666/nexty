import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
    EXTERNAL_MARKDOWN_LINK_CLASS,
    getMarkdownLinkAttributes,
    INTERNAL_MARKDOWN_LINK_CLASS,
} from "../../../lib/cms/link-attributes";

describe("markdown link attributes", () => {
  test("styles internal links with the brand color", () => {
    assert.deepEqual(getMarkdownLinkAttributes("/create-song"), {
      className: INTERNAL_MARKDOWN_LINK_CLASS,
    });

    assert.deepEqual(
      getMarkdownLinkAttributes("https://sendthesong.io/pricing"),
      {
        className: INTERNAL_MARKDOWN_LINK_CLASS,
      },
    );
  });

  test("adds nofollow to ordinary external links", () => {
    const attributes = getMarkdownLinkAttributes("https://example.com");

    assert.equal(attributes.target, "_blank");
    assert.equal(attributes.className, EXTERNAL_MARKDOWN_LINK_CLASS);
    assert.match(String(attributes.rel), /\bnoopener\b/);
    assert.match(String(attributes.rel), /\bnoreferrer\b/);
    assert.match(String(attributes.rel), /\bnofollow\b/);
    assert.equal(String(attributes.className).includes("text-primary"), false);
  });

  test("preserves existing external-link rel tokens", () => {
    const attributes = getMarkdownLinkAttributes(
      "https://example.com",
      "sponsored",
    );

    assert.equal(attributes.target, "_blank");
    assert.equal(attributes.className, EXTERNAL_MARKDOWN_LINK_CLASS);
    assert.match(String(attributes.rel), /\bsponsored\b/);
    assert.match(String(attributes.rel), /\bnofollow\b/);
    assert.equal(String(attributes.className).includes("text-primary"), false);
  });

  test("neutralizes unsafe protocols", () => {
    assert.deepEqual(getMarkdownLinkAttributes("javascript:alert(1)"), {
      href: "#",
    });
  });
});
