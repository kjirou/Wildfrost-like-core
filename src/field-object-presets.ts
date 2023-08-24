import type { Effect, FieldObjectPreset, Impact, Targetting } from "./types";

const defaultFieldObjectPreset = {
  maxLifePoints: 1,
  counterattackPoints: 0,
  armorPoints: 0,
  shieldPoints: 0,
  canRetreat: true,
  autoAction: undefined,
  skills: [],
  stateChanges: [],
} as const satisfies Partial<FieldObjectPreset>;

const defaultAttackTargetting = {
  kind: "horizontalDirection",
  side: "enemy",
  priority: "frontToBack",
  doesSearchOtherRows: false,
  isExcludingOneself: true,
} as const satisfies Targetting;

const createAttackImpact = (
  options: {
    additionalEffects?: Effect[];
    attackPoints?: number;
    targettingPriority?: Extract<
      Targetting,
      { kind: "horizontalDirection" }
    >["priority"];
  } = {},
): Impact => {
  const {
    additionalEffects = [],
    attackPoints = 1,
    targettingPriority,
  } = options;
  return {
    targetting: {
      ...defaultAttackTargetting,
      ...(targettingPriority !== undefined
        ? { priority: targettingPriority }
        : {}),
    },
    area: "single",
    effects: [
      {
        kind: "attack",
        attackPoints,
        additionalDamageSource: "none",
      },
      {
        kind: "shieldScraping",
        points: 1,
      },
      ...additionalEffects,
    ],
  };
};

export const fieldObjectPresets: FieldObjectPreset[] = [
  {
    ...defaultFieldObjectPreset,
    id: "booshu",
    maxLifePoints: 4,
    autoAction: {
      wait: 6,
      repeats: 1,
      impacts: [
        createAttackImpact({ attackPoints: 3 }),
        {
          targetting: {
            kind: "self",
          },
          area: "sideExcludingOneself",
          effects: [
            {
              kind: "healing",
              points: 3,
            },
          ],
        },
      ],
    },
  },
  {
    ...defaultFieldObjectPreset,
    id: "lilGazi",
    maxLifePoints: 4,
    autoAction: {
      wait: 4,
      repeats: 1,
      impacts: [
        createAttackImpact({
          attackPoints: 4,
        }),
      ],
    },
    skills: [
      {
        kind: "stateChange",
        targetting: { kind: "self" },
        // TODO: 本人を除外するかが不明
        area: "sideExcludingOneself",
        stateChanges: [
          {
            kind: "attackPointsModification",
            points: 1,
            duration: undefined,
          },
        ],
      },
    ],
  },
  {
    ...defaultFieldObjectPreset,
    id: "loki",
    maxLifePoints: 5,
    autoAction: {
      wait: 3,
      repeats: 1,
      impacts: [
        createAttackImpact({
          targettingPriority: "random",
          attackPoints: 2,
          additionalEffects: [
            {
              kind: "stateChange",
              stateChange: {
                kind: "doubleDamageInflicted",
                duration: 1,
              },
            },
          ],
        }),
      ],
    },
  },
  {
    ...defaultFieldObjectPreset,
    id: "sneezle",
    maxLifePoints: 6,
    autoAction: {
      wait: 3,
      repeats: 1,
      impacts: [
        createAttackImpact({
          attackPoints: 2,
        }),
      ],
    },
    skills: [
      {
        kind: "reactionToAttackOnOneself",
        content: {
          kind: "impactPerforming",
          impact: {
            targetting: { kind: "self" },
            area: "none",
            effects: [{ kind: "drawCards", count: 1 }],
          },
        },
      },
    ],
  },
  {
    ...defaultFieldObjectPreset,
    id: "snoof",
    maxLifePoints: 3,
    autoAction: {
      wait: 3,
      repeats: 1,
      impacts: [
        createAttackImpact({
          attackPoints: 3,
          additionalEffects: [
            {
              kind: "stateChange",
              stateChange: {
                kind: "autoActionWaitFrozen",
                duration: 1,
              },
            },
          ],
        }),
      ],
    },
  },
  {
    ...defaultFieldObjectPreset,
    id: "spike",
    maxLifePoints: 8,
    counterattackPoints: 2,
    canRetreat: false,
    autoAction: undefined,
  },
  {
    ...defaultFieldObjectPreset,
    id: "tester",
  },
];
