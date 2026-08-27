import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatMoney, imgUrl } from "@/lib/format";
import { checkout } from "@/lib/api";
import { toast } from "sonner";
import { Spinner } from "@/components/Loaders";
import PaymentBadges from "@/components/PaymentBadges";
import { Lock, ArrowLeft, ShieldCheck, Truck } from "lucide-react";

const FIELDS = [
  { k: "full_name", label: "Full name", type: "text", col: "sm:col-span-2", ph: "Aarav Sharma" },
  { k: "email", label: "Email", type: "email", col: "", ph: "you@email.com" },
  { k: "phone", label: "Phone", type: "tel", col: "", ph: "+91 98765 43210" },
  { k: "address1", label: "Address", type: "text", col: "sm:col-span-2", ph: "House / flat, street" },
  { k: "address2", label: "Apartment, landmark (optional)", type: "text", col: "sm:col-span-2", ph: "" },
  { k: "city", label: "City", type: "text", col: "", ph: "Mumbai" },
  { k: "state", label: "State", type: "text", col: "", ph: "Maharashtra" },
  { k: "pincode", label: "PIN code", type: "text", col: "", ph: "400001" },
];

export default function Checkout() {
  const { cart, cartId, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "",
  });
  const [busy, setBusy] = useState(false);
  const items = cart.items || [];

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="container-gizmo flex min-h-[60vh] flex-col items-center justify-center py-20 text-center" data-testid="checkout-empty">
        <h1 className="font-display text-3xl font-bold text-navy-900">Nothing to check out</h1>
        <p className="mt-2 text-navy-900/60">Your bag is empty.</p>
        <Link to="/shop" className="btn-primary mt-6">Go shopping</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await checkout({ cart_id: cartId, ...form });
      await refresh();
      toast.success("Order placed!");
      navigate(`/order/${res.order_no}`, { state: { order: res.order } });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Couldn't place the order. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-gizmo py-10 lg:py-16" data-testid="checkout-page">
      <button onClick={() => navigate("/cart")} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 link-underline">
        <ArrowLeft className="h-4 w-4" /> Back to bag
      </button>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-navy-900">Checkout</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        {/* Form */}
        <form onSubmit={submit} data-testid="checkout-form">
          <h2 className="font-display text-xl font-bold text-navy-900">Shipping details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.k} className={f.col}>
                <label htmlFor={`f-${f.k}`} className="text-sm font-semibold text-navy-900">{f.label}</label>
                <input
                  id={`f-${f.k}`}
                  type={f.type}
                  required={f.k !== "address2"}
                  value={form[f.k]}
                  onChange={update(f.k)}
                  placeholder={f.ph}
                  data-testid={`checkout-${f.k}`}
                  className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-sm placeholder:text-navy-900/50 focus:border-navy-900 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Payment placeholder — wire Shopify + Razorpay here */}
          <div className="mt-8 rounded-2xl border border-dashed border-navy-900/25 bg-white p-5" data-testid="payment-placeholder">
            <div className="flex items-center gap-2 text-navy-900">
              <Lock className="h-4 w-4" />
              <span className="font-display font-semibold">Payment</span>
            </div>
            <p className="mt-2 text-sm text-navy-900/60">
              Secure payment (Razorpay via Shopify) will be handled at this step.
              For now, placing the order creates it in <span className="font-semibold">pending payment</span> status
              so you can wire up your live payment provider.
            </p>
            <PaymentBadges className="mt-4" />
          </div>

          <button type="submit" disabled={busy} data-testid="checkout-place-order" className="btn-primary mt-6 w-full text-base">
            {busy ? <Spinner /> : <Lock className="h-5 w-5" />} Place order · {formatMoney(cart.subtotal)}
          </button>
          <p className="mt-3 text-center text-xs text-navy-900/45">
            By placing this order you agree to our terms. No card is charged in this demo.
          </p>
        </form>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-7">
            <h2 className="font-display text-lg font-bold text-navy-900">Your order</h2>
            <ul className="mt-5 space-y-4">
              {items.map((it) => (
                <li key={it.item_id} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <img src={imgUrl(it.image, 120)} alt={it.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-900 px-1 text-[10px] font-bold text-cream">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-navy-900">{it.name}</p>
                    {it.variant && <p className="text-xs text-navy-900/50">{it.variant}</p>}
                  </div>
                  <span className="text-sm font-semibold text-navy-900">{formatMoney(it.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 border-t border-navy-900/10 pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-900/60">Subtotal</span>
                <span className="font-semibold text-navy-900">{formatMoney(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-900/60">Shipping</span>
                <span className="font-semibold text-navy-900">Free</span>
              </div>
              <div className="flex justify-between border-t border-navy-900/10 pt-3">
                <span className="font-display font-semibold text-navy-900">Total</span>
                <span className="font-display text-xl font-bold text-navy-900">{formatMoney(cart.subtotal)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 px-2 text-xs text-navy-900/55">
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Encrypted, secure checkout</p>
            <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free shipping across India</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
