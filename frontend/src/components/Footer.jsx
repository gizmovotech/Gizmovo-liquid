import { Link } from "react-router-dom";
import { useState } from "react";
import { BRAND } from "@/lib/config";
import { subscribeNewsletter } from "@/lib/api";
import { toast } from "sonner";
import { Instagram, Mail, ArrowRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Best Sellers", to: "/shop?filter=best" },
      { label: "Categories", to: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Shipping", to: "/faq#shipping" },
      { label: "Returns", to: "/faq#returns" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "About",
    links: [{ label: "Our Story", to: "/about" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/faq#legal" },
      { label: "Terms", to: "/faq#legal" },
      { label: "Refund Policy", to: "/faq#returns" },
      { label: "Shipping Policy", to: "/faq#shipping" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const res = await subscribeNewsletter(email);
      toast.success(res.message || "You're on the list.");
      setEmail("");
    } catch {
      toast.error("Enter a valid email and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer data-testid="footer" className="bg-navy-900 text-cream">
      <div className="container-gizmo py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          {/* Brand + newsletter */}
          <div className="max-w-sm">
            <Link to="/" className="font-display text-3xl font-bold tracking-tight">
              {BRAND.name.toLowerCase()}<span className="text-gold">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Genuinely useful gadgets and everyday upgrades — curated, not dumped
              into a catalog. {BRAND.freeShippingMessage}.
            </p>
            <form onSubmit={submit} className="mt-7" data-testid="footer-newsletter-form">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Get the good stuff first
              </label>
              <div className="mt-3 flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 p-1.5 pl-5 focus-within:border-cream/50">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  data-testid="footer-newsletter-input"
                  className="w-full bg-transparent text-sm text-cream placeholder:text-cream/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy}
                  data-testid="footer-newsletter-submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900 transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-cream/90">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-cream/60 transition-colors hover:text-cream"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-instagram"
              className="flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-cream"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-cream"
            >
              <Mail className="h-4 w-4" /> {BRAND.supportEmail}
            </a>
          </div>
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
