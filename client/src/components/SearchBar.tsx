import { useState } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSearchSuggestions } from "../features/products/useSearchSuggestions";
import type { SearchSuggestion } from "../features/products/searchApi";

const PLACEHOLDER_IMAGE = "/placeholder-part.svg";

export default function SearchBar() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { data: suggestions, isFetching } = useSearchSuggestions(inputValue);

  const handleSelect = (
    _event: unknown,
    value: SearchSuggestion | string | null,
  ) => {
    if (value && typeof value !== "string") {
      navigate(`/products/${value._id}`);
      setInputValue("");
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions ?? []}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.title
      }
      filterOptions={(x) => x}
      inputValue={inputValue}
      onInputChange={(_e, value) => setInputValue(value)}
      onChange={handleSelect}
      loading={isFetching}
      loadingText="Searching..."
      sx={{ width: { xs: 180, sm: 320 } }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search parts, make, model..."
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
              borderRadius: 1,
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        if (typeof option === "string") return null;
        return (
          <Box
            component="li"
            {...props}
            key={option._id}
            sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
          >
            <Avatar
              src={option.images?.[0] || PLACEHOLDER_IMAGE}
              variant="rounded"
              sx={{ width: 36, height: 36 }}
            />
            <Box>
              <Typography variant="body2">{option.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.make} {option.model} · ${option.price.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        );
      }}
      noOptionsText={
        inputValue.trim().length < 2 ? "Type to search..." : "No products found"
      }
    />
  );
}
