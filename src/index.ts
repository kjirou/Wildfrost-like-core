// TODO: オリジナルの動作確認
// - スノッフェルが攻撃力 0 の攻撃を持った条件の調査。オカエシ or ボム1 だった気がする。
// - シェル・ライフ・ブリンク/50の「追加ダメージ」がログ上別処理になっているのかどうか。
//   - 別処理なら、lifePointModification として扱った方が良さそう。

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
      attackPoints: number;
      /** シールド減少する点数。オリジナルにはなさそうな概念で、オリジナル相当だと常に1。 */
      shieldScrapingPoints: number;
    }
  | { kind: "death" }
  | { kind: "drawCards"; count: number }
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
        | "reactionToEntry"
        | "reactionToStateChange"
        | "reactionToStateChangeOnAlly";
      content:
        | {
            kind: "autoActionPerforming";
            changeTargetting: "toInvoker" | undefined;
          }
        | {
            kind: "impact";
            area: AreaOfEffect;
            effect: Effect;
            targetting: Targetting;
          };
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
 * オリジナルだと仲間・エネミー・ボス・ミニボス・クランカーに相当する。
 *
 * TODO: 1 オブジェクトが複数マスを占有することがある。オリジナルだと縦2マスのみ。
 */
type FieldObject = {
  /** オリジナルのシェルに該当する。 */
  armorPoints: number;
  /**
   * undefined は、行動をしないことを意味する。オリジナルだと、いくつかのクランカーやスパイクなどが該当する。
   *
   * 行動に攻撃を伴わないことの表現は、 skills の "autoActionImpact" の effect に "attack" を含まないことで行う。オリジナルだと、タイガ・パイラ・スノッフェルなどが該当する。
   * なおオリジナルでスノッフェルにオカエシとボム1のオマモリをつけたら、反撃は攻撃力 0 の対象 1 の攻撃を行うようになったが、どちらに起因していたのか不明。
   */
  autoAction: FieldObjectAutoAction | undefined;
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
  skills: Array<FieldObjectSkill>;
  stateChanges: Array<StateChange>;
};

/**
 * フィールドオブジェクトの雛形
 *
 * 種族のような概念を作って委譲する形式にすると種族変更みたいなことはできてやや面白くはなるけど、パラメータを都度合計しないといけないので開発中の見通しが悪くなる。
 */
type FieldObjectPreset = {
  armorPoints: FieldObject["armorPoints"];
  autoAction: FieldObject["autoAction"];
  id: string;
  maxLifePoints: FieldObject["maxLifePoints"];
  shieldPoints: FieldObject["shieldPoints"];
  skills: FieldObject["skills"];
  stateChanges: FieldObject["stateChanges"];
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

// TODO: プレイヤーと手札・山札・捨札・いわゆる行動点管理。0-2 人対応にできると良さそう。
type Game = {
  field: Field;
};

const createTileGrid = (params: {
  width: number;
  height: number;
}): TileGrid => {
  const tileGrid: TileGrid = [];
  for (let i = 0; i < params.height; i++) {
    const row: Tile[] = [];
    for (let j = 0; j < params.width; j++) {
      row.push({ occupation: undefined });
    }
    tileGrid.push(row);
  }
  return tileGrid;
};

const createField = (params: {
  tileGridHeight: number;
  tileGridWidth: number;
}): Field => {
  return {
    leftSideTileGrid: createTileGrid({
      width: params.tileGridWidth,
      height: params.tileGridHeight,
    }),
    rightSideTileGrid: createTileGrid({
      width: params.tileGridWidth,
      height: params.tileGridHeight,
    }),
    fieldObjects: [],
    fieldEffects: [],
  };
};

const fieldObjectPresets: FieldObjectPreset[] = [
  {
    id: "none",
    maxLifePoints: 1,
    armorPoints: 0,
    shieldPoints: 0,
    autoAction: undefined,
    skills: [],
    stateChanges: [],
  },
];

const getListItem = <
  ListItem extends { [key in Key]: string },
  Key extends string,
>(
  list: ListItem[],
  key: Key,
  value: any,
): ListItem => {
  const item = list.find((e: ListItem) => e[key] === value);
  if (item === undefined) {
    throw new Error(`Not found the ${key}=${value} item`);
  }
  return item;
};

const createFieldObject = (params: {
  id: string;
  presetId: FieldObjectPreset["id"];
}): FieldObject => {
  const preset = getListItem(fieldObjectPresets, "id", params.presetId);
  return {
    id: params.id,
    presetId: params.presetId,
    elapsedAutoActionWait: 0,
    // TODO: 回復・損害処理を介するべき
    lifePoints: preset.maxLifePoints,
    maxLifePoints: preset.maxLifePoints,
    armorPoints: preset.armorPoints,
    shieldPoints: preset.shieldPoints,
    autoAction: preset.autoAction,
    skills: preset.skills,
    stateChanges: preset.stateChanges,
  };
};

const initialize = (): Game => {
  return {
    field: createField({ tileGridWidth: 3, tileGridHeight: 2 }),
  };
};

console.log(initialize());
