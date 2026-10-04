import { Boss as BossAPI, Meeting, MeetingBonuses } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { Boss, BossPromise } from "../Boss/Boss";
import { hasCalendarAccess } from "../Boss/access";
import { isMeetingAttended, toggleMeeting } from "../Boss/placeMeeting";
import { isDate } from "lodash";

/** Throws unless the player holds a job that comes with a calendar. */
function hasJobOrThrow(ctx: NetscriptContext): void {
  if (!hasCalendarAccess()) {
    throw helpers.errorMessage(ctx, "You need a job at a company to use the boss API.");
  }
}

/** Resolves a meeting ID against the current round, throwing if it isn't on the calendar. */
function getMeetingOrThrow(ctx: NetscriptContext, _meetingID: unknown): Meeting {
  const meetingID = helpers.number(ctx, "meetingID", _meetingID);
  const meeting = Boss.round.meetings.find((m) => m.id === meetingID);
  if (!meeting) {
    throw helpers.errorMessage(ctx, `No meeting with id ${meetingID} on the current calendar.`);
  }
  return meeting;
}

export function NetscriptBoss(): InternalAPI<BossAPI> {
  return {
    solvePuzzle: (ctx: NetscriptContext, _puzzleID, _solution): string => {
      hasJobOrThrow(ctx);
      const puzzleID = helpers.number(ctx, "puzzleID", _puzzleID);
      const solution = helpers.string(ctx, "solution", _solution);
      // Lorem ipsum, no logic... yet.
      return "";
    },
    changeFixedSchedule: (ctx: NetscriptContext, _fixedBreak, _timezone): void => {
      hasJobOrThrow(ctx);
      const fixedBreak = getEnumHelper("MeetingFixedBreaks").nsGetMember(ctx, _fixedBreak);
      const timezone = isDate(_timezone); // correct?
      // Change fixed schedule logic
    },
    addBreakTime: (ctx: NetscriptContext, _timezone): void => {
      hasJobOrThrow(ctx);
      const timezone = isDate(_timezone); // correct?
      // Adding break time logic
    },
    hasAccess: (ctx: NetscriptContext): boolean => {
      // doesn't need API access
      try {
        helpers.checkBossAPIAccess(ctx);
      } catch (_) {
        return false;
      }
      return true;
    },
    nextUpdate: (ctx: NetscriptContext): Promise<number> => {
      hasJobOrThrow(ctx);
      if (!BossPromise.promise) {
        BossPromise.promise = new Promise<number>((res) => (BossPromise.resolve = res));
      }
      return BossPromise.promise;
    },
    getAppliedRewards: (ctx: NetscriptContext): MeetingBonuses => {
      hasJobOrThrow(ctx);
      return structuredClone(Boss.appliedBonuses);
    },
    calendar: {
      getAppointments: (ctx: NetscriptContext): Meeting[] => {
        hasJobOrThrow(ctx);
        return structuredClone(Boss.round.meetings);
      },
      rsvp: (ctx: NetscriptContext, _meetingID): void => {
        hasJobOrThrow(ctx);
        const meeting = getMeetingOrThrow(ctx, _meetingID);
        if (isMeetingAttended(Boss.round, meeting.id)) {
          throw helpers.errorMessage(ctx, `Meeting ${meeting.id} is already attended.`);
        }
        /** Booking a meeting drops anything it conflicts with. See {@link toggleMeeting} */
        Boss.round = toggleMeeting(Boss.round, meeting.id);
      },
      cancelMeetingAttendance: (ctx: NetscriptContext, _meetingID): void => {
        hasJobOrThrow(ctx);
        const meeting = getMeetingOrThrow(ctx, _meetingID);
        if (!isMeetingAttended(Boss.round, meeting.id)) {
          throw helpers.errorMessage(ctx, `Meeting ${meeting.id} is not attended.`);
        }
        Boss.round = toggleMeeting(Boss.round, meeting.id);
      },
      getRsvps: (ctx: NetscriptContext): number[] => {
        hasJobOrThrow(ctx);
        return [...Boss.round.attendance];
      },
      isMeetingAttended: (ctx: NetscriptContext, _meetingID): boolean => {
        hasJobOrThrow(ctx);
        return isMeetingAttended(Boss.round, getMeetingOrThrow(ctx, _meetingID).id);
      },
      getPendingRewards: (ctx: NetscriptContext): MeetingBonuses => {
        hasJobOrThrow(ctx);
        return structuredClone(Boss.pendingBonuses);
      },
    },
    agent: {
      getNumAgents: (ctx: NetscriptContext): number => {
        hasJobOrThrow(ctx);
        // Return the number of agents
        return 0;
      },
      hireAgent: (ctx: NetscriptContext): void => {
        hasJobOrThrow(ctx);
        // Hire an agent here
      },
    },
  };
}
