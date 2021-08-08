import { Accessory } from "./accessory"
import { Vector2 } from "../geom/vector2"
import { clear } from "../core/array"

/**
 * @typedef {{
 *   x: number
 *   y: number
 *   setInteractive: (flag:boolean) => any
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
     */
    this.initialPosition = new Vector2(0, 0);

    /**
     * 摩擦値
     * @default 0.9
     */
    this.friction = 0.9;

    /**
     * 速度ベクトル
     */
    this.velocity = new Vector2(0, 0);

    /**
     * 上下の移動を許可するかどうか（初期値：true）
     * @default true
     */
    this.vertical = true;

    /**
     * 左右の移動を許可するかどうか（初期値：true）
     * @default true
     */
    this.horizontal = true;

    /**
     * キャッシュした差分値
     * @protected
     */
    this.cacheList = [];

    var self = this;
    this.on('attached', 
    /** @this {Flickable} */
    function() {
      this.target.setInteractive(true);

      this.target.on('pointstart', function(e) {
        self.initialPosition.set(this.x, this.y);
        self.velocity.set(0, 0);
      });
      this.target.on('pointstay', function(e) {
        if (self.horizontal) {
          this.x += e.pointer.dx;
        }
        if (self.vertical) {
          this.y += e.pointer.dy;
        }

        if (self.cacheList.length > 3) self.cacheList.shift();
        self.cacheList.push(e.pointer.deltaPosition.clone());
      });

      this.target.on('pointend', function(e) {
        // 動きのある delta position を後ろから検索　
        var delta = self.cacheList.reverse().find(function(v) {
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
      });
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

// TODO: Element側で呼ぶ？
// phina.app.Element.prototype.getter('flickable', function() {
//   if (!this._flickable) {
//     this._flickable = phina.accessory.Flickable().attachTo(this);
//   }
//   return this._flickable;
// });
