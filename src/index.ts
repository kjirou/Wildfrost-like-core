type RelativeSide = "ally" | "enemy";

/**
 * 行動者などの始点となるマス目が定まっている前提で、自動的にターゲットを決定するロジックの種類
 *
 * ロジック適用の結果は、1マスのターゲット位置を選択できるかまたは選択できないかである。
 * 効果範囲が複数マスに及ぶ場合は、後述の AreaOfEffect で表現する。
 * 選択できないケースは、オリジナルのモンチの捕食などが該当する。
 */
type Targetting =
  | {
      kind: "horizontalDirection";
      direction: "frontToBack" | "backToFront";
      /**
       * 同行にターゲットがいない場合に他行を探すか
       *
       * 他行を探す場合は、y+1 -> y-1 -> y+2 -> y-2 ... という順番で探す。
       * オリジナルは 2 行しかないので、この問題は存在しない。
       */
      doesSearchOtherRows: boolean;
      /**
       * 始点のマス目をターゲットから除外するか
       */
      isExcludingOneself: boolean;
      side: RelativeSide;
    }
  | {
      kind: "randomInRow";
      doesSearchOtherRows: boolean;
      isExcludingOneself: boolean;
      side: RelativeSide;
    }
  | { kind: "selfOnly" };

/**
 * ある一マスのターゲット位置が定まっている前提で、その位置を [0, 0] とした相対位置で表現した効果範囲
 *
 * [[始点x差分, 始点y差分], [終点x差分, 終点y差分]] である。
 * 始点x <= 終点x, 始点y <= 終点y であること。
 *
 * 例:
 * - [[0, 0], [0, 0]] は、ターゲット位置のみ。
 * - [[-2, 0], [2, 0]] は、ターゲット位置の左右 2 マスであり、オリジナルでの「列」に該当する。
 * - [[-2, -1], [2, 1]] は、ターゲット位置の左右 2 マス及び上下 1 行であり、オリジナルでの「全て」に該当する。
 */
type AreaOfEffect = [[number, number], [number, number]];

type StateChange = { duration: number | undefined } & (
  | {
      kind: "actionWaitFrozen" | "doubleDamageInflicted" | "sealed";
    }
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
      /**
       * オリジナルの混乱はこれで表現する。
       */
      kind: "targettingModification";
      targetting: Targetting;
    }
);

type Effect =
  | { kind: "absorption" }
  | {
      kind: "attack";
      // TODO: もしかすると、攻撃に伴う追加ダメージではなくてこの処理だけ独立なのかもしれない？ログでわかりそう。
      // TODO: オリジナルだと、ブリンク/50 追加ダメージのオマモリもある。
      additionalDamageKind: "armor" | "life" | "none";
      points: number;
    }
  | { kind: "death" }
  | { kind: "lifePointModification"; points: number }
  | { kind: "retreat" }
  | { kind: "stateChangeAddition"; points: number };

type FieldObjectSkill =
  | {
      kind: "autoActionImpact";
      area: AreaOfEffect;
      effect: Effect;
      targetting: Targetting;
    }
  | {
      kind:
        | "reactionToAllyAttacks"
        | "reactionToAttackOnOneself"
        | "reactionToDotInflictedOnAnyone"
        | "reactionToEnemyAttacks"
        | "reactionToStateChange"
        | "reactionToStateChangeOnAlly";
      area: AreaOfEffect;
      content: "actionPerforming" | Effect;
      targetting: Targetting;
    }
  | {
      /** オリジナルの「場にある間〜」に該当する。 */
      kind: "stateChange";
      area: AreaOfEffect;
      stateChange: StateChange;
      targetting: Targetting;
    };

type FieldObjectAutoAction = {
  repeats: number;
  wait: number;
};

/** オリジナルでは、プレイヤーによるカード使用が該当する。 */
type InterruptAction = {
  impacts: Array<{
    area: AreaOfEffect;
    effect: Effect;
  }>;
  targetSelection: "ally" | "anyone" | "enemy" | "none";
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
   * 行動に攻撃を伴わないことの表現は、 skills に "attack" の Effect を含まないことで行う。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
   */
  action: FieldObjectAutoAction | undefined;
  /** オリジナルのシェル */
  armorPoints: number;
  elapsedActionWait: number;
  id: string;
  lifePoints: number;
  maxLifePoints: number;
  shieldScrapingPoints: number;
  /** オリジナルのバリア */
  shieldPoints: number;
  skills: Array<FieldObjectSkill>;
  stateChanges: Array<StateChange>;
};

/**
 * フィールドのマス目に対しての効果
 *
 * 自分が知る限りのオリジナルに存在するものは、複数マス目に対して攻撃してくるボスのマーカーのみ。
 */
type FieldEffect = {};

type Tile = {};

/**
 * 左右それぞれのマス目の二次元配列
 *
 * [0, 0] が最も左上を示す。つまり、CSS 座標空間と似ている。
 *
 * 左右問わずに、右側に配置した時の座標で表現する。左側は処理内で左右反転して扱う。
 * つまり、オリジナルでは敵側が見た目通りの座標計算となる。
 */
type TileGrid = Array<Array<Tile>>;

type Field = {
  fieldEffects: Array<FieldEffect>;
  fieldObjects: Array<FieldObject>;
  leftSideTileGrid: TileGrid;
  rightSideTileGrid: TileGrid;
};
