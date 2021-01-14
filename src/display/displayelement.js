import { $safe } from "../core/object";
import { Object2D } from "../app/object2d";

/**
 * @typedef {{
 *   alpha?: number,
 *   visible?: boolean,
 * } & import("../app/object2d").Object2DOptions} DisplayElementOptions
 */

/**
 * @class phina.display.DisplayElement
 * _extends phina.app.Object2D
 */
export class DisplayElement extends Object2D {

  /**
   * @param {DisplayElementOptions} [options] 
   */
  constructor(options) {
    options = $safe.call({}, options||{}, DisplayElement.defaults)
    // options = ({}).$safe(options || {}, phina.display.DisplayElement.defaults);
    super(options);

    /**
     * 表示フラグ
     * @type {boolean}
     */
    this.visible = (options.visible != null) ? options.visible : true;

    /**
     * アルファ値
     * @type {number}
     */
    this.alpha = (options.alpha != null) ? options.alpha : 1.0;

    /**
     * ブレンドモード
     * @type {string}
     */
    this.blendMode = "source-over";

    /**
     * 子供を 自分のCanvasRenderer で描画するか
     * @type {boolean}
     */
    this.renderChildBySelf = false;

    /** @type {DisplayElement} 型アサーション */
    this.parent;

    /**
     * グローバルアルファ内部値
     * @type {number}
     */
    this._worldAlpha = 1.0;
  }

  /**
   * アルファ値をセット
   * @param {number} alpha
   * @returns {this}
   */
  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }

  /**
   * 表示/非表示をセット
   * @param {boolean} flag
   * @returns {this}
   */
  setVisible(flag) {
    this.visible = flag;
    return this;
  }

  /**
   * 表示
   * @returns {this}
   */
  show() {
    this.visible = true;
    return this;
  }

  /**
   * 非表示
   * @returns {this}
   */
  hide() {
    this.visible = false;
    return this;
  }

  /**
   * グローバルアルファ値の再計算
   * @returns {void}
   */
  _calcWorldAlpha() {
    if (this.alpha < 0) {
      this._worldAlpha = 0;
      return;
    }
    if (!this.parent) {
      this._worldAlpha = this.alpha;
      return ;
    }
    else {
      var worldAlpha = (this.parent._worldAlpha !== undefined) ? this.parent._worldAlpha : 1.0;
      // alpha
      this._worldAlpha = worldAlpha * this.alpha;
    }
  }

}

/**
 * @type {DisplayElementOptions}
 */
DisplayElement.defaults = {
  alpha: 1.0,
  visible: true,
};