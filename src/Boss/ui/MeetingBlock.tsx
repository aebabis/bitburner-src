import React from "react";
import { ButtonBase, Typography } from "@mui/material";
import type { Meeting } from "@nsdefs";

import { Settings } from "../../Settings/Settings";

/** Formats an hour-decimal (8.25) as a clock time (08:15). */
export function formatMeetingTime(time: number): string {
  const totalMinutes = Math.round(time * 60);
  const hour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minute = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

interface MeetingBlockProps {
  meeting: Meeting;
  dayStart: number;
  dayEnd: number;
  attended: boolean;
  onClick: () => void;
}

export function MeetingBlock({ meeting, dayStart, dayEnd, attended, onClick }: MeetingBlockProps): React.ReactElement {
  const dayDuration = dayEnd - dayStart;
  const top = (100 * (meeting.startTime - dayStart)) / dayDuration;
  const bottom = 100 - (100 * (meeting.finishTime - dayStart)) / dayDuration;

  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      aria-pressed={attended}
      aria-label={`${meeting.title}, ${formatMeetingTime(meeting.startTime)} to ${formatMeetingTime(
        meeting.finishTime,
      )}, id ${meeting.id}`}
      sx={{
        position: "absolute",
        left: "1px",
        width: "calc(100% - 2px)",
        top: `${top}%`,
        bottom: `calc(${bottom}% - 1px)`,
        padding: "0.25em",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflow: "hidden",
        borderRadius: "3px",
        border: `1px solid ${Settings.theme.primary}`,
        background: attended ? Settings.theme.primary : Settings.theme.well,
        color: attended ? Settings.theme.black : Settings.theme.primary,
        textAlign: "left",
      }}
    >
      <Typography
        sx={{
          color: "inherit",
          fontSize: "0.85em",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          maxWidth: "100%",
        }}
      >
        {meeting.title}
      </Typography>
      <Typography sx={{ color: "inherit", fontSize: "0.75em", lineHeight: 1.2 }}>
        {formatMeetingTime(meeting.startTime)} - {formatMeetingTime(meeting.finishTime)}
      </Typography>
      {/* The id is on screen because scripts address meetings by it - see {@link ../../NetscriptFunctions:Boss.calendar.rsvp}. */}
      <Typography sx={{ color: "inherit", fontSize: "0.7em", lineHeight: 1.2, opacity: 0.7 }}>{meeting.id}</Typography>
    </ButtonBase>
  );
}
