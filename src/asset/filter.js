import { Asset } from "./asset";
import { AssetManager } from "./assetmanager";

/**
 * AssetManagerに登録した画像キー、もしくはTextureオブジェクト
 */

/**
 * @typedef {string | import("./texture").Texture} TextureSrc
 *
 * @param {TextureSrc} textureOrSrcPath
 * @returns {import("./texture").Texture}
 */
function getTexture(textureOrSrcPath) {
  if (typeof textureOrSrcPath === "string") {
    return AssetManager.get("image", textureOrSrcPath);
  } else {
    return textureOrSrcPath;
  }
}

/**
 * @class phina.asset.Filter
 */
export class Filter extends Asset {
  constructor() {
    super();

    /** @type {import("./texture").FilterFunc!} */
    this._filterFunc;
  }

  /**
   * @override
   * @param {(arg0: this) => void} resolve
   */
  _load(resolve) {
    this._filterFunc = this.src;
    resolve(this);
  }

  /**
   * 指定テクスチャに指定フィルターをかける
   *
   * @param {TextureSrc} srcTexture
   * @returns {this}
   */
  applyFilter(srcTexture) {
    var txt = getTexture(srcTexture);
    txt.filter(this._filterFunc);
    return this;
  }

  /**
   * 指定テクスチャにフィルターをかけてAssetManagerに登録
   *
   * @param {TextureSrc} srcTexture
   * @param {string} filteredImageKey
   * @returns {this}
   */
  registerFilteredImage(srcTexture, filteredImageKey) {
    var filtered = getTexture(srcTexture).clone().filter(this._filterFunc);
    AssetManager.set("image", filteredImageKey, filtered);
    return this;
  }
}
