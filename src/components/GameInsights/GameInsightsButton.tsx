import { Button } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState } from "react";
import GameInsightsDialog from "./GameInsightsDialog";

interface Props {
  userId: string;
}

export default function GameInsightsButton({ userId }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<BarChartIcon />}
        onClick={handleOpen}
      >
        Create Insights
      </Button>
      <GameInsightsDialog open={open} onClose={handleClose} userId={userId} />
    </>
  );
}
