import React from "react";
import { ButtonBase, Tooltip, Typography } from "@mui/material";
import type { Meeting } from "@nsdefs";

import { Settings } from "../../Settings/Settings";
import { Box, TypographyProps } from '@mui/system';

/** Formats an hour-decimal (8.25) as a clock time (08:15). */
export function formatMeetingTime(time: number): string {
  const totalMinutes = Math.round(time * 60);
  const hour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minute = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

const Indicator = ({ color, text, bonusName, ...props }: { color: string, text: string, bonusName: string } & TypographyProps ) => (
  <Tooltip title={`This meeting gives a bonus to ${bonusName}`}>
    <Typography sx={{ color }} component='span' {...props}>{text}</Typography>
  </Tooltip>
);

const StatIndicators = ({ meeting } : { meeting: Meeting }) => {
  const { money, reputation, hackExp, strExp, defExp, dexExp, agiExp, chaExp } = meeting.attendanceMults;
  const hasMoneyBonus = money > 0;
  const hasRepBonus = reputation > 0;
  const hasHackBonus = hackExp > 0;
  const hasCombatBonus = [strExp, defExp, dexExp, agiExp].some((val) => val > 0);
  const hasChaBonus = chaExp > 0;
  return <Box sx={{display: 'inline-flex', gap: '.2em', alignItems: 'baseline'}}>
    {hasMoneyBonus && <Indicator color={Settings.theme.money} text='$' bonusName='income' fontSize='1em' />}
    {hasRepBonus && <Indicator color={Settings.theme.combat} text='◇' bonusName='reputation gained' />}
    {hasHackBonus && <Indicator color={Settings.theme.hack} text='◻' bonusName='hacking experience' fontWeight='bold' />}
    {hasCombatBonus && <Indicator color={Settings.theme.combat} text='⚔' bonusName='one or more types of combat experience' />}
    {hasChaBonus && <Indicator color={Settings.theme.cha} text='◼' bonusName='charisma experience' />}
  </Box>
};

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
          maxWidth: "100%",
        }}
      >
        {meeting.title} <StatIndicators meeting={meeting} />
      </Typography>
      <Typography sx={{ color: "inherit", fontSize: "0.75em", lineHeight: 1.2 }}>
        {formatMeetingTime(meeting.startTime)} - {formatMeetingTime(meeting.finishTime)}
      </Typography>
      {/* The id is on screen because scripts address meetings by it - see {@link ../../NetscriptFunctions:Boss.calendar.rsvp}. */}
      <Typography sx={{ color: "inherit", fontSize: "0.7em", lineHeight: 1.2, opacity: 0.7 }}>{meeting.id}</Typography>
    </ButtonBase>
  );
}
