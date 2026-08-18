import type { MeetingBonuses } from "@nsdefs";
import type { WorkStats } from "../Work/WorkStats";

/** The stats a meeting can grant a bonus to. */
export const BONUS_STATS = [
  "money",
  "reputation",
  "hackExp",
  "strExp",
  "defExp",
  "dexExp",
  "agiExp",
  "chaExp",
] as const;

export type BonusStat = (typeof BONUS_STATS)[number];

/** How many stats a single meeting spreads its budget across. */
const MIN_BONUS_STATS = 2;
const MAX_BONUS_STATS = 3;

/**
 * Constants for Polya urn. 3:1 ratio concentrates 70% of the bonuses in 3 stats.
 */
const AFFINITY_SEED = 1;
const AFFINITY_REINFORCEMENT = 3;

/**
 * A bonus record with every stat set to the same value.
 *
 * @param value - use 0 for a meeting's own additive bonuses, 1 for tabulated reward multipliers
 */
export function newBonuses(value = 0): MeetingBonuses {
  return {
    money: value,
    reputation: value,
    hackExp: value,
    strExp: value,
    defExp: value,
    dexExp: value,
    agiExp: value,
    chaExp: value,
  };
}

/**
 * Multiplies a WorkStats by calendar reward bonuses
 */
export function applyMeetingBonuses(stats: WorkStats, bonuses: MeetingBonuses): WorkStats {
  // Clamp product to 0 so penalty can never cause experience loss.
  const scale = (value: number, mult: number) => value * Math.max(0, mult);
  return {
    ...stats,
    money: scale(stats.money, bonuses.money),
    reputation: scale(stats.reputation, bonuses.reputation),
    hackExp: scale(stats.hackExp, bonuses.hackExp),
    strExp: scale(stats.strExp, bonuses.strExp),
    defExp: scale(stats.defExp, bonuses.defExp),
    dexExp: scale(stats.dexExp, bonuses.dexExp),
    agiExp: scale(stats.agiExp, bonuses.agiExp),
    chaExp: scale(stats.chaExp, bonuses.chaExp),
  };
}

/**
 * Adds `source` into `target`, in place.
 */
export function addBonuses(target: MeetingBonuses, source: MeetingBonuses): void {
  for (const stat of BONUS_STATS) {
    target[stat] += source[stat];
  }
}

/**
 * Create a set of bonuses for a single round's calendar.
 *
 * Uses Polya urn (draw-and-replace-with-extra-copies) to make each day favor different bonuses.
 *
 * @returns a function taking a meeting's total budget and returning its additive bonus record
 */
export function createBonusDrawer(): (budget: number) => MeetingBonuses {
  const affinity = newBonuses(AFFINITY_SEED);

  return function drawBonuses(budget: number): MeetingBonuses {
    const bonuses = newBonuses(0);
    const remaining: BonusStat[] = [...BONUS_STATS];
    const count = MIN_BONUS_STATS + Math.floor(Math.random() * (MAX_BONUS_STATS - MIN_BONUS_STATS + 1));

    const picked: BonusStat[] = [];
    for (let i = 0; i < count && remaining.length > 0; i++) {
      // Pick one of the remaining stats with probability proportional to its accumulated affinity.
      const totalAffinity = remaining.reduce((acc, stat) => acc + affinity[stat], 0);
      let roll = Math.random() * totalAffinity;
      let index = remaining.length - 1;
      for (let j = 0; j < remaining.length; j++) {
        roll -= affinity[remaining[j]];
        if (roll < 0) {
          index = j;
          break;
        }
      }
      picked.push(...remaining.splice(index, 1));
    }

    // Random weights, normalized so the meeting always pays out exactly `budget` in total.
    const weights = picked.map(() => Math.random() + 0.25);
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    picked.forEach((stat, i) => {
      bonuses[stat] = (budget * weights[i]) / totalWeight;
      affinity[stat] += AFFINITY_REINFORCEMENT;
    });

    return bonuses;
  };
}
