export const ENTITLEMENT_KEYS = ["song", "mv", "wallArt"] as const;

export type EntitlementKey = (typeof ENTITLEMENT_KEYS)[number];
export type EntitlementMap = Record<EntitlementKey, number>;
export type EntitlementBucket = "subscription" | "oneTime";

export interface EntitlementBalances {
  subscription: EntitlementMap;
  oneTime: EntitlementMap;
}

export interface DeductEntitlementResult {
  success: boolean;
  balances: EntitlementBalances;
  delta: EntitlementBalances;
}

export function emptyEntitlements(): EntitlementMap {
  return {
    song: 0,
    mv: 0,
    wallArt: 0,
  };
}

function normalizeCount(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.floor(numeric);
}

export function normalizeEntitlements(input: unknown): EntitlementMap {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    song: normalizeCount(source.song),
    mv: normalizeCount(source.mv),
    wallArt: normalizeCount(source.wallArt),
  };
}

export function normalizeEntitlementBalances(input: unknown): EntitlementBalances {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    subscription: normalizeEntitlements(source.subscription),
    oneTime: normalizeEntitlements(source.oneTime),
  };
}

export function getPlanEntitlements(benefitsJsonb: unknown): EntitlementMap {
  const benefits = benefitsJsonb && typeof benefitsJsonb === "object"
    ? benefitsJsonb as Record<string, unknown>
    : {};
  return normalizeEntitlements(benefits.entitlements);
}

export function addEntitlements(
  balances: EntitlementBalances,
  bucket: EntitlementBucket,
  entitlements: Partial<Record<EntitlementKey, number>>
): EntitlementBalances {
  const normalized = normalizeEntitlements(entitlements);
  return {
    subscription: { ...balances.subscription },
    oneTime: { ...balances.oneTime },
    [bucket]: {
      ...balances[bucket],
      song: balances[bucket].song + normalized.song,
      mv: balances[bucket].mv + normalized.mv,
      wallArt: balances[bucket].wallArt + normalized.wallArt,
    },
  };
}

export function replaceEntitlements(
  balances: EntitlementBalances,
  bucket: EntitlementBucket,
  entitlements: unknown
): EntitlementBalances {
  return {
    subscription: { ...balances.subscription },
    oneTime: { ...balances.oneTime },
    [bucket]: normalizeEntitlements(entitlements),
  };
}

export function deductEntitlementFromBalances(
  balances: EntitlementBalances,
  entitlement: EntitlementKey,
  amount: number
): DeductEntitlementResult {
  const count = normalizeCount(amount);
  const currentTotal = balances.subscription[entitlement] + balances.oneTime[entitlement];
  const zeroDelta = {
    subscription: emptyEntitlements(),
    oneTime: emptyEntitlements(),
  };

  if (count <= 0 || currentTotal < count) {
    return {
      success: false,
      balances: {
        subscription: { ...balances.subscription },
        oneTime: { ...balances.oneTime },
      },
      delta: zeroDelta,
    };
  }

  const fromSubscription = Math.min(balances.subscription[entitlement], count);
  const fromOneTime = count - fromSubscription;

  const nextBalances = {
    subscription: { ...balances.subscription },
    oneTime: { ...balances.oneTime },
  };
  nextBalances.subscription[entitlement] -= fromSubscription;
  nextBalances.oneTime[entitlement] -= fromOneTime;

  const delta = zeroDelta;
  delta.subscription[entitlement] = -fromSubscription;
  delta.oneTime[entitlement] = -fromOneTime;

  return {
    success: true,
    balances: nextBalances,
    delta,
  };
}

export function revokeEntitlements(
  balances: EntitlementBalances,
  bucket: EntitlementBucket,
  entitlements: Partial<Record<EntitlementKey, number>>
): { balances: EntitlementBalances; revoked: EntitlementMap } {
  const requested = normalizeEntitlements(entitlements);
  const nextBalances = {
    subscription: { ...balances.subscription },
    oneTime: { ...balances.oneTime },
  };
  const revoked = emptyEntitlements();

  for (const key of ENTITLEMENT_KEYS) {
    const amount = Math.min(nextBalances[bucket][key], requested[key]);
    nextBalances[bucket][key] -= amount;
    revoked[key] = amount;
  }

  return { balances: nextBalances, revoked };
}

export function sumEntitlements(balances: EntitlementBalances): EntitlementMap {
  return {
    song: balances.subscription.song + balances.oneTime.song,
    mv: balances.subscription.mv + balances.oneTime.mv,
    wallArt: balances.subscription.wallArt + balances.oneTime.wallArt,
  };
}

export function hasAnyEntitlements(entitlements: EntitlementMap): boolean {
  return ENTITLEMENT_KEYS.some((key) => entitlements[key] > 0);
}
