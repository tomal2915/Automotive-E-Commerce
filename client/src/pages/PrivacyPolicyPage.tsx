import { Container, Typography, Box } from "@mui/material";
import SEO from "../components/SEO";
import PageTransition from "../components/PageTransition";

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <Container sx={{ py: 6, maxWidth: "800px !important" }}>
        <SEO
          title="Privacy Policy"
          description="How Shop BD collects, uses, and protects your data."
        />

        <Typography sx={{ variant: "h4", component: "h1", mb: 1 }}>
          Privacy Policy
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
          <Typography sx={{ variant: "h6" }}>
            1. Information We Collect
          </Typography>
          <Typography>
            We collect information you provide directly: name, email, phone
            number, shipping addresses, and payment-related metadata (we do not
            store full card numbers — payments are processed by SSLCommerz). We
            also collect usage data such as your browsing history on our
            platform, IP address, and device information for security purposes
            (e.g. fraud prevention, rate limiting).
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            2. How We Use Your Information
          </Typography>
          <Typography>
            We use your information to: process and fulfill orders; send order
            confirmations, shipping updates, and other transactional emails;
            provide customer support; improve our platform and product
            recommendations; detect and prevent fraud or abuse; and comply with
            legal obligations.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            3. Data Storage and Security
          </Typography>
          <Typography>
            Your password is stored using industry-standard hashing (bcrypt) and
            is never stored in plain text. We support two-factor authentication
            for additional account security. Data is stored on MongoDB Atlas
            with encryption in transit and access restricted by authentication.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            4. Third-Party Services
          </Typography>
          <Typography>
            We share necessary data with trusted third parties solely to operate
            our platform: SSLCommerz (payment processing), Cloudinary (image
            hosting), and our email service provider (transactional emails).
            These providers are contractually and technically restricted from
            using your data for any other purpose.
          </Typography>

          <Typography sx={{ variant: "h6" }}>5. Cookies</Typography>
          <Typography>
            We use essential cookies to keep you logged in (authentication
            tokens) and to remember your preferences (such as theme mode). We do
            not use third-party advertising or tracking cookies.
          </Typography>

          <Typography sx={{ variant: "h6" }}>6. Your Rights</Typography>
          <Typography>
            You may access, update, or delete your account information at any
            time through your profile settings. You may request account deletion
            by contacting support — note that order records may be retained for
            legal/accounting purposes even after account deletion.
          </Typography>

          <Typography sx={{ variant: "h6" }}>7. Data Retention</Typography>
          <Typography>
            We retain your account data for as long as your account is active.
            Order records are retained for accounting and legal compliance
            purposes even if your account is later deleted.
          </Typography>

          <Typography sx={{ variant: "h6" }}>8. Children's Privacy</Typography>
          <Typography>
            Our platform is not intended for individuals under 18 years of age.
            We do not knowingly collect data from minors.
          </Typography>

          <Typography sx={{ variant: "h6" }}>
            9. Changes to This Policy
          </Typography>
          <Typography>
            We may update this Privacy Policy periodically. Material changes
            will be communicated via email or a notice on our platform.
          </Typography>

          <Typography sx={{ variant: "h6" }}>10. Contact</Typography>
          <Typography>
            For privacy-related questions or requests, contact us at
            privacy@ShopBDbd.example.com.
          </Typography>
        </Box>
      </Container>
    </PageTransition>
  );
}
