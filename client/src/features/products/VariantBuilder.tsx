import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery } from "@tanstack/react-query";
import { fetchAttributes } from "../attributes/attributeApi";
import { api } from "../../lib/api";

export interface VariantRow {
  tempId: string; // client-side only, for React keys before saving
  attributeValues: {
    attribute: string;
    value: string;
    attributeName: string;
    valueLabel: string;
  }[];
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
}

interface Props {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

export default function VariantBuilder({ variants, onChange }: Props) {
  const { data: attributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: fetchAttributes,
  });

  // Which attribute IDs, and which value IDs within each, the admin has
  // ticked as "this product varies along these"
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>(
    {},
  );

  const toggleAttrValue = (attrId: string, valueId: string) => {
    setSelectedAttrs((prev) => {
      const current = prev[attrId] || [];
      const next = current.includes(valueId)
        ? current.filter((v) => v !== valueId)
        : [...current, valueId];
      return { ...prev, [attrId]: next };
    });
  };

  const canGenerate = useMemo(
    () => Object.values(selectedAttrs).some((v) => v.length > 0),
    [selectedAttrs],
  );

  const handleGenerate = async () => {
    const attributeSelections = Object.entries(selectedAttrs)
      .filter(([, valueIds]) => valueIds.length > 0)
      .map(([attrId, valueIds]) => {
        const attr = attributes?.find((a) => a._id === attrId)!;
        return {
          attributeId: attrId,
          attributeName: attr.name,
          values: valueIds.map((vId) => {
            const val = attr.values.find((v) => v._id === vId)!;
            return { valueId: vId, valueLabel: val.value };
          }),
        };
      });

    const res = await api.post("/products/generate-variants", {
      attributeSelections,
    });
    const combinations: any[] = res.data.combinations;

    const newRows: VariantRow[] = combinations.map((combo, i) => ({
      tempId: `new-${Date.now()}-${i}`,
      attributeValues: combo,
      sku: "",
      price: "",
      salePrice: "",
      stock: "0",
    }));

    onChange(newRows);
  };

  const updateRow = (
    tempId: string,
    field: keyof VariantRow,
    value: string,
  ) => {
    onChange(
      variants.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)),
    );
  };

  const removeRow = (tempId: string) => {
    onChange(variants.filter((v) => v.tempId !== tempId));
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        1. Choose which attributes this product varies by
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {attributes?.map((attr) => (
          <Grid key={attr._id} size={{ xs: 12, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {attr.name}
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {attr.values.map((v) => (
                  <FormControlLabel
                    key={v._id}
                    control={
                      <Checkbox
                        size="small"
                        checked={(selectedAttrs[attr._id] || []).includes(
                          v._id,
                        )}
                        onChange={() => toggleAttrValue(attr._id, v._id)}
                      />
                    }
                    label={v.value}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        onClick={handleGenerate}
        disabled={!canGenerate}
        sx={{ mb: 3 }}
      >
        Generate Variant Combinations
      </Button>

      {variants.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            2. Set SKU, price, and stock for each combination ({variants.length}{" "}
            variants)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Combination</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((row) => (
                <TableRow key={row.tempId}>
                  <TableCell>
                    {row.attributeValues.map((av) => (
                      <Chip
                        key={av.value}
                        label={`${av.attributeName}: ${av.valueLabel}`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={row.sku}
                      onChange={(e) =>
                        updateRow(row.tempId, "sku", e.target.value)
                      }
                      sx={{ width: 120 }}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.price}
                      onChange={(e) =>
                        updateRow(row.tempId, "price", e.target.value)
                      }
                      sx={{ width: 90 }}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.salePrice}
                      onChange={(e) =>
                        updateRow(row.tempId, "salePrice", e.target.value)
                      }
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.stock}
                      onChange={(e) =>
                        updateRow(row.tempId, "stock", e.target.value)
                      }
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => removeRow(row.tempId)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  );
}
