import { Paper, Box, MenuItem, TextField, Button } from "@mui/material";
import { useFilterOptions } from "./useFilterOptions";
import type { ProductFilters } from "./productTypes";

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

// The "Select Your Vehicle" bar: Year -> Make -> Model cascading filters.
// Each selection narrows the options available in the next dropdown.
export default function VehicleFilterBar({ filters, onChange }: Props) {
  const { data, isLoading } = useFilterOptions({
    year: filters.year,
    make: filters.make,
  });

  const handleYearChange = (year: string) => {
    // Changing the year resets make/model since they may no longer apply
    onChange({ ...filters, year: year ? Number(year) : undefined, make: undefined, model: undefined, page: 1 });
  };

  const handleMakeChange = (make: string) => {
    // Changing the make resets model
    onChange({ ...filters, make: make || undefined, model: undefined, page: 1 });
  };

  const handleModelChange = (model: string) => {
    onChange({ ...filters, model: model || undefined, page: 1 });
  };

  const handleClear = () => {
    onChange({ page: 1 });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField
          select
          label="Year"
          size="small"
          sx={{ minWidth: 120 }}
          value={filters.year ?? ""}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={isLoading}
        >
          <MenuItem value="">Any</MenuItem>
          {data?.years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Make"
          size="small"
          sx={{ minWidth: 150 }}
          value={filters.make ?? ""}
          onChange={(e) => handleMakeChange(e.target.value)}
          disabled={isLoading}
        >
          <MenuItem value="">Any</MenuItem>
          {data?.makes.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Model"
          size="small"
          sx={{ minWidth: 150 }}
          value={filters.model ?? ""}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={isLoading || !filters.make}
        >
          <MenuItem value="">Any</MenuItem>
          {data?.models.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <Button onClick={handleClear} size="small">
          Clear Filters
        </Button>
      </Box>
    </Paper>
  );
}