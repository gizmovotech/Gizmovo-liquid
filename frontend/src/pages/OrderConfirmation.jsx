import { useLocation, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import { getOrder } from "@/lib/api";
import { BRAND } from "@/lib/config";
import { Check, Package, Mail, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const { orderNo } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);

  useEffect(() => {
    if (!order && orderNo) {
      getOrder(orderNo).then(setOrder).catch(() => {});
    }
  }, [order, orderNo]);

  return (
    <div className="container-gizmo py-16 lg:py-24" data-testid="order-confirmation">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-900"
        >
          <Check className="h-8 w-8 text-cream" strokeWidth={2.5} />
        </motion.div>

        <div className="mt-6 text-center">
          <p className="overline">Order confirmed</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Thank you{order?.full_name ? `, ${order.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-3 text-navy-900/60">
            Your order <span className="font-semibold text-navy-900" data-testid="order-number">{orderNo}</span> is
            in. We've noted your details and will confirm dispatch shortly.
          </p>
        </div>

        {order && (
          <div className="mt-10 rounded-3xl border border-navy-900/10 bg-white p-7">
            <h2 className="font-display text-lg font-bold text-navy-900">Order summary</h2>
            <ul className="mt-5 divide-y divide-navy-900/10">
              {order.items.map((it) => (
                <li key={it.item_id} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-navy-900">{it.name}</p>
                    <p className="text-xs text-navy-900/50">
                      Qty {it.quantity}{it.variant ? ` · ${it.variant}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-navy-900">{formatMoney(it.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-navy-900/10 pt-4">
              <span className="font-display font-semibold text-navy-900">Total</span>
              <span className="font-display text-xl font-bold text-navy-900">{formatMoney(order.total)}</span>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-beige p-5">
            <Package className="h-5 w-5 shrink-0 text-navy-900" strokeWidth={1.75} />
            <div>
              <p className="font-display text-sm font-semibold text-navy-900">What's next</p>
              <p className="mt-0.5 text-sm text-navy-900/60">We'll email you a tracking link once it ships.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-beige p-5">
            <Mail className="h-5 w-5 shrink-0 text-navy-900" strokeWidth={1.75} />
            <div>
              <p className="font-display text-sm font-semibold text-navy-900">Need help?</p>
              <a href={`mailto:${BRAND.supportEmail}`} className="mt-0.5 text-sm text-navy-900/60 underline-offset-2 hover:underline">
                {BRAND.supportEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/shop" className="btn-primary" data-testid="order-continue-shopping">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
