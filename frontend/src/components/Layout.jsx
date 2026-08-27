import { useState } from "react";
import { Outlet } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AnnouncementBar />
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
