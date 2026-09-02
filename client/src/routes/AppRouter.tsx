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

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProductListPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route
          path="/admin/products/new"
          element={<AdminProductCreatePage />}
        />
      </Route>
    </Routes>
  );
}
