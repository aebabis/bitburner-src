import { Player } from "@player";

/**
 * Tells whether the player has a job with a calendar to schedule.
 *
 * Currently includes all jobs for testing purposes. Will eventually
 * be gated behind job field and possibly BN/SF.
 */
export function hasCalendarAccess(): boolean {
  return Object.keys(Player.jobs).length > 0;
}
