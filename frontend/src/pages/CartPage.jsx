import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatMoney, imgUrl } from "@/lib/format";
import QuantityStepper from "@/components/QuantityStepper";
import { Trash2, ShoppingBag, Truck, ArrowRight, ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/config";

export default function CartPage() {
  const { cart, updateQty, removeItem } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container-gizmo flex min-h-[60vh] flex-col items-center justify-center py-20 text-center" data-testid="cart-page-empty">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900/5">
          <ShoppingBag className="h-9 w-9 text-navy-900/40" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">Your bag is empty</h1>
        <p className="mt-2 text-navy-900/60">Let's fix that — good things await.</p>
        <Link to="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-gizmo py-10 lg:py-16" data-testid="cart-page">
      <h1 className="font-display text-4xl font-bold tracking-tight text-navy-900">Your bag</h1>
      <p className="mt-2 text-navy-900/60">{cart.count} {cart.count === 1 ? "item" : "items"}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        {/* Items */}
        <div>
          <ul className="divide-y divide-navy-900/10 border-y border-navy-900/10">
            {items.map((it) => (
              <li key={it.item_id} className="flex gap-4 py-6" data-testid={`cart-page-item-${it.slug}`}>
                <Link to={`/products/${it.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/5">
                  <img src={imgUrl(it.image, 220)} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="overline">{it.category}</p>
                      <Link to={`/products/${it.slug}`} className="font-display text-base font-semibold text-navy-900">
                        {it.name}
                      </Link>
                      {it.variant && <p className="mt-0.5 text-sm text-navy-900/50">{it.variant}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-navy-900">{formatMoney(it.line_total)}</p>
                      {it.compare_at_price > it.price && (
                        <p className="text-xs text-navy-900/40 line-through">
                          {formatMoney(it.compare_at_price * it.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper size="sm" value={it.quantity} max={5} onChange={(q) => updateQty(it.item_id, q)} testId={`cartpage-${it.slug}`} />
                    <button
                      onClick={() => removeItem(it.item_id)}
                      data-testid={`cart-page-remove-${it.slug}`}
                      className="flex items-center gap-1.5 text-sm text-navy-900/50 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate("/shop")} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 link-underline">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </button>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-7">
            <h2 className="font-display text-xl font-bold text-navy-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-900/60">Subtotal</span>
                <span className="font-semibold text-navy-900" data-testid="cart-page-subtotal">{formatMoney(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-900/60">Shipping</span>
                <span className="font-semibold text-navy-900">Free</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-navy-900/10 pt-5">
              <span className="font-display font-semibold text-navy-900">Total</span>
              <span className="font-display text-2xl font-bold text-navy-900">{formatMoney(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-navy-900/45">Taxes calculated at checkout.</p>
            <button onClick={() => navigate("/checkout")} data-testid="cart-page-checkout-btn" className="btn-primary mt-5 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-900/55">
              <Truck className="h-4 w-4 text-gold" /> {BRAND.freeShippingMessage}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
