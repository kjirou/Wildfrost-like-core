// TODO: オリジナルの動作確認
// - 封印中はカミツキも無効なんだっけ？
// - リルガジの攻撃力+1は本人にも有効？
// - スノッフェルが攻撃力 0 の攻撃を持った条件の調査。オカエシ or ボム1 だった気がする。
// - アクションの攻撃で敵を倒したときに、アクション中に敵が消えているか。
//   - アクション中に敵を倒したら後続の内容（本コードだと同一 FieldObjectAutoAction の別 Impact に相当）のターゲットから除外しないといけないと思うんだけど、その辺どうなっているか
// - シェル・ライフ・ブリンク/50の「追加ダメージ」がログ上別処理になっているのかどうか。
//   - 別処理なら、lifePointModification として扱った方が良さそう。

import { fieldObjectPresets } from "./field-object-presets";
import type {
  FieldObjectPreset,
  Field,
  FieldObject,
  Game,
  Tile,
  TileGrid,
} from "./types";

const createTileGrid = (params: {
  width: number;
  height: number;
}): TileGrid => {
  let tileGrid: TileGrid = [];
  for (let i = 0; i < params.height; i++) {
    const row: Tile[] = [];
    for (let j = 0; j < params.width; j++) {
      row.push({ occupation: undefined });
    }
    tileGrid = [...tileGrid, row];
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
  fieldObjectPresets?: FieldObjectPreset[];
  id: string;
  presetId: FieldObjectPreset["id"];
}): FieldObject => {
  const fieldObjectPresets_ = params.fieldObjectPresets ?? fieldObjectPresets;
  const preset = getListItem(fieldObjectPresets_, "id", params.presetId);
  return {
    id: params.id,
    presetId: params.presetId,
    elapsedAutoActionWait: 0,
    // TODO: 回復・損害処理を介するべき
    lifePoints: preset.maxLifePoints,
    maxLifePoints: preset.maxLifePoints,
    counterattackPoints: preset.counterattackPoints,
    armorPoints: preset.armorPoints,
    shieldPoints: preset.shieldPoints,
    canRetreat: true,
    autoAction: preset.autoAction,
    skills: preset.skills,
    stateChanges: preset.stateChanges,
  };
};

export const initialize = (): Game => {
  let field = createField({ tileGridWidth: 3, tileGridHeight: 2 });
  field = {
    ...field,
    fieldObjects: [createFieldObject({ presetId: "snoof", id: "snoof-1" })],
  };
  return {
    field,
  };
};

//console.log(require("util").inspect(initialize(), false, null, true));
console.log(require("util").inspect(fieldObjectPresets, false, null, true));
