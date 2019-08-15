
/**
 * @class phina.asset.AssetManager
 * 
 */
export class AssetManager {

  static get(type, key) {
    return this.assets[type] && this.assets[type][key];
  }

  static set(type, key, asset) {
    if (!this.assets[type]) {
      this.assets[type] = {};
    }
    this.assets[type][key] = asset;
  }

  static contains(type, key) {
    return ;
  }

}

AssetManager.assets = {
  image: {},
  sound: {},
  spritesheet: {},
}