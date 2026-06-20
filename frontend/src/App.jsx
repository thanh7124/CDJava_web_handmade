import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./views/user/Home";
import ListProduct from "./views/user/ListProduct";
import ProductDetail from "./views/user/ProductDetail";
import Cart from "./views/user/Cart";
import Login from "./views/user/Login";
import Register from "./views/user/Register";
import Checkout from "./views/user/Checkout";
import About from "./views/user/About";
import Profile from "./views/user/Profile";
import Orders from "./views/user/Orders";
import OrderDetail from "./views/user/OrderDetail";

import Dashboard from "./views/admin/Dashboard";
import ManageProducts from "./views/admin/ManageProducts";
import ManageOrders from "./views/admin/ManageOrders";
import ManageUsers from "./views/admin/ManageUsers";
import ManageCategories from "./views/admin/ManageCategories";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/manage-products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
        <Route path="/manage-orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
        <Route path="/manage-users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="/manage-categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
