/**
 * Alle Nederlandse teksten op één plek.
 *
 * Toon: vriendelijk, direct, nuchter. Niet therapeutisch, niet betuttelend,
 * niet overdreven enthousiast. Geen schuldtaal, ooit.
 */
export const copy = {
  app: {
    name: "Nu",
    tagline: "Wat is er nu belangrijk?",
  },

  nav: {
    nu: "Nu",
    inbox: "Inbox",
    overzicht: "Overzicht",
  },

  capture: {
    open: "Vastleggen",
    placeholder: "Wat komt er in je op?",
    save: "Bewaren",
    saved: "In inbox.",
    hint: "Geen categorie kiezen. Dat doe je later.",
  },

  nu: {
    heading: "Nu doen",
    next: "Daarna",
    why: "Waarom",
    empty: "Niets openstaand. Leg iets vast of verwerk je inbox.",
    emptyFocus: "Geen acties voor vandaag. Dat mag ook.",
    start: "Start",
    startMinutes: (n: number) => `Start ${n} min`,
    shrink: "Kleiner",
    done: "Klaar",
    stuck: "Ik zit vast",
    closeDay: "Dag afsluiten",
    morningCheckin: "Dag starten",
    habitsNow: "Gewoontes nu",
  },

  inbox: {
    heading: "Inbox",
    empty: "Inbox leeg.",
    progress: (done: number, total: number) => `${done} van ${total}`,
    outcome: "Wat wil je dat dit oplevert?",
    outcomePlaceholder: "Bijvoorbeeld: aanvraag ingediend bij HR",
    actionable: "Is dit uitvoerbaar?",
    yes: "Ja",
    noReference: "Nee, bewaren",
    noSomeday: "Nee, ooit misschien",
    noDrop: "Nee, weg",
    multiStep: "Meer dan één stap nodig?",
    nextAction: "Wat is de eerstvolgende fysieke actie?",
    nextActionHint: "Iets dat iemand je zou kunnen zien doen.",
    motionCheck: "Dit lijkt voorbereiding. Klopt dat?",
    motionLeadsTo: "Waar leidt het toe?",
    motionLeadsToPlaceholder: "En dan kan ik…",
    twoMinutes: "Kan dit in twee minuten?",
    twoMinutesDoNow: "Dan nu doen",
    area: "Werk of privé?",
    deadline: "Is er een echte deadline?",
    deadlineNone: "Nee",
    deadlineHint: "Alleen invullen als hij echt bestaat.",
    processed: "Verwerkt.",
  },

  overzicht: {
    heading: "Overzicht",
    goals: "Doelen",
    projects: "Projecten",
    actions: "Acties",
    waiting: "Wachten op",
    someday: "Ooit misschien",
    noNextAction: "Geen eerstvolgende actie",
    empty: "Nog niets. Begin met vastleggen.",
  },

  checkin: {
    morningTitle: "Hoe start je?",
    energy: "Hoeveel energie heb je?",
    mode: "Waar ligt vandaag je aandacht?",
    modeWork: "Werk",
    modePrivate: "Privé",
    modeBoth: "Allebei",
    focus: "Deze drie vandaag?",
    focusSwap: "Vervangen",
    eveningTitle: "Dag afsluiten",
    doneToday: "Wat heb je gedaan?",
    motionToday: "Waar zat je vooral in voorbereiding?",
    letGo: "Wat mag je loslaten?",
    tomorrow: "Wat is morgen de kleinste belangrijke actie?",
    skip: "Overslaan",
    finish: "Klaar",
    done: "Tot morgen.",
    optional: "Alles is optioneel.",
  },

  shrink: {
    title: "Maak het kleiner",
    ask: "Wat zijn de eerste twee minuten hiervan?",
    accept: "Doe deze",
    keep: "Laat maar staan",
  },

  stuck: {
    title: "Wat helpt nu?",
    smaller: "Maak het kleiner",
    startFive: "Start vijf minuten",
    dropIt: "Schrap of parkeer",
  },

  intervention: {
    projectChurn: (title: string, edits: number) =>
      `Je hebt "${title}" deze week ${edits} keer aangepast en nog geen actie afgerond. Geen nieuw plan. Kies één ding van vijf minuten.`,
    postponed: (title: string, times: number) =>
      `"${title}" heb je ${times} keer doorgeschoven. Kleiner maken, schrappen of bewust plannen?`,
    motionRatio: (motion: number, action: number) =>
      `Deze week: ${action} ${action === 1 ? "actie" : "acties"} afgerond en ${motion} keer voorbereiding. Wat levert vandaag zichtbaar resultaat op?`,
    suggestion: "Suggestie van de app, geen feit.",
  },

  auth: {
    title: "Inloggen",
    email: "E-mail",
    password: "Wachtwoord",
    submit: "Inloggen",
    failed: "Inloggen is niet gelukt.",
    logout: "Uitloggen",
  },

  areas: {
    werk: "Werk",
    prive: "Privé",
    all: "Alles",
  },

  common: {
    cancel: "Annuleren",
    back: "Terug",
    next: "Verder",
    save: "Bewaren",
    delete: "Verwijderen",
    drop: "Schrappen",
    park: "Parkeren",
    notImportant: "Niet meer belangrijk",
  },
} as const;
