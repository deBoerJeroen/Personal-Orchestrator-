/**
 * Eén bestand, in één blik te overzien. Dat is een productregel, geen toeval.
 *
 * Regel uit CLAUDE.md: geen nieuwe tabel zonder een geschrapte.
 * Fase 1 = user/area/goal/project/action/inbox_item/check_in/activity_event.
 * Fase 2 = identity/habit/habit_log. Fase 3 = review_session/coach_note.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * Auth (better-auth). Veldnamen moeten matchen met better-auth.
 * ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Eigen velden. Een "dag" loopt van 04:00 tot 04:00, zodat een late avond
  // geen gemiste dag oplevert.
  timezone: text("timezone").notNull().default("Europe/Amsterdam"),
  dayBoundaryHour: integer("day_boundary_hour").notNull().default(4),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ *
 * Domeintypes
 * ------------------------------------------------------------------ */

export type AreaSlug = "werk" | "prive";
export type GoalStatus = "active" | "paused" | "achieved" | "dropped";
export type ProjectStatus = "active" | "on_hold" | "someday" | "done" | "dropped";
export type ActionStatus = "next" | "waiting" | "scheduled" | "done" | "dropped" | "someday";
export type ActionKind = "action" | "motion";
export type ActionContext = "laptop" | "telefoon" | "thuis" | "onderweg";
export type Energy = "laag" | "normaal" | "hoog";
export type ActionSource = "capture" | "inbox" | "coach" | "review" | "habit" | "checkin";
export type InboxStatus = "open" | "processed" | "dropped";
export type CheckInKind = "morning" | "evening";
export type HabitType = "build" | "break";
export type HabitStatus = "active" | "paused" | "archived";
export type HabitLevel = "minimal" | "normal" | "skipped";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // Soft delete overal. Hard verwijderen gebeurt alleen bij accountverwijdering.
  archivedAt: timestamp("archived_at", { withTimezone: true }),
};

/* ------------------------------------------------------------------ *
 * Fase 1
 * ------------------------------------------------------------------ */

export const area = pgTable(
  "area",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").$type<AreaSlug>().notNull(),
    sort: integer("sort").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("area_user_slug_idx").on(t.userId, t.slug)],
);

export const goal = pgTable(
  "goal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    areaId: uuid("area_id")
      .notNull()
      .references(() => area.id, { onDelete: "restrict" }),
    identityId: uuid("identity_id"),
    title: text("title").notNull(),
    why: text("why"),
    outcome: text("outcome"),
    /** Vrij tekstveld ("dit jaar", "voor de zomer"). Bewust geen datepicker. */
    horizon: text("horizon"),
    status: text("status").$type<GoalStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [index("goal_user_status_idx").on(t.userId, t.status)],
);

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    areaId: uuid("area_id")
      .notNull()
      .references(() => area.id, { onDelete: "restrict" }),
    goalId: uuid("goal_id").references(() => goal.id, { onDelete: "set null" }),
    /** Geformuleerd als uitkomst: "Teampresentatie klaar en gedeeld". */
    title: text("title").notNull(),
    outcome: text("outcome"),
    status: text("status").$type<ProjectStatus>().notNull().default("active"),
    /** Alleen echte deadlines. Nooit automatisch invullen. */
    dueAt: timestamp("due_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    ...timestamps,
  },
  (t) => [index("project_user_status_idx").on(t.userId, t.status)],
);

export const action = pgTable(
  "action",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    areaId: uuid("area_id")
      .notNull()
      .references(() => area.id, { onDelete: "restrict" }),
    projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
    /** Fysiek en zichtbaar. "Bel de huisarts", niet "financiën regelen". */
    title: text("title").notNull(),
    context: text("context").$type<ActionContext>(),
    estimateMinutes: integer("estimate_minutes"),
    energy: text("energy").$type<Energy>().notNull().default("normaal"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    scheduledFor: date("scheduled_for"),
    status: text("status").$type<ActionStatus>().notNull().default("next"),
    /** Wie/wat. Vervangt een aparte WaitingFor-tabel. */
    waitingOn: text("waiting_on"),
    kind: text("kind").$type<ActionKind>().notNull().default("action"),
    /** Verplicht als kind = motion: waar leidt deze voorbereiding toe? */
    leadsTo: text("leads_to"),
    /** Precies één niveau diep, alleen gebruikt door "maak kleiner". */
    parentActionId: uuid("parent_action_id"),
    source: text("source").$type<ActionSource>().notNull().default("capture"),
    postponedCount: integer("postponed_count").notNull().default(0),
    /** Op welke dag deze actie bij de dagelijkse top 3 stond. */
    focusDate: date("focus_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("action_user_status_idx").on(t.userId, t.status),
    index("action_project_idx").on(t.projectId),
    index("action_focus_idx").on(t.userId, t.focusDate),
  ],
);

export const inboxItem = pgTable(
  "inbox_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Het enige veld bij capture. Nooit een formulier van maken. */
    rawText: text("raw_text").notNull(),
    status: text("status").$type<InboxStatus>().notNull().default("open"),
    processedIntoType: text("processed_into_type"),
    processedIntoId: uuid("processed_into_id"),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [index("inbox_user_status_idx").on(t.userId, t.status)],
);

export const checkIn = pgTable(
  "check_in",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    kind: text("kind").$type<CheckInKind>().notNull(),
    energy: integer("energy"),
    mode: text("mode"),
    /**
     * PRIVACYGEVOELIG. Alle reflectie-antwoorden, allemaal optioneel.
     * Mag nooit in logs, events of standaard-CLI-output terechtkomen.
     */
    answers: jsonb("answers").$type<Record<string, string>>().notNull().default({}),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("checkin_user_date_kind_idx").on(t.userId, t.date, t.kind)],
);

/**
 * Append-only gebeurtenislog. De basis onder motion-detectie, patronen en het
 * meetplan. `meta` bevat NOOIT vrije tekst van de gebruiker — alleen ids,
 * tellingen en enum-waarden.
 */
export const activityEvent = pgTable(
  "activity_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    meta: jsonb("meta").$type<Record<string, string | number | boolean>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("event_user_type_time_idx").on(t.userId, t.type, t.occurredAt)],
);

/* ------------------------------------------------------------------ *
 * Fase 2 — gewoontes
 * ------------------------------------------------------------------ */

export const identity = pgTable("identity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  areaId: uuid("area_id").references(() => area.id, { onDelete: "set null" }),
  /** "Ik ben iemand die afspraken met zichzelf nakomt." */
  statement: text("statement").notNull(),
  status: text("status").$type<"active" | "paused">().notNull().default("active"),
  ...timestamps,
});

export const habit = pgTable(
  "habit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    areaId: uuid("area_id")
      .notNull()
      .references(() => area.id, { onDelete: "restrict" }),
    identityId: uuid("identity_id").references(() => identity.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    /** Implementation intention of habit stack, één zin. */
    cue: text("cue"),
    stackAfter: text("stack_after"),
    location: text("location"),
    /** Verplicht. Moet ook op een slechte dag haalbaar zijn. */
    minimalVersion: text("minimal_version").notNull(),
    normalVersion: text("normal_version"),
    schedule: jsonb("schedule").$type<{ days?: number[]; perWeek?: number }>().notNull().default({}),
    reward: text("reward"),
    obstacles: text("obstacles"),
    recoveryNote: text("recovery_note"),
    /** Welke van de vier wetten al ingericht zijn. Puur voor het ontwerpgesprek. */
    laws: jsonb("laws").$type<Record<string, boolean>>().notNull().default({}),
    type: text("type").$type<HabitType>().notNull().default("build"),
    status: text("status").$type<HabitStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [index("habit_user_status_idx").on(t.userId, t.status)],
);

export const habitLog = pgTable(
  "habit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    level: text("level").$type<HabitLevel>().notNull(),
    note: text("note"),
    loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("habitlog_habit_date_idx").on(t.habitId, t.date)],
);

/* ------------------------------------------------------------------ *
 * Fase 3 — review en coaching
 * ------------------------------------------------------------------ */

export const reviewSession = pgTable("review_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"weekly" | "monthly">().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  findings: jsonb("findings").$type<unknown[]>().notNull().default([]),
  decisions: jsonb("decisions").$type<unknown[]>().notNull().default([]),
  durationSeconds: integer("duration_seconds"),
});

/** Korte samenvatting, bewust geen transcript. */
export const coachNote = pgTable("coach_note", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  source: text("source").$type<"claude-code" | "rule">().notNull(),
  topic: text("topic").notNull(),
  summary: text("summary"),
  ledToActionId: uuid("led_to_action_id").references(() => action.id, { onDelete: "set null" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Action = typeof action.$inferSelect;
export type NewAction = typeof action.$inferInsert;
export type Project = typeof project.$inferSelect;
export type Goal = typeof goal.$inferSelect;
export type InboxItem = typeof inboxItem.$inferSelect;
export type Area = typeof area.$inferSelect;
export type CheckIn = typeof checkIn.$inferSelect;
