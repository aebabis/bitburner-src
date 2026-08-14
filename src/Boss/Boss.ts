import type { MeetingBonuses } from "@nsdefs";

import { CONSTANTS } from "../Constants";
import { newBonuses } from "./bonuses";
import { DAY_END, DAY_START, MEETINGS_PER_LEVEL } from "./Constants";
import { generateMeetingsDay, type RoundState } from "./meetingRound";
import type { PromisePair } from "../Types/Promises";

/** How long a calendar stays up before its rewards lock in and a fresh one replaces it. */
export const ROUND_LENGTH_MS = 30_000;

/** Resolved at every rollover, so scripts can sleep until the next calendar instead of polling. */
export const BossPromise: PromisePair<number> = { promise: null, resolve: null };

/**
 * The scheduling puzzle's global state.
 *
 * Represents the current cycle's calendar and the currently applied multipliers
 * which are determined by meetings RSVPed during the previous cycle.
 */
class BossState {
  /** The current calendar and RSVP state */
  round: RoundState;
  /** Milliseconds of game time elapsed in the current round. */
  roundElapsedMs = 0;
  /** Rewards locked in at the last rollover. The current work multipliers */
  appliedBonuses: MeetingBonuses = newBonuses(1);
  /** Difficulty based on player's career track position */
  level = 1;

  constructor() {
    this.round = this.generateRound();
  }

  generateRound(): RoundState {
    return generateMeetingsDay(DAY_START, DAY_END, MEETINGS_PER_LEVEL * this.level);
  }

  /** Rewards the current RSVPs would lock in at the next rollover. */
  get pendingBonuses(): MeetingBonuses {
    return this.round.mults;
  }

  /** How far through the current round we are, 0 to 1. */
  get roundProgress(): number {
    return Math.min(1, this.roundElapsedMs / ROUND_LENGTH_MS);
  }

  /** Milliseconds of game time until the next rollover. */
  get timeUntilRollover(): number {
    return Math.max(0, ROUND_LENGTH_MS - this.roundElapsedMs);
  }

  /** Advances timer and starts a new round if the current one is done */
  process(numCycles: number): void {
    this.roundElapsedMs += numCycles * CONSTANTS.MilliPerCycle;
    if (this.roundElapsedMs < ROUND_LENGTH_MS) return;
    this.rollover();
  }

  /**
   * Ends the round, applying the current calendar's bonus for the next round
   * and creating a new calendar that takes its place.
   */
  rollover(): void {
    this.appliedBonuses = this.round.mults;
    this.round = this.generateRound();
    this.roundElapsedMs = 0;

    if (BossPromise.resolve) {
      BossPromise.resolve(ROUND_LENGTH_MS);
      BossPromise.resolve = null;
      BossPromise.promise = null;
    }
  }

  /** Sets difficultly level of puzzle and resets the calendar */
  setLevel(level: number): void {
    this.level = Math.max(1, Math.floor(level));
    this.reset();
  }

  /** Starts over from scratch, discarding both pending and applied rewards. */
  reset(): void {
    this.appliedBonuses = newBonuses(1);
    this.round = this.generateRound();
    this.roundElapsedMs = 0;
  }
}

export const Boss = new BossState();
