export type RelativeSide = "ally" | "enemy";

/**
 * 行動者などの始点となるマス目が定まっている前提で、自動的にターゲットを決定するロジックの種類
 *
 * ロジック適用の結果は、1マスのターゲット位置を選択できるかまたは選択できないかである。
 * 効果範囲が複数マスに及ぶ場合は、後述の AreaOfEffect で表現する。
 * 選択できないケースは、オリジナルのモンチの捕食などが該当する。
 *
 * カードドローなどのターゲットを要さない効果に対しては "self" を設定する。
 */
export type Targetting = Readonly<
  | {
      kind: "horizontalDirection";
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
      priority: "backToFront" | "frontToBack" | "random";
      side: RelativeSide;
    }
  | { kind: "self" }
>;

/**
 * ある一マスのターゲット位置が定まっている前提で、そのマス目を起点とした効果範囲
 *
 * 相対座標の羅列にするなど動的なパラメータとして表現することはできるが、ユーザーへの表示の時に難しくなるので種別としての表現が良さそう。
 *
 * フィールド内に効果を及ぼさない場合は "none" を設定する。
 */
export type EffectArea =
  | "all"
  | "row"
  | "none"
  | "side"
  | "sideExcludingOneself"
  | "single";

export type StateChange = Readonly<
  { duration: number | undefined } & (
    | {
        kind: "autoActionWaitFrozen" | "doubleDamageInflicted" | "sealed";
      }
    | {
        kind:
          | "attackPointsModification"
          | "autoActionRepeatsModification"
          | "additionalDamageInflicted"
          | "counterattackPointsModification"
          | "gradualWeakeningDot"
          | "maxLifePointsModification"
          | "oneTimeAttackPointModification";
        points: number;
      }
    | { kind: "canRetreatModification"; canRetreat: boolean }
    | {
        /**
         * オリジナルの混乱はこれで表現する。
         */
        kind: "targettingModification";
        targetting: Targetting;
      }
  )
>;

export type Effect = Readonly<
  | { kind: "absorption" }
  | {
      kind: "attack";
      // TODO: もしかすると、攻撃に伴う追加ダメージではなくてこの処理だけ独立なのかもしれない？ログでわかりそう。
      // TODO: オリジナルだと、ブリンク/50 追加ダメージのオマモリもある。
      additionalDamageSource: "armor" | "life" | "none";
      attackPoints: number;
    }
  | { kind: "death" }
  | { kind: "drawCards"; count: number }
  | { kind: "healing"; points: number }
  | {
      kind: "maxLifePointsModification";
      isWithHealing: boolean;
      points: number;
    }
  | { kind: "retreat" }
  | {
      /** シールド減少効果、オリジナルのブロックを常に 1 削ることに該当する。 */
      kind: "shieldScraping";
      points: number;
    }
  | {
      kind: "stateChange";
      stateChange: Readonly<StateChange>;
    }
>;

export type Impact = Readonly<{
  area: EffectArea;
  effects: Readonly<Array<Effect>>;
  targetting: Targetting;
}>;

export type FieldObjectSkill = Readonly<
  | {
      kind: "autoActionAttackModification";
      additionalEffect: Effect;
    }
  | {
      kind:
        | "reactionToAllyAttacks"
        | "reactionToAttackOnOneself"
        | "reactionToDotInflictedOnAnyone"
        | "reactionToEnemyAttacks"
        | "reactionToEntry"
        | "reactionToStateChange"
        | "reactionToStateChangeOnAlly";
      content:
        | {
            kind: "autoActionPerforming";
            changeTargetting: "toInvoker" | undefined;
          }
        | {
            kind: "impactPerforming";
            impact: Impact;
          };
    }
  | {
      /**
       * オリジナルの「場にある間〜」に該当する。
       * 全てのフィールドオブジェクトが参入または隊列変更時に永続の状態変化を発動する。
       * TODO: 永続だけど複数回トリガーされて結果として重複させられないので、StateChange の duration の流用だとダメそう。
       */
      kind: "stateChangeOnFormationChange";
      area: EffectArea;
      stateChanges: Readonly<Array<StateChange>>;
      targetting: Readonly<Targetting>;
    }
>;

export type FieldObjectAutoAction = Readonly<{
  impacts: Readonly<Array<Impact>>;
  repeats: number;
  wait: number;
}>;

/** オリジナルでは、プレイヤーによるカード使用が該当する。 */
export type InterruptAction = Readonly<{
  targetSelection: "ally" | "anyone" | "enemy" | "none";
  targettedImpacts: Array<{
    area: EffectArea;
    effect: Effect;
  }>;
}>;

/**
 * フィールドのマスを占有するオブジェクト
 *
 * オリジナルだと仲間・エネミー・ボス・ミニボス・クランカーに相当する。
 *
 * TODO: 1 オブジェクトが複数マスを占有することがある。オリジナルだと縦2マスのみ。
 */
export type FieldObject = Readonly<{
  /** オリジナルのシェルに該当する。 */
  armorPoints: number;
  /**
   * undefined は、行動をしないことを意味する。オリジナルだと、いくつかのクランカーやスパイクなどが該当する。
   *
   * 行動に攻撃を伴わないことの表現は、 skills の "autoActionImpact" の effect に "attack" を含まないことで行う。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
   * なおオリジナルでスノッフェルにオカエシとボム1のオマモリをつけたら、反撃は攻撃力 0 の対象 1 の攻撃を行うようになったが、どちらに起因していたのか不明。
   */
  autoAction: FieldObjectAutoAction | undefined;
  canRetreat: boolean;
  counterattackPoints: number;
  elapsedAutoActionWait: number;
  /**
   * ゲーム中に生成されるものは、デバッグのため "{presetId}-{全フィールドオブジェクトで1始まりの連番}" へ統一する。
   */
  id: string;
  lifePoints: number;
  maxLifePoints: number;
  /** 必ずプリセットから生成する必要がある。 */
  presetId: string;
  /** オリジナルのブロックに該当する。 */
  shieldPoints: number;
  skills: Readonly<Array<FieldObjectSkill>>;
  stateChanges: Readonly<Array<StateChange>>;
}>;

/**
 * フィールドオブジェクトの雛形
 *
 * 種族のような概念を作って委譲する形式にすると種族変更みたいなことはできてやや面白くはなるけど、パラメータを都度合計しないといけないので開発中の見通しが悪くなる。
 */
export type FieldObjectPreset = Readonly<{
  armorPoints: FieldObject["armorPoints"];
  autoAction: FieldObject["autoAction"];
  canRetreat: FieldObject["canRetreat"];
  counterattackPoints: FieldObject["counterattackPoints"];
  id: string;
  maxLifePoints: FieldObject["maxLifePoints"];
  shieldPoints: FieldObject["shieldPoints"];
  skills: FieldObject["skills"];
  stateChanges: FieldObject["stateChanges"];
}>;

/**
 * フィールドのマス目に対しての効果
 *
 * 自分が知る限りのオリジナルに存在するものは、複数マス目に対して攻撃してくるボスのマーカーのみ。
 */
export type FieldEffect = Readonly<{}>;

export type Tile = Readonly<{}>;

/**
 * 左右それぞれのマス目の二次元配列
 *
 * [0, 0] が最も左上を示す。つまり、CSS 座標空間と似ている。
 *
 * 左右問わずに、右側に配置した時の座標で表現する。左側は処理内で左右反転して扱う。
 * つまり、オリジナルでは敵側が見た目通りの座標計算となる。
 */
export type TileGrid = Readonly<Array<Array<Tile>>>;

export type Field = Readonly<{
  fieldEffects: Array<FieldEffect>;
  fieldObjects: Array<FieldObject>;
  leftSideTileGrid: TileGrid;
  rightSideTileGrid: TileGrid;
}>;

// TODO: プレイヤーと手札・山札・捨札・いわゆる行動点管理。0-2 人対応にできると良さそう。
export type Game = Readonly<{
  field: Field;
}>;
