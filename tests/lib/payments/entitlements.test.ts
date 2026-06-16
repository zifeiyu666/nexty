import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  addEntitlements,
  deductEntitlementFromBalances,
  emptyEntitlements,
  normalizeEntitlements,
  revokeEntitlements,
  type EntitlementBalances,
} from "../../../lib/payments/entitlements";

describe("entitlement balances", () => {
  test("normalizes missing and invalid entitlement values to zero", () => {
    assert.deepEqual(
      normalizeEntitlements({
        song: 3,
        mv: "2",
        wallArt: -1,
        ignored: 99,
      }),
      {
        song: 3,
        mv: 2,
        wallArt: 0,
      }
    );
  });

  test("adds one-time entitlements without changing subscription balances", () => {
    const balances: EntitlementBalances = {
      subscription: { song: 1, mv: 2, wallArt: 3 },
      oneTime: { song: 0, mv: 1, wallArt: 0 },
    };

    assert.deepEqual(addEntitlements(balances, "oneTime", { song: 2, wallArt: 4 }), {
      subscription: { song: 1, mv: 2, wallArt: 3 },
      oneTime: { song: 2, mv: 1, wallArt: 4 },
    });
  });

  test("deducts subscription balance before one-time balance", () => {
    const result = deductEntitlementFromBalances(
      {
        subscription: { song: 1, mv: 0, wallArt: 0 },
        oneTime: { song: 2, mv: 0, wallArt: 0 },
      },
      "song",
      2
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.balances, {
      subscription: { song: 0, mv: 0, wallArt: 0 },
      oneTime: { song: 1, mv: 0, wallArt: 0 },
    });
    assert.deepEqual(result.delta, {
      subscription: { song: -1, mv: 0, wallArt: 0 },
      oneTime: { song: -1, mv: 0, wallArt: 0 },
    });
  });

  test("does not mutate balances when a deduction is insufficient", () => {
    const balances: EntitlementBalances = {
      subscription: emptyEntitlements(),
      oneTime: { song: 1, mv: 0, wallArt: 0 },
    };

    const result = deductEntitlementFromBalances(balances, "song", 2);

    assert.equal(result.success, false);
    assert.deepEqual(result.balances, balances);
  });

  test("revokes proportionally from available one-time balances", () => {
    assert.deepEqual(
      revokeEntitlements(
        {
          subscription: { song: 3, mv: 0, wallArt: 0 },
          oneTime: { song: 2, mv: 1, wallArt: 0 },
        },
        "oneTime",
        { song: 4, mv: 1 }
      ),
      {
        balances: {
          subscription: { song: 3, mv: 0, wallArt: 0 },
          oneTime: { song: 0, mv: 0, wallArt: 0 },
        },
        revoked: { song: 2, mv: 1, wallArt: 0 },
      }
    );
  });
});
