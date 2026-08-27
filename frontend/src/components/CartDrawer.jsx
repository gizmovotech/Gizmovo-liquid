import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, Trash2, Truck, ArrowRight, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/lib/api";
import { formatMoney, imgUrl } from "@/lib/format";
import { BRAND } from "@/lib/config";
import QuantityStepper from "@/components/QuantityStepper";

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateQty, removeItem, addItem, addingId } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  useEffect(() => {
    if (drawerOpen && recs.length === 0) {
      getProducts({ best_seller: true }).then(setRecs).catch(() => {});
    }
  }, [drawerOpen, recs.length]);

  const inCart = new Set(items.map((i) => i.slug));
  const upsell = recs.filter((p) => !inCart.has(p.slug) && p.available !== false).slice(0, 2);

  const goToCheckout = () => {
    setDrawerOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            data-testid="cart-drawer-overlay"
          />
          <motion.aside
            data-testid="cart-drawer"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-navy-900/10 px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
                Your Bag
                {cart.count > 0 && (
                  <span className="rounded-full bg-navy-900 px-2 py-0.5 text-xs text-cream">
                    {cart.count}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                data-testid="cart-drawer-close"
                aria-label="Close bag"
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900/5">
                  <ShoppingBag className="h-8 w-8 text-navy-900/40" strokeWidth={1.5} />
                </div>
                <p className="mt-6 font-display text-xl font-semibold text-navy-900">
                  Your bag is empty
                </p>
                <p className="mt-2 text-sm text-navy-900/60">
                  Good things are one tap away.
                </p>
                <button
                  className="btn-primary mt-6"
                  data-testid="cart-empty-shop-btn"
                  onClick={() => { setDrawerOpen(false); navigate("/shop"); }}
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                  <div className="flex items-center gap-2 rounded-xl bg-navy-900/5 px-4 py-3 text-xs font-medium text-navy-900/70">
                    <Truck className="h-4 w-4 text-gold" />
                    {BRAND.freeShippingMessage} — always.
                  </div>
                  <ul className="mt-4 space-y-4">
                    {items.map((it) => (
                      <li
                        key={it.item_id}
                        data-testid={`cart-item-${it.slug}`}
                        className="flex gap-4"
                      >
                        <Link
                          to={`/products/${it.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white"
                        >
                          <img
                            src={imgUrl(it.image, 200)}
                            alt={it.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="overline">{it.category}</p>
                              <Link
                                to={`/products/${it.slug}`}
                                onClick={() => setDrawerOpen(false)}
                                className="font-display text-sm font-semibold leading-tight text-navy-900"
                              >
                                {it.name}
                              </Link>
                              {it.variant && (
                                <p className="mt-0.5 text-xs text-navy-900/50">{it.variant}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(it.item_id)}
                              data-testid={`cart-remove-${it.slug}`}
                              aria-label={`Remove ${it.name}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-900/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QuantityStepper
                              size="sm"
                              value={it.quantity}
                              max={5}
                              onChange={(q) => updateQty(it.item_id, q)}
                              testId={`cart-${it.slug}`}
                            />
                            <span className="font-display text-sm font-semibold text-navy-900">
                              {formatMoney(it.line_total)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {upsell.length > 0 && (
                    <div className="mt-6 border-t border-navy-900/10 pt-5" data-testid="cart-upsell">
                      <p className="overline">You may also like</p>
                      <ul className="mt-3 space-y-2.5">
                        {upsell.map((p) => (
                          <li key={p.slug} className="flex items-center gap-3" data-testid={`upsell-${p.slug}`}>
                            <Link to={`/products/${p.slug}`} onClick={() => setDrawerOpen(false)} className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                              <img src={imgUrl(p.images[0], 120)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-sm font-semibold text-navy-900">{p.name}</p>
                              <p className="text-sm text-navy-900/60">{formatMoney(p.price)}</p>
                            </div>
                            <button
                              onClick={() => addItem(p, { openDrawer: false })}
                              disabled={addingId === p.id}
                              data-testid={`upsell-add-${p.slug}`}
                              aria-label={`Add ${p.name} to bag`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 transition-colors hover:border-gold hover:bg-gold hover:text-navy-900 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border-t border-navy-900/10 bg-white/60 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-900/70">Subtotal</span>
                    <span
                      data-testid="cart-subtotal"
                      className="font-display text-xl font-bold text-navy-900"
                    >
                      {formatMoney(cart.subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy-900/50">
                    Shipping is on us. Taxes calculated at checkout.
                  </p>
                  <button
                    onClick={goToCheckout}
                    data-testid="cart-drawer-checkout-btn"
                    className="btn-primary mt-4 w-full"
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setDrawerOpen(false); navigate("/cart"); }}
                    data-testid="cart-drawer-viewbag-btn"
                    className="mt-2 w-full py-2 text-center text-sm font-medium text-navy-900/70 underline-offset-4 hover:underline"
                  >
                    View full bag
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
