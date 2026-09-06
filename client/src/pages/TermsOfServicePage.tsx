import { Container, Typography, Box } from "@mui/material";
import PageTransition from "../components/PageTransition";
import SEO from "../components/SEO";

export default function TermsOfServicePage() {
  return (
    <PageTransition>
      <Container sx={{ py: 6, maxWidth: "800px !important" }}>
        <SEO
          title="Terms of Service"
          description="Terms and conditions for using Shop BD."
        />

        <Typography sx={{ variant: "h4", component: "h1", mb: 1 }}>
          Terms of Service
        </Typography>
        <Typography sx={{ variant: "body2", color: "text.secondary", mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box
          sx={{
            "& h6": { mt: 3, mb: 1 },
            "& p": { mb: 2, color: "text.secondary" },
          }}
        >
          <Typography sx={{ variant: "h6" }}>1. Acceptance of Terms</Typography>
          <Typography>
            By accessing or using Shop BD ("we", "our", "us"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use our platform.
          </Typography>

          <Typography sx={{ variant: "h6" }}>2. Eligibility</Typography>
          <Typography>
            You must be at least 18 years old, or the age of legal majority in
            your jurisdiction, to create an account and make purchases on this
            platform.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            3. Account Responsibility
          </Typography>
          <Typography>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. Notify us immediately of any unauthorized use of your
            account. We strongly recommend enabling two-factor authentication
            for added security.
          </Typography>

          <Typography sx={{ variant: "h6" }}>4. Product Information</Typography>
          <Typography>
            We make reasonable efforts to display accurate product descriptions,
            images, and pricing. However, we do not warrant that product
            descriptions or other content are error-free. Prices are subject to
            change without notice.
          </Typography>

          <Typography sx={{ variant: "h6" }}>5. Orders and Payment</Typography>
          <Typography>
            All orders are subject to acceptance and availability. Payment is
            processed through SSLCommerz, a third-party payment gateway. We do
            not store your card or mobile banking credentials. By placing an
            order, you authorize us to charge the specified amount to your
            chosen payment method.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            6. Cancellation and Returns
          </Typography>
          <Typography>
            Orders may be cancelled within 24 hours of placement, provided they
            have not yet shipped. Returns are accepted within 7 days of delivery
            for eligible items, subject to admin review. Refunds are processed
            through the original payment method via SSLCommerz's refund system
            and may take several business days to reflect.
          </Typography>

          <Typography sx={{ variant: "h6" }}>7. Prohibited Conduct</Typography>
          <Typography>
            You agree not to: use the platform for any unlawful purpose; attempt
            to gain unauthorized access to any part of the platform; interfere
            with or disrupt the platform's security features; create multiple
            accounts to abuse promotions or coupons; or submit false,
            misleading, or abusive content (including reviews).
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            8. Intellectual Property
          </Typography>
          <Typography>
            All content on this platform, including logos, text, graphics, and
            software, is the property of Shop BD or its licensors and is
            protected by applicable intellectual property laws.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            9. Limitation of Liability
          </Typography>
          <Typography>
            To the maximum extent permitted by law, Shop BD shall not be liable
            for any indirect, incidental, or consequential damages arising from
            your use of the platform or purchase of products.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            10. Changes to These Terms
          </Typography>
          <Typography>
            We may update these Terms of Service from time to time. Continued
            use of the platform after changes constitutes acceptance of the
            revised terms.
          </Typography>

          <Typography sx={{ variant: "h6" }}>11. Contact</Typography>
          <Typography>
            For questions about these terms, contact us at
            support@ShopBDbd.example.com.
          </Typography>
        </Box>
      </Container>
    </PageTransition>
  );
}
