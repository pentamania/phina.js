import { Accessory } from "./accessory"
import { Vector2 } from "../geom/vector2"

/**
 * @typedef {{
 *   position: import("../geom/vector2").PrimitiveVector2
 * } & import("./accessory").AccessoryAttachable } PhysicalTarget
 */

/**
 * @class phina.accessory.Physical
 * 本物ではないので名前変えるかも
 * FakePhysical or MarioPhysical or LiePhysical
 * RetroPysical or PysicaLike
 * _extends phina.accessory.Accessory
 */
export class Physical extends Accessory  {

  /**
   * @constructor
   * @param {PhysicalTarget} target
   */
  constructor(target) {
    super(target);

    /**
     * かかっている力のベクトル
     */
    this.velocity = new Vector2(0, 0);

    /**
     * 重力ベクトル
     */
    this.gravity = new Vector2(0, 0);

    /**
     * 摩擦値
     * @default 1.0
     */
    this.friction = 1.0;
  }

  /**
   * 更新関数
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {
    var t = /** @type {PhysicalTarget} */(this.target);

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.velocity.x += this.gravity.x;
    this.velocity.y += this.gravity.y;

    t.position.x += this.velocity.x;
    t.position.y += this.velocity.y;
  }

  /**
   * 力ベクトルをセット
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  force(x, y) {
    this.velocity.set(x, y);
    return this;
  }

  /**
   * 力ベクトルに値を加算
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  addForce(x, y) {
    this.velocity.x += x;
    this.velocity.y += y;
    return this;
  }

  /**
   * 重力ベクトルをセット
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  setGravity(x, y) {
    this.gravity.set(x, y);
    return this;
  }

  /**
   * 摩擦値をセット
   * @param {number} fr
   * @returns {this}
   */
  setFriction(fr) {
    this.friction = fr;
    return this;
  }
}

// phina.app.Element.prototype.getter('physical', function() {
//   if (!this._physical) {
//     this._physical = phina.accessory.Physical().attachTo(this);
//   }
//   return this._physical;
// });