import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";
import { toast } from "sonner";

export default function NewsletterCTA() {
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
    <section className="container-gizmo py-14 lg:py-20" data-testid="newsletter-cta">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-14 text-center text-cream sm:px-12 lg:py-20"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Be first in line
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          New drops, before everyone else.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-cream/65">
          Join the list for early access to new products and the occasional
          genuinely-good offer. No spam, ever.
        </p>
        <form
          onSubmit={submit}
          data-testid="newsletter-cta-form"
          className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-cream/20 bg-cream/5 p-1.5 pl-5"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            data-testid="newsletter-cta-input"
            className="w-full bg-transparent text-sm text-cream placeholder:text-cream/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            data-testid="newsletter-cta-submit"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gold px-5 text-sm font-semibold text-navy-900 transition-[transform,background-color] hover:bg-[#A67A3D] hover:scale-[1.03] disabled:opacity-50"
          >
            Join <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </section>
  );
}
