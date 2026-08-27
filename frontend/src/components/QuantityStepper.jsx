import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 5,
  size = "md",
  testId = "qty",
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const dims = size === "sm" ? "h-9" : "h-11";
  const btn = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <div
      className={`inline-flex ${dims} items-center rounded-full border border-navy-900/20 bg-white`}
      data-testid={`${testId}-stepper`}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        data-testid={`${testId}-dec`}
        className={`flex ${btn} items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 disabled:opacity-30`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        data-testid={`${testId}-value`}
        className="w-8 select-none text-center text-sm font-semibold tabular-nums text-navy-900"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        data-testid={`${testId}-inc`}
        className={`flex ${btn} items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 disabled:opacity-30`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
