import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqAccordion({ items, testId = "faq" }) {
  return (
    <Accordion type="single" collapsible className="w-full" data-testid={testId}>
      {items.map((f, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-b border-navy-900/10"
          data-testid={`${testId}-item-${i}`}
        >
          <AccordionTrigger className="py-5 text-left font-display text-base font-semibold text-navy-900 hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-navy-900/65">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
