import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";
import { predictiveSearch } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const SUGGESTIONS = ["Wireless charger", "Earbuds", "Desk", "Travel", "Power bank"];

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      setQ("");
      setResults({ products: [], categories: [] });
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setResults({ products: [], categories: [] });
      return;
    }
    setLoading(true);
    setError(false);
    const t = setTimeout(async () => {
      try {
        const data = await predictiveSearch(q);
        setResults(data);
      } catch {
        setError(true);
        setResults({ products: [], categories: [] });
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="search-overlay"
        >
          <div className="container-gizmo flex h-full flex-col py-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-full border border-navy-900/15 bg-white px-5 py-3.5">
                <Search className="h-5 w-5 shrink-0 text-navy-900/50" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products, categories…"
                  data-testid="search-input"
                  className="w-full bg-transparent text-base text-navy-900 placeholder:text-navy-900/40 focus:outline-none"
                />
              </div>
              <button
                onClick={onClose}
                data-testid="search-close-btn"
                aria-label="Close search"
                className="flex h-12 w-12 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto no-scrollbar">
              {!q.trim() && (
                <div>
                  <p className="overline">Popular searches</p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ(s)}
                        data-testid={`search-suggestion-${s.toLowerCase().replace(/\s/g, "-")}`}
                        className="rounded-full border border-navy-900/15 bg-white px-4 py-2 text-sm text-navy-900/80 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-cream"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.trim() && error && (
                <div className="py-16 text-center" data-testid="search-error">
                  <p className="font-display text-2xl font-semibold text-navy-900">
                    Search is unavailable right now
                  </p>
                  <p className="mt-2 text-navy-900/60">Please try again in a moment.</p>
                </div>
              )}

              {q.trim() && !loading && !error && !hasResults && (
                <div className="py-16 text-center" data-testid="search-empty">
                  <p className="font-display text-2xl font-semibold text-navy-900">
                    No matches for “{q}”
                  </p>
                  <p className="mt-2 text-navy-900/60">
                    Try a different word, or browse the full shop.
                  </p>
                  <Link to="/shop" onClick={onClose} className="btn-secondary mt-6">
                    Browse all products
                  </Link>
                </div>
              )}

              {results.categories.length > 0 && (
                <div className="mb-8">
                  <p className="overline">Categories</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {results.categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/collections/${c.slug}`}
                        onClick={onClose}
                        className="rounded-full bg-navy-900 px-4 py-2 text-sm text-cream"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length > 0 && (
                <div>
                  <p className="overline">Products</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {results.products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/products/${p.slug}`}
                          onClick={onClose}
                          data-testid={`search-result-${p.slug}`}
                          className="group flex items-center gap-4 rounded-2xl border border-navy-900/10 bg-white p-3 transition-colors hover:border-navy-900/30"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                            <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="overline">{p.category}</p>
                            <p className="truncate font-display text-sm font-semibold text-navy-900">{p.name}</p>
                            <p className="text-sm text-navy-900/70">{formatMoney(p.price)}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-navy-900/30 transition-colors group-hover:text-navy-900" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
