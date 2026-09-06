import SEO from "../components/SEO";
import PageTransition from "../components/PageTransition";
import HeroSection from "../features/home/HeroSection";
import TrustBadges from "../features/home/TrustBadges";
import FeaturedProducts from "../features/home/FeaturedProducts";
import NewsletterBanner from "../features/home/NewsletterBanner";
import CategoryGrid from "../features/categories/CategoryGrid";
import { Container } from "@mui/material";

export default function LandingPage() {
  return (
    <PageTransition>
      <SEO
        title="Shop Everything You Need"
        description="From auto parts to electronics, fashion to home essentials — shop thousands of quality products with fast delivery across Bangladesh."
      />

      <HeroSection />
      <TrustBadges />
      <Container sx={{ py: 2 }}>
        <CategoryGrid />
      </Container>
      <FeaturedProducts />
      <NewsletterBanner />
    </PageTransition>
  );
}
