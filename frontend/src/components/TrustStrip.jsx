import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Free shipping", sub: "Across India, always" },
  { icon: RotateCcw, title: "7-day returns", sub: "Changed your mind? Easy" },
  { icon: ShieldCheck, title: "Secure checkout", sub: "Encrypted & protected" },
  { icon: Headphones, title: "Real support", sub: "We actually reply" },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-navy-900/10 bg-beige" data-testid="trust-strip">
      <div className="container-gizmo grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:grid-cols-4 md:py-7">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900/5">
              <it.icon className="h-5 w-5 text-navy-900" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-navy-900">{it.title}</p>
              <p className="text-xs text-navy-900/55">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
