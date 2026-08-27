import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { Compass, Filter, Sparkles, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/config";

const VALUES = [
  { icon: Compass, title: "We hunt", body: "We dig through hundreds of products to find the few that are genuinely clever and genuinely useful." },
  { icon: Filter, title: "We filter hard", body: "Most things don't make the cut. If we wouldn't keep it on our own desk, it doesn't go on the shelf." },
  { icon: Sparkles, title: "We keep it honest", body: "Real prices, free shipping, no fake reviews or urgency. Just good products, presented well." },
];

export default function About() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="bg-navy-900 text-cream">
        <div className="container-gizmo py-20 lg:py-28">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
          >
            Our story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            A small brand for genuinely useful things.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70"
          >
            {BRAND.name} started with a simple frustration: the internet is full of
            gadgets, but most of them are junk. We wanted a place where every
            single product earns its spot.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="container-gizmo py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              We're not trying to be Amazon.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-4 text-navy-900/70">
            <p>
              We're a young, independent store with a deliberately small catalog.
              Instead of thousands of listings, we carry a handful of things we
              genuinely believe make everyday life a little better.
            </p>
            <p>
              That means we can actually stand behind what we sell. We test the
              ideas, write honest descriptions, price things fairly, and ship them
              free across India.
            </p>
            <p>
              We're just getting started — and we're building this in the open,
              one useful product at a time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-beige py-16 lg:py-24">
        <div className="container-gizmo">
          <Reveal>
            <p className="overline">How we work</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Fewer, better things.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="rounded-3xl border border-navy-900/10 bg-white p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900">
                  <v.icon className="h-5 w-5 text-cream" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/60">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-gizmo py-16 text-center lg:py-24">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Come see what made the cut.
          </h2>
          <Link to="/shop" className="btn-primary mt-8">
            Browse the shop <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
