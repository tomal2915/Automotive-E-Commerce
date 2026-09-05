import { Paper, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TopProduct } from "./analyticsApi";

interface Props {
  data: TopProduct[];
}

export default function TopProductsChart({ data }: Props) {
  // Truncate long titles so the Y-axis labels don't overflow
  const chartData = data.map((p) => ({
    ...p,
    shortTitle: p.title.length > 20 ? p.title.slice(0, 20) + "…" : p.title,
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ variant: "h6", mb: 2 }}>
        Top-Selling Products
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis type="number" />
          <YAxis
            dataKey="shortTitle"
            type="category"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number) => [value, "Units Sold"]} />
          <Bar dataKey="totalQuantitySold" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
