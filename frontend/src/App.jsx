import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoriteProvider } from "./context/FavoriteContext";

import Home from "./views/user/Home";
import ListProduct from "./views/user/ListProduct";
import ProductDetail from "./views/user/ProductDetail";
import Cart from "./views/user/Cart";
import Login from "./views/user/Login";
import Register from "./views/user/Register";
import Checkout from "./views/user/Checkout";
import About from "./views/user/About";
import Profile from "./views/user/Profile";
import Dashboard from "./views/admin/dashboard";
import ManageProducts from "./views/admin/ManageProducts";
import ManageOrders from "./views/admin/ManageOrders";
import ManageUsers from "./views/admin/ManageUsers";
import ManageCategories from "./views/admin/ManageCategories";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/manage-products" element={<ManageProducts />} />
              <Route path="/manage-orders" element={<ManageOrders />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-categories" element={<ManageCategories />} />
            </Routes>
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;