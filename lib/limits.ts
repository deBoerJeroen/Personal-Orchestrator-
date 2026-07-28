/**
 * Harde grenzen. Ze staan hier apart omdat een "use server"-bestand alleen
 * async functies mag exporteren.
 *
 * De getallen zijn geen smaak maar ontwerp: aandacht is de bottleneck, dus
 * alles wat tegelijk actief mag zijn is bewust klein.
 */

/** Meer dan drie doelen betekent dat je er wekelijks niet meer naar kijkt. */
export const MAX_ACTIVE_GOALS = 3;

/** Drie focusacties per dag. Productprincipe 6. */
export const MAX_FOCUS_ACTIONS = 3;

/** Waarvan hooguit één voorbereiding. Het motion-budget. */
export const MAX_MOTION_IN_FOCUS = 1;

/** Meer gewoontes tegelijk starten mislukt vrijwel altijd. */
export const MAX_ACTIVE_HABITS = 3;
