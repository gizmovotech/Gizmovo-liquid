import { Link } from "react-router-dom";
import FaqAccordion from "@/components/FaqAccordion";
import { FAQS } from "@/lib/faqs";
import { BRAND } from "@/lib/config";
import { Mail } from "lucide-react";

export default function FAQ() {
  return (
    <div data-testid="faq-page">
      <section className="bg-beige">
        <div className="container-gizmo py-14 lg:py-20">
          <nav className="flex items-center gap-2 text-xs text-navy-900/50" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-900">Home</Link>
            <span>/</span>
            <span className="text-navy-900">FAQ</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            Help & FAQ
          </h1>
          <p className="mt-3 max-w-md text-navy-900/60">
            The things people ask us most. Can't find your answer? We're one email away.
          </p>
        </div>
      </section>

      <section className="container-gizmo grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16 lg:py-20">
        <div id="shipping">
          <FaqAccordion items={FAQS} testId="faq-accordion" />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" id="returns">
          <div className="rounded-3xl bg-navy-900 p-8 text-cream" id="legal">
            <Mail className="h-6 w-6 text-gold" />
            <h2 className="mt-4 font-display text-xl font-bold">Still need help?</h2>
            <p className="mt-2 text-sm text-cream/70">
              Email our support team and a real person will get back to you.
            </p>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              data-testid="faq-support-email"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-navy-900 transition-transform hover:scale-[1.02]"
            >
              {BRAND.supportEmail}
            </a>
            <Link
              to="/contact"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Contact form
            </Link>
          </div>
          <p className="mt-4 px-2 text-xs leading-relaxed text-navy-900/40">
            Note: shipping timelines, returns and legal policies shown here are
            placeholders — replace with your finalised store policies before launch.
          </p>
        </aside>
      </section>
    </div>
  );
}
