import { PublicSection } from "./public-section";
import type { OpeningHours } from "@/core/validation/common.schema";
import type { WeekDay } from "@/types/common";

type PublicOpeningHoursProps = {
  openingHours: OpeningHours;
};

const DAY_LABEL: Record<WeekDay, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
};

const DAY_ORDER: readonly WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function formatSlot(slot: { open: string; close: string }): string {
  return `${slot.open} – ${slot.close}`;
}

export function PublicOpeningHours({ openingHours }: PublicOpeningHoursProps) {
  if (openingHours.length === 0) return null;

  // Sortiere nach Wochentag-Reihenfolge.
  const byDay = new Map(openingHours.map((d) => [d.day, d] as const));
  const ordered = DAY_ORDER.map((day) => byDay.get(day)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d),
  );

  return (
    <PublicSection
      id="oeffnungszeiten"
      eyebrow="Öffnungszeiten"
      title="Wann wir für Sie da sind."
    >
      <div className="mx-auto max-w-xl">
        <ul
          className="divide-y rounded-theme-card border"
          style={{
            borderColor: "rgb(var(--theme-border))",
            backgroundColor: "rgb(var(--theme-background))",
          }}
        >
          {ordered.map((day) => (
            <li
              key={day.day}
              className="flex items-start justify-between gap-4 px-5 py-3 text-sm"
            >
              <span className="font-medium">{DAY_LABEL[day.day]}</span>
              {day.closed || day.slots.length === 0 ? (
                <span style={{ color: "rgb(var(--theme-muted-fg))" }}>geschlossen</span>
              ) : (
                <span
                  className="text-right tabular-nums"
                  style={{ color: "rgb(var(--theme-foreground))" }}
                >
                  {day.slots.map(formatSlot).join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p
          className="mt-3 text-center text-xs"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          An Feiertagen abweichend – bitte vorher anrufen.
        </p>
      </div>
    </PublicSection>
  );
}
