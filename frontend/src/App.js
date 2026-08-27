import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import CartPage from "@/pages/CartPage";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections/:category" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:orderNo" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0F2740",
              color: "#FBF7EE",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
