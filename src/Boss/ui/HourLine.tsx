import React from "react";
import { Box, Typography } from "@mui/material";

import { Settings } from "../../Settings/Settings";

interface HourLineProps {
  hour: number;
  dayStart: number;
  dayEnd: number;
}

export function HourLine({ hour, dayStart, dayEnd }: HourLineProps): React.ReactElement {
  const top = (100 * (hour - dayStart)) / (dayEnd - dayStart);

  return (
    <Box sx={{ position: "absolute", top: `${top}%`, width: "100%", borderTop: `1px solid ${Settings.theme.welllight}` }}>
      <Typography
        sx={{
          position: "absolute",
          top: "2px",
          left: "2px",
          fontSize: "0.7em",
          color: Settings.theme.disabled,
          pointerEvents: "none",
        }}
      >
        {hour.toString().padStart(2, "0")}:00
      </Typography>
    </Box>
  );
}
