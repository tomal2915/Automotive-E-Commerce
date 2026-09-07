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
      <Typography variant="h5" sx={{ mb: 2 }}>
        Shop by Category
      </Typography>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid key={cat._id} size={{ xs: 6, sm: 4, md: 2 }}>
            {/* height: "100%" on the Card, plus a fixed-height flex column
                layout inside, ensures every card in the row matches —
                regardless of how many lines the category name wraps to */}
            <Card
              sx={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <CardActionArea
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                }
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <CardMedia
                  component="img"
                  image={cat.image || "/placeholder-part.svg"}
                  alt={cat.name}
                  sx={{ height: 120, objectFit: "cover", flexShrink: 0 }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    py: 1,
                    px: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cat.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
