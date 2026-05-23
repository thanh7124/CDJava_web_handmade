import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./views/user/Home";
import ListProduct from "./views/user/ListProduct";
import ProductDetail from "./views/user/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;