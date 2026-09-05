import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import type { LowStockProduct } from "./analyticsApi";

export default function LowStockWidget({ data }: { data: LowStockProduct[] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ variant: "h6", mb: 2 }}>
        Low Stock Alert
      </Typography>
      {data.length === 0 ? (
        <Typography color="text.secondary">
          All products are well-stocked.
        </Typography>
      ) : (
        <List dense>
          {data.map((product) => (
            <ListItem
              key={product._id}
              secondaryAction={
                <Chip
                  label={`${product.stock} left`}
                  size="small"
                  color="error"
                />
              }
            >
              <ListItemText
                primary={product.title}
                secondary={product.category}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
