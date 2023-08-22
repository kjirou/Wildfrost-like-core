import type { FieldObjectPreset } from "./types";

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

export const fieldObjectPresets: FieldObjectPreset[] = [
  {
    ...defaultFieldObjectPreset,
    id: "snoof",
    maxLifePoints: 3,
    autoAction: {
      wait: 3,
      repeats: 1,
      impacts: [
        {
          targetting: {
            kind: "horizontalDirection",
            side: "enemy",
            priority: "frontToBack",
            doesSearchOtherRows: false,
            isExcludingOneself: true,
          },
          area: "single",
          effects: [
            {
              kind: "attack",
              attackPoints: 3,
              additionalDamageSource: "none",
            },
            {
              kind: "stateChange",
              stateChange: {
                kind: "autoActionWaitFrozen",
                duration: 1,
              },
            },
          ],
        },
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
