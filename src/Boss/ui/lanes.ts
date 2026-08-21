import type { Meeting } from "@nsdefs";

const overlaps = (a: Meeting, b: Meeting): boolean => a.finishTime > b.startTime && a.startTime < b.finishTime;

/**
 * Packs meetings into arbitrary columns so that no column holds two overlapping meetings.
 */
export function splitIntoLanes(meetings: Meeting[]): Meeting[][] {
  if (meetings.length === 0) return [];

  const lanes: Meeting[][] = [[]];
  for (const meeting of meetings.toSorted((a, b) => a.startTime - b.startTime)) {
    const laneWithRoom = lanes.find((lane) => lane.every((other) => !overlaps(meeting, other)));
    if (laneWithRoom) laneWithRoom.push(meeting);
    else lanes.push([meeting]);
  }
  return lanes;
}
