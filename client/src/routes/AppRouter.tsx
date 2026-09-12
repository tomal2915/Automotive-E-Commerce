import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductListPage from "../pages/ProductListPage";
import CartPage from "../pages/CartPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminProductCreatePage from "../pages/AdminProductCreatePage";
import ProfilePage from "../pages/ProfilePage";
import WishlistPage from "../pages/WishlistPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import AdminProductEditPage from "../pages/AdminProductEditPage";
import AdminProductListPage from "../pages/AdminProductListPage";
import AdminCouponsPage from "../pages/AdminCouponsPage";
import AddressBookPage from "../pages/AddressBookPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import CheckInboxPage from "../pages/CheckInboxPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AdminReturnsPage from "../pages/AdminReturnsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import NotFoundPage from "../pages/NotFoundPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";
import AdminCategoriesPage from "../pages/AdminCategoriesPage";
import LandingPage from "../pages/LandingPage";
import AdminTestimonialsPage from "../pages/AdminTestimonialsPage";
import AdminLayout from "../layouts/AdminLayout";

import AdminBrandsPage from "../pages/AdminBrandsPage";
import RequirePermission from "./RequirePermission";
import AdminRolesPage from "../pages/AdminRolesPage";
import AdminPermissionsPage from "../pages/AdminPermissionsPage";
import AdminAttributesPage from "../pages/AdminAttributesPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/check-inbox" element={<CheckInboxPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="*" element={<NotFoundPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/addresses" element={<AddressBookPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route element={<RequirePermission permission="product:watch" />}>
            <Route path="/admin/products" element={<AdminProductListPage />} />
            <Route
              path="/admin/products/new"
              element={<AdminProductCreatePage />}
            />
            <Route
              path="/admin/products/:id/edit"
              element={<AdminProductEditPage />}
            />
          </Route>
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/brands" element={<AdminBrandsPage />} />
          <Route path="/admin/attributes" element={<AdminAttributesPage />} />

          <Route element={<RequirePermission permission="role:watch" />}>
            <Route path="/admin/roles" element={<AdminRolesPage />} />
          </Route>
          <Route element={<RequirePermission permission="permission:watch" />}>
            <Route
              path="/admin/permissions"
              element={<AdminPermissionsPage />}
            />
          </Route>

          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/returns" element={<AdminReturnsPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route
            path="/admin/testimonials"
            element={<AdminTestimonialsPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
