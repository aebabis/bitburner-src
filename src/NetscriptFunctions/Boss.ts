import { Boss as BossAPI, Meeting } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "src/Netscript/APIWrapper";
import { helpers } from "src/Netscript/NetscriptHelpers";

export function NetscriptCompany(): InternalAPI<BossAPI> {
  return {
    solvePuzzle:
      (ctx: NetscriptContext) =>
      (_puzzleID, _solution): string => {
        const puzzleID = helpers.number(ctx, "puzzleID", _puzzleID);
        const solution = helpers.string(ctx, "solution", _solution);
        return "Yess! Example text";
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
    },
  };
}
