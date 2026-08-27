import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/config";

const HERO_IMG =
  "https://images.unsplash.com/photo-1760587162690-95608c8ab2da?crop=entropy&cs=srgb&fm=jpg&q=90&w=1400";

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream" data-testid="hero">
      <div className="container-gizmo grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-8 lg:py-20">
        {/* Copy */}
        <div className="order-2 max-w-xl lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 bg-white px-3.5 py-1.5 text-xs font-medium text-navy-900/70"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Curated gadgets, not a catalog
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-navy-900 text-balance sm:text-5xl lg:text-6xl"
          >
            Little upgrades.
            <br />
            <span className="text-gold">Big</span> difference.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            className="mt-5 max-w-md text-base leading-relaxed text-navy-900/65 sm:text-lg"
          >
            Genuinely useful things you'll wonder how you lived without —
            hand-picked, honestly priced, and shipped free across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/shop?filter=best" className="btn-primary" data-testid="hero-primary-cta">
              Shop best sellers <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="btn-secondary" data-testid="hero-secondary-cta">
              Explore all
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-9 flex items-center gap-6 text-sm text-navy-900/60"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Free shipping
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> 7-day returns
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Secure checkout
            </span>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="order-1 lg:order-2"
        >
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-900 lg:aspect-[5/4]">
              <img
                src={HERO_IMG}
                alt="A curated set of everyday gadgets on a desk"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
            </div>
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease }}
              className="absolute -bottom-5 left-4 rounded-2xl bg-cream/95 p-4 shadow-xl backdrop-blur sm:left-6"
            >
              <p className="font-display text-2xl font-bold text-navy-900">10+</p>
              <p className="text-xs text-navy-900/60">carefully chosen products</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
