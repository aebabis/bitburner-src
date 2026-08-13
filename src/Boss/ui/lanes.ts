import type { Meeting } from "@nsdefs";

const overlaps = (a: Meeting, b: Meeting): boolean => a.finishTime > b.startTime && a.startTime < b.finishTime;

/**
 * Packs meetings into columns so that no column holds two overlapping meetings.
 *
 * Purely a layout concern - the number of lanes carries no game meaning. Generation already caps
 * concurrent meetings at MAX_SIMULTANEOUS_MEETINGS, so this returns at most that many columns.
 */
export function splitIntoLanes(meetings: Meeting[]): Meeting[][] {
  if (meetings.length === 0) return [];

  const lanes: Meeting[][] = [[]];
  // Greedy packing behaves badly on unordered input, and generation does not sort.
  for (const meeting of [...meetings].sort((a, b) => a.startTime - b.startTime)) {
    const laneWithRoom = lanes.find((lane) => lane.every((other) => !overlaps(meeting, other)));
    if (laneWithRoom) laneWithRoom.push(meeting);
    else lanes.push([meeting]);
  }
  return lanes;
}
