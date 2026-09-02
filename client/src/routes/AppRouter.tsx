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

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/addresses" element={<AddressBookPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/products" element={<AdminProductListPage />} />
        <Route
          path="/admin/products/new"
          element={<AdminProductCreatePage />}
        />
        <Route
          path="/admin/products/:id/edit"
          element={<AdminProductEditPage />}
        />
        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
      </Route>
    </Routes>
  );
}
