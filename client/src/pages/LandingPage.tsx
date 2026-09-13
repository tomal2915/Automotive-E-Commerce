import { Box } from "@mui/material";
import SEO from "../components/SEO";
import PageTransition from "../components/PageTransition";
import HeroSection from "../features/home/HeroSection";
import TrustBadges from "../features/home/TrustBadges";
import FeaturedProducts from "../features/home/FeaturedProducts";
import NewsletterBanner from "../features/home/NewsletterBanner";
import CategoryGrid from "../features/categories/CategoryGrid";
import Testimonials from "../features/home/Testimonials";

export default function LandingPage() {
  return (
    <PageTransition>
      <SEO
        title="Shop Everything You Need"
        description="From auto parts to electronics, fashion to home essentials — shop thousands of quality products with fast delivery across Bangladesh."
      />

      {/* Hero carries its own full-bleed background/visual treatment */}
      <HeroSection />

      {/* Trust strip sits flush against the hero, no gap — reads as an
          extension of it rather than a separate section */}
      <TrustBadges />

      {/* Alternating background bands give the page rhythm without
          needing borders or dividers between every section */}
      <Box sx={{ bgcolor: "background.default", py: { xs: 6, md: 9 } }}>
        <CategoryGrid />
      </Box>

      <Box sx={{ bgcolor: "action.hover", py: { xs: 6, md: 9 } }}>
        <FeaturedProducts />
      </Box>

      <Box sx={{ bgcolor: "background.default", py: { xs: 6, md: 9 } }}>
        <Testimonials />
      </Box>

      <NewsletterBanner />
    </PageTransition>
  );
}
