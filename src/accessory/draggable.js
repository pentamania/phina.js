import { Accessory } from "./accessory";
import { Vector2 } from "../geom/vector2";
import { Tweener } from "./tweener";

/**
 * Draggableのtargetに指定可能なオブジェクト型
 * @typedef {{
 *   x: number
 *   y: number
 *   flare: (type: string)=> any
 *   setInteractive: (flag: boolean)=> any
 * } & import("./accessory").AccessoryAttachable } DraggableTarget
 */

/**
 * @class phina.accessory.Draggable
 * _extends phina.accessory.Accessory
 * 
 * 対象をドラッグ可能にするAccessory派生クラス
 * 
 * phina.app.Element派生クラスであれば、
 * draggableゲッターにアクセスするだけで有効化することも可能
 * 
 * ### イベント発火について
 * ドラッグ開始時に`dragstart`、
 * ドラッグ移動毎に`drag`、
 * ドラッグ終了時に時に`dragend`
 * イベントをそれぞれ自身および対象オブジェクト両方で発火する
 * 
 * @example
 * const target = new phina.display.Sprite("player");
 * const draggable = new phina.accessory.Draggable().attachTo(target);
 * draggable.on("dragend", ()=> {
 *   if (!isValidatePosition(target)) draggable.back()
 * })
 * 
 * @example
 * // Activate by getter
 * const el = new phina.app.Element();
 * el.draggable;
 * 
 */
export class Draggable extends Accessory {

  /**
   * @constructor
   * 
   * @param {DraggableTarget} [target]
   * targetを受け取るが、それだけでは有効化されないことに注意
   * 同時に有効化する場合はattachToを使って付与する
   */
  constructor(target) {
    super(target);

    /** @type {DraggableTarget} */
    this.target;

    /**
     * @private
     * @type {boolean}
     */
    this._dragging = false;

    /**
     * @private
     * @type {boolean}
     * ※未使用
     */
    this._enable;

    /**
     * ドラッグ開始位置、処理毎に更新される
     * @type {Vector2}
     */
    this.initialPosition = new Vector2(0, 0);

    var self = this;
    this.on('attached',
    /** @this {Draggable} */
    function() {
      this.target.setInteractive(true);

      self._dragging = false;

      this.target.on('pointstart', 
      /** @this {DraggableTarget} */
      function() {
        if (Draggable._lock) return ;

        self._dragging = true;
        self.initialPosition.x = this.x;
        self.initialPosition.y = this.y;
        self.flare('dragstart');
        this.flare('dragstart');
      });

      this.target.on('pointmove', 
      /** @this {DraggableTarget} */
      function(e) {
        if (!self._dragging) return ;

        this.x += e.pointer.dx;
        this.y += e.pointer.dy;
        self.flare('drag');
        this.flare('drag');
      });

      this.target.on('pointend', 
      /** @this {DraggableTarget} */
      function(e) {
        if (!self._dragging) return ;

        self._dragging = false;
        self.flare('dragend');
        this.flare('dragend');
      });
    });
  }

  /**
   * ドラッグ開始位置にターゲットを戻す
   * パラメータ指定することでtweenerアニメーションを使って戻すことも可能
   * 
   * 終了時に`backend`イベントを発火
   * 
   * @param {number} [time] アニメーション時間（ミリ秒）。無指定の場合は即座に戻す
   * @param {import("../util/tween").TweenEasingType} [easing='easeOutElastic'] アニメーション種類
   * @returns {void}
   */
  back(time, easing) {
    if (time) {
      var t = this.target;
      t.setInteractive(false);
      var tweener = new Tweener().attachTo(t);
      tweener
        .to({
          x: this.initialPosition.x,
          y: this.initialPosition.y,
        }, time, easing || 'easeOutElastic')
        .call(function() {
          tweener.remove();

          t.setInteractive(true);
          this.flare('backend');
        }, this);
    }
    else {
      this.target.x = this.initialPosition.x;
      this.target.y = this.initialPosition.y;
      this.flare('backend');
    }
  }

  /**
   * @private ※未使用のため
   * @returns {void}
   */
  enable() {
    this._enable = true;
  }

  /**
   * 全てのインスタンスでドラッグを無効化する
   * 
   * @returns {void}
   */
  static lock() {
    this._lock = true;
  }

  /**
   * 全てのインスタンスでドラッグ無効化を解除
   * 
   * @returns {void}
   */
  static unlock() {
    this._lock = false;
  }

}

/**
 * @private
 * @type {boolean}
 */
Draggable._lock = false;

// Element側で定義
// phina.app.Element.prototype.getter('draggable', function() {
//   if (!this._draggable) {
//     this._draggable = phina.accessory.Draggable().attachTo(this);
//   }
//   return this._draggable;
// });
