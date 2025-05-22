import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

export interface InsightSection {
  id: string;
  label: string;
  checked: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  sections: InsightSection[];
  onSectionsChange: (sections: InsightSection[]) => void;
  onExport: () => void;
}

export default function SectionSelectionDialog({
  open,
  onClose,
  sections,
  onSectionsChange,
  onExport,
}: Props) {
  const handleSectionToggle = (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, checked: !section.checked }
        : section,
    );
    onSectionsChange(updatedSections);
  };

  const handleSelectAll = () => {
    const allChecked = sections.every((section) => section.checked);
    const updatedSections = sections.map((section) => ({
      ...section,
      checked: !allChecked,
    }));
    onSectionsChange(updatedSections);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Sections to Export</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose which sections you want to include in the PDF export.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSelectAll}
          sx={{ mb: 2 }}
        >
          {sections.every((section) => section.checked)
            ? "Deselect All"
            : "Select All"}
        </Button>
        <FormGroup>
          {sections.map((section) => (
            <FormControlLabel
              key={section.id}
              control={
                <Checkbox
                  checked={section.checked}
                  onChange={() => handleSectionToggle(section.id)}
                />
              }
              label={section.label}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onExport}
          variant="contained"
          disabled={!sections.some((section) => section.checked)}
        >
          Export PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
