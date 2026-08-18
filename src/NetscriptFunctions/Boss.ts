import { Boss as BossAPI, Meeting, MeetingBonuses } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { Boss, BossPromise, ROUND_LENGTH_MS } from "../Boss/Boss";
import { hasCalendarAccess } from "../Boss/access";
import { isMeetingAttended, toggleMeeting } from "../Boss/placeMeeting";

/** Throws unless the player holds a job that comes with a calendar. */
function checkAccess(ctx: NetscriptContext): void {
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
      checkAccess(ctx);
      // Lorem ipsum, no logic... yet.
      return "";
    },
    changeFixedSchedule: (ctx: NetscriptContext, _fixedBreak, _timezone): void => {
      checkAccess(ctx);
      const fixedBreak = getEnumHelper("MeetingFixedBreaks").nsGetMember(ctx, _fixedBreak);
      // Change fixed schedule logic
    },
    addBreakTime: (ctx: NetscriptContext, _timezone): void => {
      checkAccess(ctx);
      // Adding break time logic
    },
    hasAccess: (ctx: NetscriptContext): boolean => {
      return helpers.checkBossAPIAccess();
    },
    nextUpdate: (ctx: NetscriptContext): Promise<number> => {
      checkAccess(ctx);
      if (!BossPromise.promise) {
        BossPromise.promise = new Promise<number>((res) => (BossPromise.resolve = res));
      }
      return BossPromise.promise;
    },
    getAppliedRewards: (ctx: NetscriptContext): MeetingBonuses => {
      checkAccess(ctx);
      return structuredClone(Boss.appliedBonuses);
    },
    calendar: {
      getAppointments: (ctx: NetscriptContext): Meeting[] => {
        checkAccess(ctx);
        return structuredClone(Boss.round.meetings);
      },
      rsvp: (ctx: NetscriptContext, _meetingID): void => {
        checkAccess(ctx);
        const meeting = getMeetingOrThrow(ctx, _meetingID);
        if (isMeetingAttended(Boss.round, meeting.id)) {
          throw helpers.errorMessage(ctx, `Meeting ${meeting.id} is already attended.`);
        }
        // Booking a meeting drops anything it conflicts with. See toggleMeeting.
        Boss.round = toggleMeeting(Boss.round, meeting.id);
      },
      cancelMeetingAttendance: (ctx: NetscriptContext, _meetingID): void => {
        checkAccess(ctx);
        const meeting = getMeetingOrThrow(ctx, _meetingID);
        if (!isMeetingAttended(Boss.round, meeting.id)) {
          throw helpers.errorMessage(ctx, `Meeting ${meeting.id} is not attended.`);
        }
        Boss.round = toggleMeeting(Boss.round, meeting.id);
      },
      getRsvps: (ctx: NetscriptContext): number[] => {
        checkAccess(ctx);
        return [...Boss.round.attendance];
      },
      isMeetingAttended: (ctx: NetscriptContext, _meetingID): boolean => {
        checkAccess(ctx);
        return isMeetingAttended(Boss.round, getMeetingOrThrow(ctx, _meetingID).id);
      },
      getPendingRewards: (ctx: NetscriptContext): MeetingBonuses => {
        checkAccess(ctx);
        return structuredClone(Boss.pendingBonuses);
      },
    },
    agent: {
      getNumAgents: (ctx: NetscriptContext): number => {
        checkAccess(ctx);
        // Return the number of agents
        return 0;
      },
      hireAgent: (ctx: NetscriptContext): void => {
        checkAccess(ctx);
        // Hire an agent here
      },
    },
  };
}
