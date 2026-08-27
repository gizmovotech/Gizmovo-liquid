import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND } from "@/lib/config";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { label: "Shop", to: "/shop" },
  { label: "Best Sellers", to: "/shop?filter=best" },
  { label: "Categories", to: "/shop" },
  { label: "About", to: "/about" },
];

export default function Navbar({ onOpenSearch }) {
  const { cart, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      data-testid="navbar"
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-navy-900/10 bg-cream/85 backdrop-blur-xl"
          : "bg-cream/60 backdrop-blur-md"
      }`}
    >
      <nav className="container-gizmo flex h-16 items-center justify-between lg:h-[72px]">
        {/* Left: mobile menu + desktop links */}
        <div className="flex items-center gap-2 lg:w-1/3">
          <button
            data-testid="mobile-menu-btn"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className="link-underline text-sm font-medium text-navy-900/80 transition-colors hover:text-navy-900"
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Center: logo */}
        <Link
          to="/"
          data-testid="logo-link"
          className="flex items-center justify-center lg:w-1/3"
          aria-label={`${BRAND.name} home`}
        >
          <span className="font-display text-2xl font-bold tracking-tight text-navy-900">
            {BRAND.name.toLowerCase()}
            <span className="text-gold">.</span>
          </span>
        </Link>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1 lg:w-1/3">
          <button
            data-testid="search-open-btn"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5"
            aria-label="Search"
            onClick={onOpenSearch}
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            data-testid="cart-open-btn"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5"
            aria-label={`Bag, ${cart.count} items`}
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            {cart.count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-900 px-1 text-[10px] font-bold text-cream"
              >
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              data-testid="mobile-menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-sm flex-col bg-cream lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 items-center justify-between border-b border-navy-900/10 px-5">
                <span className="font-display text-xl font-bold text-navy-900">
                  {BRAND.name.toLowerCase()}<span className="text-gold">.</span>
                </span>
                <button
                  data-testid="mobile-menu-close"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-navy-900/5"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-5">
                {NAV.map((n) => (
                  <button
                    key={n.label}
                    data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => { setMobileOpen(false); navigate(n.to); }}
                    className="flex items-center justify-between rounded-xl px-4 py-4 text-left font-display text-lg font-medium text-navy-900 transition-colors hover:bg-navy-900/5"
                  >
                    {n.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-navy-900/10 p-5 text-sm text-navy-900/60">
                {BRAND.freeShippingMessage}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
