import { ANNOUNCEMENTS } from "@/lib/config";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

const ICONS = [Truck, RotateCcw, ShieldCheck];

export default function AnnouncementBar() {
  const items = ANNOUNCEMENTS;
  return (
    <div
      data-testid="announcement-bar"
      className="bg-navy-900 text-cream"
      role="region"
      aria-label="Store announcements"
    >
      <div className="container-gizmo flex h-9 items-center justify-center overflow-hidden">
        <div className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.18em] sm:gap-12">
          {items.map((text, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <span key={text} className={`flex items-center gap-2 ${i > 0 ? "hidden sm:flex" : "flex"}`}>
                <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                {text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
