import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getLocalizedRelationshipOptions,
  localizedRelationshipLabel,
} from "@/components/song/custom-song-wizard/i18n";

describe("relationship selector localization", () => {
  test("searches Japanese labels while preserving English values", () => {
    const options = getLocalizedRelationshipOptions("ja", "パートナー");

    assert.deepEqual(options, [{ value: "Partner", label: "パートナー" }]);
    assert.equal(
      localizedRelationshipLabel("ja", "Partner", "Partner"),
      "パートナー",
    );
  });

  test("searches Spanish labels case-insensitively", () => {
    const options = getLocalizedRelationshipOptions("es", "PAREJA");

    assert.deepEqual(options, [{ value: "Partner", label: "Pareja" }]);
  });

  test("also accepts the stable English value in localized interfaces", () => {
    const options = getLocalizedRelationshipOptions("ja", "partner");

    assert.deepEqual(options, [{ value: "Partner", label: "パートナー" }]);
  });
});
