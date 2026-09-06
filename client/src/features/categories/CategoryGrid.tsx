import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCategories } from "./useCategories";

export default function CategoryGrid() {
  const { data: categories } = useCategories();
  const navigate = useNavigate();

  if (!categories || categories.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ variant: "h5", mb: 2 }}>Shop by Category</Typography>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid key={cat._id} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card>
              <CardActionArea
                onClick={() =>
                  navigate(`/?category=${encodeURIComponent(cat.name)}`)
                }
              >
                <CardMedia
                  component="img"
                  height="80"
                  image={cat.image || "/placeholder-part.svg"}
                  alt={cat.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ textAlign: "center", py: 1 }}>
                  <Typography variant="body2">{cat.name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
