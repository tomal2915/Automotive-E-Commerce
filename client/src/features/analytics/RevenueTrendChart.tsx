import { Paper, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { RevenueTrendPoint } from "./analyticsApi";

interface Props {
  data: RevenueTrendPoint[];
}

export default function RevenueTrendChart({ data }: Props) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography sx={{ variant: "h6", mb: 2 }}>
        Revenue Trend (Last 30 Days)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number, name: string) => [
              name === "revenue" ? `$${value.toFixed(2)}` : value,
              name === "revenue" ? "Revenue" : "Orders",
            ]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
