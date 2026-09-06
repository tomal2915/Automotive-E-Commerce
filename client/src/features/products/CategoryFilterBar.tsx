import { Paper, Box, MenuItem, TextField, Button } from "@mui/material";
import { useCategories } from "../categories/useCategories";
import { useFilterOptions } from "./useFilterOptions";
import type { ProductFilters } from "./productTypes";

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export default function CategoryFilterBar({ filters, onChange }: Props) {
  const { data: categories } = useCategories();
  const selectedCategory = categories?.find((c) => c.name === filters.category);
  const showVehicleFilters = selectedCategory?.hasVehicleAttributes ?? false;

  const { data: filterOptions } = useFilterOptions({
    category: filters.category,
    year: filters.year,
    make: filters.make,
  });

  const handleCategoryChange = (category: string) => {
    // Changing category resets vehicle-specific filters since they may
    // not apply to the new category
    onChange({
      ...filters,
      category: category || undefined,
      make: undefined,
      model: undefined,
      year: undefined,
      page: 1,
    });
  };

  const handleYearChange = (year: string) => {
    onChange({
      ...filters,
      year: year ? Number(year) : undefined,
      make: undefined,
      model: undefined,
      page: 1,
    });
  };

  const handleMakeChange = (make: string) => {
    onChange({
      ...filters,
      make: make || undefined,
      model: undefined,
      page: 1,
    });
  };

  const handleModelChange = (model: string) => {
    onChange({ ...filters, model: model || undefined, page: 1 });
  };

  const handleClear = () => onChange({ page: 1 });

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <TextField
          select
          label="Category"
          size="small"
          sx={{ minWidth: 160 }}
          value={filters.category ?? ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat._id} value={cat.name}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Vehicle-specific dropdowns only appear when the selected category needs them */}
        {showVehicleFilters && (
          <>
            <TextField
              select
              label="Year"
              size="small"
              sx={{ minWidth: 110 }}
              value={filters.year ?? ""}
              onChange={(e) => handleYearChange(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              {filterOptions?.years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Make"
              size="small"
              sx={{ minWidth: 140 }}
              value={filters.make ?? ""}
              onChange={(e) => handleMakeChange(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              {filterOptions?.makes.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Model"
              size="small"
              sx={{ minWidth: 140 }}
              value={filters.model ?? ""}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!filters.make}
            >
              <MenuItem value="">Any</MenuItem>
              {filterOptions?.models.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}

        <Button onClick={handleClear} size="small">
          Clear Filters
        </Button>
      </Box>
    </Paper>
  );
}
