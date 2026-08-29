import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import type { MeetingBonuses } from "@nsdefs";

import { Settings } from "../../Settings/Settings";
import { BONUS_STATS, type BonusStat } from "../bonuses";

const STAT_NAMES: Record<BonusStat, string> = {
  money: "Money",
  reputation: "Company Reputation",
  hackExp: "Hacking Exp",
  strExp: "Strength Exp",
  defExp: "Defense Exp",
  dexExp: "Dexterity Exp",
  agiExp: "Agility Exp",
  chaExp: "Charisma Exp",
};

const STAT_COLORS = {
  money: Settings.theme.money,
  reputation: Settings.theme.rep,
  hackExp: Settings.theme.hack,
  strExp: Settings.theme.combat,
  defExp: Settings.theme.combat,
  dexExp: Settings.theme.combat,
  agiExp: Settings.theme.combat,
  chaExp: Settings.theme.cha,
} as const;

interface RoundRewardsProps {
  label: string;
  fnName: string;
  bonuses: MeetingBonuses;
  emptyText: string;
}

export function RoundRewards({ label, fnName, bonuses, emptyText }: RoundRewardsProps): React.ReactElement {
  const active = BONUS_STATS.filter((stat) => Math.abs(bonuses[stat] - 1) > 1e-6).sort(
    (a, b) => bonuses[b] - bonuses[a],
  );

  return (
    <Tooltip title={fnName} placement="top-start">
      <Box sx={{ flex: 1, minWidth: "16em" }}>
        <Typography sx={{ fontWeight: "bold" }}>{label}</Typography>
        <Box sx={{ minHeight: "5em", marginTop: "0.4em" }}>
          {active.length === 0 ? (
            <Typography sx={{ color: Settings.theme.disabled }}>{emptyText}</Typography>
          ) : (
            active.map((stat) => (
              <Typography key={stat} sx={{ color: STAT_COLORS[stat] }}>
                {STAT_NAMES[stat]} &times;{bonuses[stat].toFixed(3)}
              </Typography>
            ))
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}
