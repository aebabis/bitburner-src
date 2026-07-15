import { Boss as BossAPI, Meeting } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptBoss(): InternalAPI<BossAPI> {
  return {
    solvePuzzle:
      (ctx: NetscriptContext) =>
      (_puzzleID, _solution): string => {
        const puzzleID = helpers.number(ctx, "puzzleID", _puzzleID);
        const solution = helpers.string(ctx, "solution", _solution);
        return "Yess! Example text";
      },
    changeFixedSchedule:
      (ctx: NetscriptContext) =>
      (_fixedBreak, _timezone): void => {
        const fixedBreak = getEnumHelper("MeetingFixedBreaks").nsGetMember(ctx, _fixedBreak);
        // Change fixed schedule logic
      },
    addBreakTime:
      (ctx: NetscriptContext) =>
      (_timezone): void => {
        // Adding break time logic
      },
    getRsvps: (ctx: NetscriptContext) => (): void => {
      // What goes in here?
    },
    hasAccess: (ctx: NetscriptContext) => (): boolean => {
      return helpers.checkBossAPIAccess(ctx);
    },
    nextUpdate: (ctx: NetscriptContext) => (): number => {
      // Next update logic
      return 0;
    },
    calendar: {
      getAppointments: (ctx: NetscriptContext) => (): Meeting[] => {
        return [
          {
            id: 1,
            title: "Test",
            startTime: "100",
            finishTime: "200",
            attendanceMults: 1.6,
          },
        ];
      },
      rsvp:
        (ctx: NetscriptContext) =>
        (_meetingID): void => {
          const meetingID = helpers.number(ctx, "meetingID", _meetingID);
          // Answer a meeting logic
        },
      cancelMeeting:
        (ctx: NetscriptContext) =>
        (_meetingID): void => {
          const meetingID = helpers.number(ctx, "meetingID", _meetingID);
          // Cancel a meeting logic
        },
    },
    agent: {
      getNumAgents: (ctx: NetscriptContext) => (): number => {
        // Return the number of agents
        return 0;
      },
      hireAgent: (ctx: NetscriptContext) => (): void => {
        // Hire an agent here
      },
    },
  };
}
