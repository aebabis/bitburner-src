import React from "react";
import { Box, Button, Typography } from "@mui/material";

import { Settings } from "../../Settings/Settings";
import { useCycleRerender } from "../../ui/React/hooks";
import { Boss } from "../Boss";
import { isMeetingAttended, toggleMeeting } from "../placeMeeting";
import { HourLine } from "./HourLine";
import { MeetingBlock } from "./MeetingBlock";
import { RoundRewards } from "./RoundRewards";
import { splitIntoLanes } from "./lanes";

const CALENDAR_HEIGHT = "26em";

export function CalendarRoot(): React.ReactElement {
  useCycleRerender();

  const { round } = Boss;
  const { dayStart, dayEnd, meetings } = round;
  const lanes = splitIntoLanes(meetings);

  const firstHour = Math.floor(dayStart + 1);
  const lastHour = Math.ceil(dayEnd - 1);
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);

  const onToggle = (meetingID: number) => {
    Boss.round = toggleMeeting(Boss.round, meetingID);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
      <Typography>
        Schedule meetings to earn bonuses on your work. The rewards of what you attend now is applied at the start of the next cycle.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1.5em" }}>
        <RoundRewards
          label="Applied to your work now"
          fnName="ns.boss.getAppliedRewards()"
          bonuses={Boss.appliedBonuses}
          emptyText="Nothing locked in yet"
        />
        <RoundRewards
          label="Booked this cycle"
          fnName="ns.boss.calendar.getPendingRewards()"
          bonuses={Boss.pendingBonuses}
          emptyText="Nothing booked yet"
        />
      </Box>

      {/* Tester controls. Difficulty will eventually track the player's position in the company. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "0.75em" }}>
        <Typography sx={{ color: Settings.theme.disabled }}>
          Level {Boss.level} &middot; {meetings.length} meetings
        </Typography>
        <Button size="small" disabled={Boss.level <= 1} onClick={() => Boss.setLevel(Boss.level - 1)}>
          Demote
        </Button>
        <Button size="small" disabled={Boss.level >= 5} onClick={() => Boss.setLevel(Boss.level + 1)}>
          Promote
        </Button>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "0.8em", color: Settings.theme.disabled }}>
          Next cycle in {Math.ceil(Boss.timeUntilRollover / 1000)}s
        </Typography>
        <Box sx={{ height: "4px", width: "100%", background: Settings.theme.well }}>
          <Box sx={{ height: "100%", width: `${Boss.roundProgress * 100}%`, background: Settings.theme.primary }} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          height: CALENDAR_HEIGHT,
          position: "relative",
          border: `1px solid ${Settings.theme.welllight}`,
        }}
      >
        {hours.map((hour) => (
          <HourLine key={hour} hour={hour} dayStart={dayStart} dayEnd={dayEnd} />
        ))}
        {lanes.map((lane, laneIndex) => (
          <Box key={laneIndex} sx={{ flex: 1, position: "relative", height: "100%", minWidth: 0 }}>
            {lane.map((meeting) => (
              <MeetingBlock
                key={meeting.id}
                meeting={meeting}
                dayStart={dayStart}
                dayEnd={dayEnd}
                attended={isMeetingAttended(round, meeting.id)}
                onClick={() => onToggle(meeting.id)}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
