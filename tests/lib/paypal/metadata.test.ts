import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  decodePayPalCustomId,
  encodePayPalCustomId,
} from "../../../lib/paypal/metadata";

describe("PayPal custom_id metadata", () => {
  test("encodes UUID metadata compactly while preserving unlock context", () => {
    const data = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      planId: "660e8400-e29b-41d4-a716-446655440001",
      submitProductId: null,
      paypalUnlock:
        "s:VQ6EAN7bzDuo3Fg29Y1JbA.cHJvdmlkZXItYXVkaW8tdmVyc2lvbi0x",
    };

    const customId = encodePayPalCustomId(data);

    assert.ok(customId.length <= 127);
    assert.deepEqual(decodePayPalCustomId(customId), data);
  });

  test("continues to decode legacy pipe-delimited custom ids", () => {
    assert.deepEqual(
      decodePayPalCustomId("user-1|plan-1||sample-1~provider-a"),
      {
        userId: "user-1",
        planId: "plan-1",
        submitProductId: null,
        paypalUnlock: "sample-1~provider-a",
      }
    );
  });
});
