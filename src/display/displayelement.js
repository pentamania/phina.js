import { $safe } from "../core/object";
import { Object2D } from "../app/object2d";

/**
 * @typedef {{
 *   alpha?: number,
 *   visible?: boolean,
 * } & import("../app/object2d").Object2DOptions} DisplayElementOptions
 */

/**
 * globalCompositeOperation(https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) のtypeと同じ
 * @typedef { 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'} BlendMode
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
     * @type {BlendMode}
     */
    this.blendMode = "source-over";

    /**
     * 子供を 自分のCanvasRenderer で描画するか
     * @type {boolean}
     */
    this.renderChildBySelf = false;

    /**
     * 描画順を変える
     * {@link CanvasRenderer.enableRenderOrdering}フラグがtrueの時に有効
     * 
     * 数字が若い程、奥側に表示[default:0]
     * 
     * @type {number}
     */
    this.renderOrder = 0;

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
   * renderOrder値をセット
   * @param {number} index
   * @returns {this}
   */
  setRenderOrder(index) {
    this.renderOrder = index;
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

  /**
   * Sceneクラスcanvas参照を使った描画処理を行う
   * 
   * 定義されているとCanvasRendererによって毎フレーム実行される
   * 
   * デフォルトでは未定義(undefined)状態
   * 
   * @public
   * @virtual
   * @param {import('../graphics/canvas').Canvas} _canvas
   * 現在アクティブなSceneクラスのcanvas参照
   */
  draw(_canvas) {};

  /**
   * Sceneクラスcanvas参照を使ったクリッピング（切り抜き）領域の設定を行う
   * 
   * 定義されているとCanvasRendererによって毎フレーム実行され、
   * 本メソッドでクリッピング処理されてからdraw処理が行われる
   * 
   * クリッピングは定義ゲームオブジェクトに対してのみ行われ、
   * 他のオブジェクトには影響しない
   * 
   * デフォルトでは未定義(undefined)状態
   * 
   * @example
   * // スプライトを星形にクリッピングする
   * this.player = new Sprite("player");
   * this.player.clip = function(c) {
   *   c.beginPath();
   *   c.star(0, 0, 32)
   * }
   * 
   * @caveat
   * パスデータは自動でリセットはされず、
   * beginPathを実行してクリアしない限り、溜まり続けることに注意
   * （パスが溜まり過ぎるとパフォーマンスに深刻に影響する）
   * 
   * @public
   * @virtual
   * @param {import('../graphics/canvas').Canvas} _canvas
   * 現在アクティブなSceneクラスのcanvas参照
   */
  clip(_canvas) {};
}

// draw, clipはデフォルトでは未定義とする
// ただし`DisplayElement.prototype.draw=undefined`などとすると
// TSコンパイラがinstance propertyと解釈してしまうため、遠回りな方法で設定
// FIXME: より良い方法があれば改善
((DE)=> {
  // @ts-ignore
  DE["draw"] = undefined;
  // @ts-ignore
  DE["clip"] = undefined;
})(DisplayElement.prototype);

/**
 * @type {DisplayElementOptions}
 */
DisplayElement.defaults = {
  alpha: 1.0,
  visible: true,
};