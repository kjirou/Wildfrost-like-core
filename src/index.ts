// 色々な行動(FieldObjectAction)のタイミング
//
// フィールドオブジェクトがtimer0で発動するもの
// 攻撃に対するリアクションで発動するもの、オリジナルのオカエシ
// 攻撃に対して付随して発動するもの、オリジナルのメガハンマー？だっけ

/**
 * "none" は、行動に攻撃を伴わないことを意味する。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
 */
type AttackingTarget = "back" | "front" | "low" | "none" | "random";

type FieldObjectAction = {
  attackingTarget: AttackingTarget;
  repeats: number;
  wait: number;
};

type StateChange = { duration: number | undefined } & (
  | {
      kind:
        | "attackPointModification"
        | "actionRepeatModification"
        | "additionalDamage"
        | "gradualWeakeningDot"
        | "oneTimeAttackPointModification";
      points: number;
    }
  | {
      kind: "actionWaitFrozen" | "confusion" | "damageDoubled" | "sealed";
    }
  | {
      attackingTarget: AttackingTarget;
      kind: "targettingModification";
    }
);

type PassiveSkill = {
  kind: "addionalStateChange" | "reactionToAttack";
  power: number;
};

/**
 * フィールドのマスを占有するオブジェクト
 *
 * オリジナルだとキャラクターまたはクランカーに相当する。
 *
 * TODO: 1 オブジェクトが複数マスを占有することがある。オリジナルだと縦2マスのみ。
 */
type FieldObject = {
  /**
   * undefined は、行動をしないことを意味する。オリジナルだと、いくつかのクランカーやスパイクなどが該当する。
   */
  action: FieldObjectAction | undefined;
  armorPoints: number;
  attackPoints: number;
  elapsedActionWait: number;
  id: string;
  lifePoints: number;
  maxLifePoints: number;
  passiveSkills: Array<PassiveSkill>;
  shieldScrapingPoints: number;
  shieldPoints: number;
  stateChanges: Array<StateChange>;
};

/**
 * フィールドのマス目に対しての効果
 *
 * 自分が知る限りのオリジナルに存在するものは、複数マス目に対して攻撃してくるボスのマーカーのみ。
 */
type FieldEffect = {};

type Tile = {};

type TileGrid = Array<Array<Tile>>;

type Field = {
  fieldEffects: Array<FieldEffect>;
  fieldObjects: Array<FieldObject>;
  tileGrid: TileGrid;
};
