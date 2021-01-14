import { Accessory } from "./accessory";
import { Vector2 } from "../geom/vector2";
import { Tweener } from "./tweener";

/**
 * @typedef {{
 *   x: number
 *   y: number
 *   flare: (type: string)=> any
 *   setInteractive: (flag: boolean)=> any
 * } & import("./accessory").AccessoryAttachable } DraggableTarget
 */

/**
 * @class phina.accessory.Draggable
 * Draggable
 * _extends phina.accessory.Accessory
 */
export class Draggable extends Accessory {

  /**
   * @constructor
   * @param {DraggableTarget} [target]
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
   * @param {number} time
   * @param {import("../util/tween").TweenEasingType} [easing='easeOutElastic']
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
   * @returns {void}
   */
  enable() {
    this._enable = true;
  }

  /**
   * @returns {void}
   */
  static lock() {
    this._lock = true;
  }

  /**
   * @returns {void}
   */
  static unlock() {
    this._lock = false;
  }

}

Draggable._lock = false;

// Element側で定義
// phina.app.Element.prototype.getter('draggable', function() {
//   if (!this._draggable) {
//     this._draggable = phina.accessory.Draggable().attachTo(this);
//   }
//   return this._draggable;
// });
