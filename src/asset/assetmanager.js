
/**
 * @class phina.asset.AssetManager
 * 
 */
export class AssetManager {

  /**
   * @param {string} type "sound"、"image"などのアセット種類
   * @param {string} key アセットのキー
   */
  static get(type, key) {
    return this.assets[type] && this.assets[type][key];
  }

  /**
   * @param {string | number} type "sound"、"image"などのアセット種類
   * @param {string | number} key アセット登録キー
   * @param {any} asset Assetオブジェクト
   */
  static set(type, key, asset) {
    if (!this.assets[type]) {
      this.assets[type] = {};
    }
    this.assets[type][key] = asset;
  }

  /**
   * 未実装
   * @param {*} type 
   * @param {*} key 
   */
  static contains(type, key) {
    return ;
  }

}

AssetManager.assets = {
  image: {},
  sound: {},
  spritesheet: {},
}