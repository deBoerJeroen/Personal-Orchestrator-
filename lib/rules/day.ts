import { TZDate } from "@date-fns/tz";
import { addDays, differenceInCalendarDays, format, subHours } from "date-fns";

export const DEFAULT_TIMEZONE = "Europe/Amsterdam";
/**
 * Een "dag" loopt van 04:00 tot 04:00. Wie om 00:30 nog een gewoonte afvinkt,
 * doet dat voor de dag die net gevoeld is als vandaag — niet voor morgen.
 * Dit voorkomt de klassieke "ik miste een dag terwijl ik het net deed"-bug.
 */
export const DEFAULT_DAY_BOUNDARY_HOUR = 4;

export type DayOptions = {
  timezone?: string;
  boundaryHour?: number;
};

/** De logische dag (YYYY-MM-DD) waartoe `at` behoort. */
export function logicalDay(at: Date, options: DayOptions = {}): string {
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;
  const boundaryHour = options.boundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR;
  const local = new TZDate(at, timezone);
  return format(subHours(local, boundaryHour), "yyyy-MM-dd");
}

export function nextDay(day: string): string {
  return format(addDays(new Date(`${day}T12:00:00Z`), 1), "yyyy-MM-dd");
}

/** Hele kalenderdagen tussen nu en een deadline. Negatief = te laat. */
export function daysUntil(due: Date, now: Date, options: DayOptions = {}): number {
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;
  return differenceInCalendarDays(new TZDate(due, timezone), new TZDate(now, timezone));
}
