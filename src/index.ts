type Target =
  | "all"
  | "allAllies"
  | "back"
  | "front"
  | "none"
  | "random"
  | "randomAlly"
  | "row"
  | "rowOfAllies"
  | "self";

type FieldObjectAction = {
  repeats: number;
  wait: number;
};

type StateChange = { duration: number | undefined } & (
  | {
      kind:
        | "attackPointModification"
        | "actionRepeatModification"
        | "additionalDamageInflicted"
        | "gradualWeakeningDot"
        | "oneTimeAttackPointModification";
      points: number;
    }
  | {
      kind: "actionWaitFrozen" | "doubleDamageInflicted" | "sealed";
    }
  | {
      attackingTarget: Target;
      /**
       * オリジナルの混乱は、これの "randomAlly" が該当する。
       */
      kind: "attackingTargetModification";
    }
);

type Effect =
  | { kind: "absorption" }
  | {
      // TODO: もしかすると、攻撃に伴う追加ダメージではなくてこの処理だけ独立なのかもしれない？ログでわかりそう。
      // TODO: オリジナルだと、ブリンク/50 追加ダメージのオマモリもある。
      additionalDamageKind: "armor" | "life" | "none";
      kind: "attack";
      points: number;
    }
  | { kind: "death" }
  | { kind: "lifePointModification"; points: number }
  | { kind: "retreat" }
  | { kind: "stateChangeAddition"; points: number };

type PassiveSkill =
  | {
      effect: Effect;
      kind: "actionEffect";
      target: Target;
    }
  | {
      content: "actionPerforming" | Effect;
      kind:
        | "reactionToAllyAttacks"
        | "reactionToAttackOnOneself"
        | "reactionToDotInflictedOnAnyone"
        | "reactionToEnemyAttacks"
        | "reactionToStateChange"
        | "reactionToStateChangeOnAlly";
      target: Target | "attacker";
    }
  | {
      /** オリジナルの「場にある間〜」に該当する。 */
      kind: "stateChange";
      stateChange: StateChange;
      target: Target;
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
   * 行動に攻撃を伴わないことの表現は、passiveSkills に "attack" の Effect を含まないことで行う。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
   */
  action: FieldObjectAction | undefined;
  /** オリジナルのシェル */
  armorPoints: number;
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
