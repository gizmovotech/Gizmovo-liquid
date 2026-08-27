import { useEffect, useState } from "react";
import { getProducts, getCategories } from "@/lib/api";
import { FAQS } from "@/lib/faqs";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProductRail from "@/components/home/ProductRail";
import CategoryBento from "@/components/home/CategoryBento";
import Storytelling from "@/components/home/Storytelling";
import WhyGizmovo from "@/components/home/WhyGizmovo";
import InstagramSection from "@/components/home/InstagramSection";
import NewsletterCTA from "@/components/home/NewsletterCTA";
import FaqAccordion from "@/components/FaqAccordion";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProducts({ best_seller: true }).then(setBestSellers).catch(() => {});
    getProducts({ badge: "New Drop" }).then(setNewDrops).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <>
      <Hero />
      <TrustStrip />

      <ProductRail
        testId="best-sellers"
        overline="Loved by many"
        title="Best sellers"
        description="The pieces people keep coming back for."
        products={bestSellers}
        cta="/shop?filter=best"
        ctaLabel="Shop all best sellers"
      />

      <CategoryBento categories={categories} />

      <Storytelling />

      {newDrops.length > 0 && (
        <ProductRail
          testId="new-drops"
          overline="Just landed"
          title="New drops"
          description="Fresh finds, added to the shelf."
          products={newDrops}
          cta="/shop"
        />
      )}

      <WhyGizmovo />

      <InstagramSection />

      {/* FAQ */}
      <section className="bg-beige py-14 lg:py-20" data-testid="home-faq">
        <div className="container-gizmo grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal>
            <p className="overline">Good to know</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Questions, answered.
            </h2>
            <p className="mt-4 max-w-sm text-navy-900/60">
              Everything you might want to know before you buy. Still curious?
              We're an email away.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <FaqAccordion items={FAQS.slice(0, 6)} testId="home-faq-accordion" />
          </Reveal>
        </div>
      </section>

      <NewsletterCTA />
    </>
  );
}
