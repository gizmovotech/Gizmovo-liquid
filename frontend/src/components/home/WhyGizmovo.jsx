import { Search, PackageCheck, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    icon: Search,
    title: "Curated, not crammed",
    body: "A small, intentional catalog. Every product is chosen because it's actually good — no filler.",
  },
  {
    icon: PackageCheck,
    title: "Honest pricing & shipping",
    body: "One fair price with free shipping across India built in. No fake discounts, no surprises at checkout.",
  },
  {
    icon: HeartHandshake,
    title: "A real brand, real people",
    body: "Questions, returns, or help choosing — we reply. Support that treats you like a human.",
  },
];

export default function WhyGizmovo() {
  return (
    <section className="container-gizmo py-14 lg:py-20" data-testid="why-gizmovo">
      <Reveal>
        <p className="overline">Why Gizmovo</p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          A store you can actually trust.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 0.1}
            className="rounded-3xl border border-navy-900/10 bg-white p-7 transition-shadow duration-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900">
              <s.icon className="h-5 w-5 text-cream" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-900/60">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
