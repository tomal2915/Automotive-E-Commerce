import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  fetchAttributes,
  createAttributeRequest,
  deleteAttributeRequest,
  addAttributeValueRequest,
  removeAttributeValueRequest,
  type Attribute,
} from "../features/attributes/attributeApi";
import PageTransition from "../components/PageTransition";

export default function AdminAttributesPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: attributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: fetchAttributes,
  });

  const [form, setForm] = useState({ name: "", type: "dropdown" });
  const [valueInputs, setValueInputs] = useState<
    Record<string, { value: string; referenceValue: string }>
  >({});

  const createAttribute = useMutation({
    mutationFn: () => createAttributeRequest(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      enqueueSnackbar("Attribute created successfully", { variant: "success" });
      setForm({ name: "", type: "dropdown" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create attribute",
        { variant: "error" },
      ),
  });

  const deleteAttribute = useMutation({
    mutationFn: deleteAttributeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      enqueueSnackbar("Attribute deleted successfully", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to delete attribute",
        { variant: "error" },
      ),
  });

  const addValue = useMutation({
    mutationFn: (payload: {
      attrId: string;
      value: string;
      referenceValue: string;
    }) =>
      addAttributeValueRequest(payload.attrId, {
        value: payload.value,
        referenceValue: payload.referenceValue,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      enqueueSnackbar("Value added successfully", { variant: "success" });
      setValueInputs({
        ...valueInputs,
        [variables.attrId]: { value: "", referenceValue: "" },
      });
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Failed to add value", {
        variant: "error",
      }),
  });

  const removeValue = useMutation({
    mutationFn: (payload: { attrId: string; valueId: string }) =>
      removeAttributeValueRequest(payload.attrId, payload.valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      enqueueSnackbar("Value removed successfully", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to remove value",
        { variant: "error" },
      ),
  });

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Attributes
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Attribute
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Attribute Name (e.g. Color, Size)"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Type"
                fullWidth
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="radio">Radio</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="color">Color Swatch</MenuItem>
                <MenuItem value="image">Image Swatch</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => createAttribute.mutate()}
                disabled={!form.name}
                sx={{ height: "100%" }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {attributes?.map((attr) => (
          <Accordion key={attr._id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Typography component="span">
                  {attr.name}{" "}
                  <Chip label={attr.type} size="small" sx={{ ml: 1 }} />
                </Typography>
                <IconButton
                  size="small"
                  component="div"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAttribute.mutate(attr._id);
                  }}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {attr.values.map((v) => (
                  <Chip
                    key={v._id}
                    label={v.value}
                    onDelete={() =>
                      removeValue.mutate({ attrId: attr._id, valueId: v._id })
                    }
                    sx={
                      attr.type === "color" && v.referenceValue
                        ? { bgcolor: v.referenceValue, color: "#fff" }
                        : undefined
                    }
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="New value"
                  value={valueInputs[attr._id]?.value || ""}
                  onChange={(e) =>
                    setValueInputs({
                      ...valueInputs,
                      [attr._id]: {
                        ...valueInputs[attr._id],
                        value: e.target.value,
                        referenceValue:
                          valueInputs[attr._id]?.referenceValue || "",
                      },
                    })
                  }
                />
                {attr.type === "color" && (
                  <TextField
                    size="small"
                    placeholder="#hexcode"
                    value={valueInputs[attr._id]?.referenceValue || ""}
                    onChange={(e) =>
                      setValueInputs({
                        ...valueInputs,
                        [attr._id]: {
                          ...valueInputs[attr._id],
                          referenceValue: e.target.value,
                          value: valueInputs[attr._id]?.value || "",
                        },
                      })
                    }
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    addValue.mutate({
                      attrId: attr._id,
                      value: valueInputs[attr._id]?.value || "",
                      referenceValue:
                        valueInputs[attr._id]?.referenceValue || "",
                    })
                  }
                  disabled={!valueInputs[attr._id]?.value}
                >
                  Add Value
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </PageTransition>
  );
}
