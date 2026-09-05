import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import type { Summary } from "./analyticsApi";

interface Props {
  summary: Summary;
}

export default function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Total Revenue",
      value: `$${summary.totalRevenue.toFixed(2)}`,
      icon: <AttachMoneyIcon />,
      color: "#22c55e",
    },
    {
      label: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCartIcon />,
      color: "#38bdf8",
    },
    {
      label: "Total Users",
      value: summary.totalUsers,
      icon: <PeopleIcon />,
      color: "#a78bfa",
    },
    {
      label: "Total Products",
      value: summary.totalProducts,
      icon: <InventoryIcon />,
      color: "#f59e0b",
    },
    {
      label: "Pending Returns",
      value: summary.pendingReturns,
      icon: <AssignmentReturnIcon />,
      color: "#ef4444",
    },
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography sx={{ variant: "h6" }}>{card.value}</Typography>
                  <Typography sx={{ variant: "caption", color: "text.secondary" }}>
                    {card.label}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
