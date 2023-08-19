/**
 * フィールドのマスを占有するオブジェクト
 *
 * オリジナルだとキャラクターまたはクランカーに相当する。
 *
 * 1 オブジェクトが複数マスを占有することがある。オリジナルだと縦2マスのみ。
 */
type FieldObject = {
  attackPoints: number;
  buffs: Array<any>;
  id: string;
  lifePoints: number;
  maxAttackPoints: number;
  maxLifePoints: number;
  maxShieldScrapingPoints: number;
  passiveSkills: Array<any>;
  shieldScrapingPoints: number;
  shieldPoints: number;
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
