import { Accessory } from "./accessory"
import { Vector2 } from "../geom/vector2"
import { clear } from "../core/array"

/**
 * @typedef {{
 *   x: number
 *   y: number
 *   setInteractive: typeof import("../app/object2d").Object2D.prototype.setInteractive
 * } & import("./accessory").AccessoryAttachable } FlickableTarget
 */

/**
 * @class phina.accessory.Flickable
 * Flickable
 * _extends phina.accessory.Accessory
 */
export class Flickable extends Accessory {

  /**
   * @constructor
   * @param {FlickableTarget} target
   */
  constructor(target) {
    super(target);

    /** @type {FlickableTarget} */
    this.target

    /**
     * フリック開始位置
     * 
     * @public
     * @type {Vector2}
     */
    this.initialPosition = new Vector2(0, 0);

    /**
     * 摩擦値
     * 
     * @public
     * @type {number}
     * @default 0.9
     */
    this.friction = 0.9;

    /**
     * 速度ベクトル
     * 
     * @public
     * @type {Vector2}
     */
    this.velocity = new Vector2(0, 0);

    /**
     * 上下の移動を許可するかどうか
     * 
     * @public
     * @type {boolean}
     * @default true
     */
    this.vertical = true;

    /**
     * 左右の移動を許可するかどうか
     * 
     * @public
     * @type {boolean}
     * @default true
     */
    this.horizontal = true;

    /**
     * 差分値キャッシュ用配列
     * 
     * @protected
     * @type {Vector2[]}
     */
    this.cacheList = [];

    const self = this;
    this.on('attached', ()=> {
      this.target.setInteractive(true);

      this.target.on('pointstart', 
        /** @this {FlickableTarget} */
        function() {
          self.initialPosition.set(this.x, this.y);
          self.velocity.set(0, 0);
        }
      );

      this.target.on('pointstay', 
        /** @this {FlickableTarget} */
        function(/** @type {import("../display/domapp").DomApp} */ e) {
          if (self.horizontal) {
            this.x += e.pointer.dx;
          }
          if (self.vertical) {
            this.y += e.pointer.dy;
          }

          if (self.cacheList.length > 3) self.cacheList.shift();
          self.cacheList.push(e.pointer.deltaPosition.clone());
        }
      );

      this.target.on('pointend', 
        /** @this {FlickableTarget} */
        function() {
          // 動きのある delta position を後ろから検索　
          const delta = self.cacheList.reverse().find(function(v) {
            return v.lengthSquared() > 10;
          });
          clear.call(self.cacheList);
          // self.cacheList.clear();

          if (delta) {
            self.velocity.x = delta.x;
            self.velocity.y = delta.y;

            self.flare('flickstart', {
              direction: delta.normalize(),
            });
          }
          else {
            self.flare('flickcancel');
          }

          // self.flare('flick');
          // self.flare('flickend');
        }
      );
    });
  }

  /**
   * 更新関数
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {
    if (!this.target) return ;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    if (this.horizontal) {
      this.target.position.x += this.velocity.x;
    }
    if (this.vertical) {
      this.target.position.y += this.velocity.y;
    }
  }

  /**
   * 位置・速度をフリック前に戻す
   * @returns {void}
   */
  cancel() {
    this.target.x = this.initialPosition.x;
    this.target.y = this.initialPosition.y;
    this.velocity.set(0, 0);

    // TODO: 
    // this.setInteractive(false);
    // this.tweener.clear()
    //     .move(this.initialX, this.initialY, 500, "easeOutElastic")
    //     .call(function () {
    //         this.setInteractive(true);
    //         this.fire(tm.event.Event("backend"));
    //     }.bind(this));
  }

  /**
   * フリック可能にする
   * @returns {void}
   */
  enable() {
    this._enable = true;
  }

}
