import { EventDispatcher } from "../util/eventdispatcher"

/**
 * Accessoryのtargetプロパティとして最低限かどうか
 * @typedef {{
 *   detach: (accessor: Accessory)=> any
 *   [k: string]: any
 * }} AccessoryTarget
 */

/**
 * Accessoryアタッチ可能オブジェクト
 * @typedef {{
 *   attach: (accessor: Accessory)=> any
 * } & AccessoryTarget } AccessoryAttachable
 */

/**
 * @class phina.accessory.Accessory
 * _extends phina.util.EventDispatcher
 */
export class Accessory extends EventDispatcher {

  /**
   * @constructor
   * @param {AccessoryTarget} [target]
   */
  constructor(target) {
    super();

    /** @type {AccessoryTarget} */
    this.target = target;
  }

  /**
   * @param {AccessoryTarget} target
   * @returns {this}
   */
  setTarget(target) {
    if (this.target === target) return ;

    this.target = target;
    return this;
  }

  /**
   * アタッチ対象を返す
   * @returns {AccessoryTarget}
   */
  getTarget() {
    return this.target;
  }

  /**
   * アタッチ対象が存在するかどうか
   * @returns {boolean}
   */
  isAttached() {
    return !!this.target;
  }

  /**
   * 対象に自身をアタッチさせる
   * @template {AccessoryAttachable} T
   * @param {T} element
   * @returns {this}
   */
  attachTo(element) {
    element.attach(this);
    this.setTarget(element);
    return this;
  }

  /**
   * アタッチを外す
   * @returns {void}
   */
  remove() {
    this.target.detach(this);
    this.target = null;
  }

}

// Element側で拡張
// phina.app.Element.prototype.$method('attach', function(accessory) {
//   if (!this.accessories) {
//     this.accessories = [];
//     this.on('enterframe', function(e) {
//       this.accessories.each(function(accessory) {
//         accessory.update && accessory.update(e.app);
//       });
//     });
//   }

//   this.accessories.push(accessory);
//   accessory.setTarget(this);
//   accessory.flare('attached');

//   return this;
// });

// phina.app.Element.prototype.$method('detach', function(accessory) {
//   if (this.accessories) {
//     this.accessories.erase(accessory);
//     accessory.setTarget(null);
//     accessory.flare('detached');
//   }

//   return this;
// });
