import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getCategories } from "@/lib/api";
import { BRAND } from "@/lib/config";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar({ onOpenSearch }) {
  const { cart, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const catRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setCatOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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

  const go = (to) => { setMobileOpen(false); navigate(to); };

  return (
    <header
      data-testid="navbar"
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-navy-900/10 bg-cream/85 backdrop-blur-xl" : "bg-cream/60 backdrop-blur-md"
      }`}
    >
      <nav className="container-gizmo flex h-16 items-center justify-between lg:h-[72px]">
        {/* Left */}
        <div className="flex items-center gap-2 lg:w-1/3">
          <button
            data-testid="mobile-menu-btn"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="hidden items-center gap-7 lg:flex">
            <NavLink to="/shop" data-testid="nav-shop" className="link-underline rounded text-sm font-medium text-navy-900/80 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">Shop</NavLink>
            <NavLink to="/shop?filter=best" data-testid="nav-best-sellers" className="link-underline rounded text-sm font-medium text-navy-900/80 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">Best Sellers</NavLink>
            <div className="relative" ref={catRef} onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button
                data-testid="nav-categories"
                className="flex items-center gap-1 rounded text-sm font-medium text-navy-900/80 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
                onClick={() => setCatOpen(true)}
                aria-expanded={catOpen}
                aria-haspopup="true"
              >
                Categories <ChevronDown className={`h-3.5 w-3.5 transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    data-testid="categories-dropdown"
                    className="absolute left-0 top-full w-56 overflow-hidden rounded-2xl border border-navy-900/10 bg-cream p-2 shadow-xl"
                  >
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => { setCatOpen(false); navigate(`/collections/${c.slug}`); }}
                        data-testid={`nav-cat-${c.slug}`}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-navy-900/80 transition-colors hover:bg-navy-900/5 hover:text-navy-900"
                      >
                        {c.name}
                        <ChevronRight className="h-4 w-4 text-navy-900/30" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavLink to="/about" data-testid="nav-about" className="link-underline rounded text-sm font-medium text-navy-900/80 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">About</NavLink>
          </div>
        </div>

        {/* Logo */}
        <Link to="/" data-testid="logo-link" className="flex items-center justify-center lg:w-1/3 focus-visible:outline-none" aria-label={`${BRAND.name} home`}>
          <span className="font-display text-2xl font-bold tracking-tight text-navy-900">
            {BRAND.name.toLowerCase()}<span className="text-gold">.</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 lg:w-1/3">
          <button data-testid="search-open-btn" className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600" aria-label="Search" onClick={onOpenSearch}>
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button data-testid="cart-open-btn" className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600" aria-label={`Bag, ${cart.count} items`} onClick={() => setDrawerOpen(true)}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            {cart.count > 0 && (
              <span data-testid="cart-count-badge" className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-900 px-1 text-[10px] font-bold text-cream">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div
              data-testid="mobile-menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-cream lg:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              role="dialog" aria-modal="true" aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between border-b border-navy-900/10 px-5">
                <span className="font-display text-xl font-bold text-navy-900">{BRAND.name.toLowerCase()}<span className="text-gold">.</span></span>
                <button data-testid="mobile-menu-close" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-navy-900/5" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <button data-testid="mobile-search-btn" onClick={() => { setMobileOpen(false); onOpenSearch(); }} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900/60">
                  <Search className="h-4 w-4" /> Search products…
                </button>
                <button data-testid="mobile-nav-shop" onClick={() => go("/shop")} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-display text-lg font-medium text-navy-900 transition-colors hover:bg-navy-900/5">All Products</button>
                <button data-testid="mobile-nav-best-sellers" onClick={() => go("/shop?filter=best")} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-display text-lg font-medium text-navy-900 transition-colors hover:bg-navy-900/5">Best Sellers</button>

                <button
                  onClick={() => setMobileCatOpen((o) => !o)}
                  data-testid="mobile-nav-categories"
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-display text-lg font-medium text-navy-900 transition-colors hover:bg-navy-900/5"
                  aria-expanded={mobileCatOpen}
                >
                  Categories <ChevronDown className={`h-5 w-5 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileCatOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {categories.map((c) => (
                        <button key={c.slug} data-testid={`mobile-cat-${c.slug}`} onClick={() => go(`/collections/${c.slug}`)} className="flex w-full items-center rounded-xl py-3 pl-8 pr-4 text-left text-base text-navy-900/75 transition-colors hover:bg-navy-900/5">
                          {c.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button data-testid="mobile-nav-about" onClick={() => go("/about")} className="flex w-full items-center rounded-xl px-4 py-3.5 text-left font-display text-lg font-medium text-navy-900 transition-colors hover:bg-navy-900/5">About</button>
                <div className="my-3 border-t border-navy-900/10" />
                <button onClick={() => go("/faq")} className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base text-navy-900/70 transition-colors hover:bg-navy-900/5">FAQ &amp; Help</button>
                <button onClick={() => go("/contact")} className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base text-navy-900/70 transition-colors hover:bg-navy-900/5">Contact</button>
              </div>
              <div className="border-t border-navy-900/10 p-5 text-sm text-navy-900/60">{BRAND.freeShippingMessage}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
