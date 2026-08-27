// Truthful payment-method signals (methods available via the payment provider).
const METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets"];

export default function PaymentBadges({ dark = false, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} data-testid="payment-badges" aria-label="Accepted payment methods">
      {METHODS.map((m) => (
        <span
          key={m}
          className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
            dark ? "border-cream/20 text-cream/70" : "border-navy-900/15 bg-white text-navy-900/70"
          }`}
        >
          {m}
        </span>
      ))}
    </div>
  );
}
