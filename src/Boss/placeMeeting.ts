import { Meeting, MeetingTitle, MeetingFixedBreaks } from "@nsdefs";
import { MAX_SIMULTANEOUS_MEETINGS } from "./meetingRound";
import { generateMeetingID, generateRandomTitle } from "./createNewMeeting";

type IStartEndTimes = Pick<Meeting, "startTime" | "finishTime">;
type Candidates = { start: number; freeSpots: number };
/** 15min increments (60/4) */
const BLOCKS_PER_HOUR = 4;
/** Possible meeting durations and their relative likelihood. */
const DURATION_WEIGHTS: { duration: number; weight: number }[] = [
  { duration: 4, weight: 1 },
  { duration: 3, weight: 2 },
  { duration: 2, weight: 4 },
  { duration: 1.5, weight: 3 },
  { duration: 1.25, weight: 6 },
  { duration: 1, weight: 5 },
  { duration: 0.75, weight: 5 },
  { duration: 0.5, weight: 6 },
  { duration: 0.25, weight: 10 },
];

/**
 * Min/max duration times for every title that is not a fixed break. In hour-decimals
 */
export const MEETING_DURATION_RANGES: Record<
  Exclude<MeetingTitle, MeetingFixedBreaks>,
  { min: number; max: number }
> = {
  "Slide Presentation": { min: 0.5, max: 2 },
  "Daily Standup": { min: 0.25, max: 0.5 },
  "Compliance Training": { min: 1, max: 2 },
  "Check Email": { min: 0.25, max: 0.5 },
  "Group Brainstorm Session": { min: 0.5, max: 1.5 },
  "Outline New Initiative": { min: 0.5, max: 1 },
  "Candidate Interview": { min: 0.5, max: 1 },
  "Software Demo": { min: 0.5, max: 1.5 },
};

/**
 * Fixed breaks durations. See {@link MEETING_DURATION_RANGES} as well.
 */
export const FIXED_BREAK_DURATIONS: Record<MeetingFixedBreaks, number> = {
  Lunch: 1,
  Recess: 0.25,
};

/**
 * Draws a random meeting duration weighted by DURATION_WEIGHTS. Depends on the range as well.
 *
 * @param range - the range the duration is bound to
 * @returns a duration in hours (e.g. 0.25, 1.5, 3)
 */
export function drawDuration(range: { min: number; max: number }): number {
  const validDurations = DURATION_WEIGHTS.filter((w) => w.duration >= range.min && w.duration <= range.max);

  const sum = validDurations.reduce((acc, w) => acc + w.weight, 0);
  const randomPoint = Math.random() * sum;

  let cumulative = 0;
  for (const d of validDurations) {
    cumulative += d.weight;
    if (randomPoint < cumulative) {
      return d.duration;
    }
  }
  // Keep linter from complaining
  return 0;
}

/**
 * Draws a random start time, on a quarter
 *
 * @param rangeStart - the time when the range starts
 * @param rangeEnd - the time when the range ends
 * @returns the random start time
 */
export function drawStartTime(rangeStart: number, rangeEnd: number): number {
  const availableBlocks = BLOCKS_PER_HOUR * (rangeEnd - rangeStart);
  const randomBlock = Math.floor(Math.random() * availableBlocks);
  return rangeStart + randomBlock / BLOCKS_PER_HOUR;
}

/**
 * Check how much meetings overlap in a single span
 *
 * @param meetings - the meetings to check for overlap
 * @returns the maximum overlap in this span
 */
export function getMaxOverlapInSpan(meetings: IStartEndTimes[]): number {
  const events: { time: number; delta: 1 | -1 }[] = [];
  for (const meeting of meetings) {
    events.push({ time: meeting.startTime, delta: 1 }, { time: meeting.finishTime, delta: -1 });
  }
  // Sort events by time, on a tie use -1 first
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time; // earlier time first
    return a.delta - b.delta; // endings before starts
  });

  let current = 0;
  let max = 0;
  for (const e of events) {
    current += e.delta;
    if (current > max) max = current;
  }
  return max;
}

/**
 * Find viable candidates to place meetings. See {@link pickRerollSpot} as well.
 *
 * @param meetings - the meetings to check for overlap
 * @param duration - duration of the meeting
 * @param rangeStart - the workday start
 * @param rangeEnd - the workday end
 * @returns all the avaliable candidates given the meeting's duration
 */
export function findRerollCandidates(
  meetings: Meeting[],
  duration: number,
  rangeStart: number,
  rangeEnd: number,
): Candidates[] {
  const availableBlocks = BLOCKS_PER_HOUR * (rangeEnd - rangeStart);
  const candidates: Candidates[] = [];
  for (let block = 0; block < availableBlocks; block++) {
    const candidateStart = rangeStart + block / BLOCKS_PER_HOUR;
    const candidateFinish = candidateStart + duration;
    const hypothetical: IStartEndTimes = { startTime: candidateStart, finishTime: candidateFinish };
    const overlap = getMaxOverlapInSpan([...meetings, hypothetical]);
    const freeSpots = MAX_SIMULTANEOUS_MEETINGS - overlap;
    if (freeSpots >= 1) candidates.push({ start: candidateStart, freeSpots });
  }
  return candidates;
}

/**
 * From the available candidates, pick one based on the remaining free zones in the span, i.e.
 * the less populated zones are much more likely to be selected. Using 2^freeSpots as formula.
 *
 * {@link findRerollCandidates} chooses the candidates avaliable, which are taken by this function and weighted.
 *
 * If candidates is an empty array, throws.
 *
 * @param candidates - the candidates to randomize
 * @returns a new meeting start time
 */
export function pickRerollSpot(candidates: Candidates[]): number {
  if (candidates.length === 0) throw new Error("Cannot pick a reroll spot with an empty candidates array.");
  const sum = candidates.reduce((acc, c) => acc + 2 ** c.freeSpots, 0);
  const randPoint = Math.random() * sum;
  let cumulative = 0;
  for (const c of candidates) {
    cumulative += 2 ** c.freeSpots;
    if (randPoint < cumulative) return c.start;
  }
  // Keep linter from complaining
  return 0;
}

export function createMeeting(
  { id = generateMeetingID(), title = generateRandomTitle() }: { id?: number; title?: MeetingTitle },
  { startTime, finishTime }: IStartEndTimes,
  { attendanceMults, nonAttendanceMults }: { attendanceMults: number; nonAttendanceMults?: number },
): Meeting {
  return {
    id: id,
    title: title,
    startTime: startTime,
    finishTime: finishTime,
    attendanceMults: attendanceMults,
    nonAttendanceMults: nonAttendanceMults,
  };
}

/**
 * Somehow fixes no-unsafe-assignment
 *
 * @param title - the meeting title to check
 * @returns a narrowed type (still don't understand how)
 */
export function isFixedBreak(title: MeetingTitle): title is MeetingFixedBreaks {
  return title in FIXED_BREAK_DURATIONS;
}
