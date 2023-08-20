type Target =
  | "all"
  | "allAllies"
  | "back"
  | "front"
  | "none"
  | "random"
  | "randomAlly"
  | "row";

type FieldObjectAction = {
  /**
   * "none" は、行動に攻撃を伴わないことを意味する。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
   */
  attackingTarget: Target;
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
      kind: "actionWaitFrozen" | "damageDoubled" | "sealed";
    }
  | {
      attackingTarget: Target;
      /**
       * オリジナルの混乱は、これの "randomAlly" が該当する。
       */
      kind: "attackingTargetModification";
    }
);

type PassiveSkill =
  | {
      kind:
        | "reactionToAllyAttacks"
        | "reactionToAttackOnOneself"
        | "reactionToEnemyAttacks";
    }
  | {
      kind: "addionalStateChange";
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
  /** オリジナルのシェル */
  armorPoints: number;
  attackPoints: number;
  elapsedActionWait: number;
  id: string;
  lifePoints: number;
  maxLifePoints: number;
  passiveSkills: Array<PassiveSkill>;
  shieldScrapingPoints: number;
  /** オリジナルのバリア */
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
