import { EventDispatcher } from "../util/eventdispatcher"
import { Flow } from "../util/flow"

/** @typedef {string | import("./file").FileAssetLoadParam | any} AssetSrc 基本的には文字列だがAsset種類によって変わる */

/**
 * @class phina.asset.Asset
 * _extends phina.util.EventDispatcher
 */
export class Asset extends EventDispatcher {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.loaded = false;
    this.serverError = false
    this.notFound = false
    this.loadError = false

    /** @type {AssetSrc} */
    this.src = undefined
  }

  /**
   * ロード処理
   * @public
   * 
   * @param {AssetSrc} src
   * @returns {Flow}
   */
  load(src) {
    this.src = src;
    return new Flow(this._load.bind(this));
  }

  /**
   * ロード済みかどうかを返す
   * 
   * @returns {boolean}
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * @virtual アセット種類に応じてサブクラスでオーバーライド
   * @protected
   * 
   * @param {Function} resolve ロード完了時に実行
   */
  _load(resolve) {
    var self = this;
    setTimeout(function() {
      self.loaded = true;
      resolve();
    }, 100);
  }

  /**
   * @virtual
   * ロード失敗時にダミーをセットする
   */
  loadDummy() { }

}