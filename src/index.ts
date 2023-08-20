// 色々な行動(FieldObjectAction)のタイミング
//
// フィールドオブジェクトがtimer0で発動するもの
// 攻撃に対するリアクションで発動するもの、オリジナルのオカエシ
// 攻撃に対して付随して発動するもの、オリジナルのメガハンマー？だっけ

type FieldObjectAction = {
  repeats: number;
  targetting: "back" | "front" | "low" | "random";
};

type StateChange = {};

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
  action: FieldObjectAction;
  actionWait: number;
  attackPoints: number;
  elapsedActionWait: number;
  id: string;
  lifePoints: number;
  maxAttackPoints: number;
  maxLifePoints: number;
  maxShieldScrapingPoints: number;
  passiveSkills: Array<PassiveSkill>;
  shieldScrapingPoints: number;
  shieldPoints: number;
  stateChanges: Array<StateChange>;
  stunPoints: number;
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
