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

    /**
     * 操作対象
     * @type {AccessoryTarget | undefined}
     */
    this.target = target;
  }

  /**
   * 更新関数
   * アタッチしたtargetのenterframeイベントを経由して
   * 毎フレーム実行される
   * 
   * 主にサブクラスで拡張してAccessoryとしての特徴づけを行う
   * 
   * @virtual
   * @protected
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {}

  /**
   * 操作対象を設定
   * 
   * @param {AccessoryTarget} target
   * @returns {this}
   */
  setTarget(target) {
    if (this.target === target) return this;

    this.target = target;
    return this;
  }

  /**
   * アタッチ対象を返す
   * 
   * @returns {AccessoryTarget | undefined}
   */
  getTarget() {
    return this.target;
  }

  /**
   * アタッチ対象が存在するかどうか
   * 
   * @returns {boolean}
   */
  isAttached() {
    return !!this.target;
  }

  /**
   * 対象に自身をアタッチさせる
   * 
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
   * targetに自身へのアタッチを外させ、target参照を切る
   * 
   * @returns {void}
   */
  remove() {
    if (!this.target) return;
    this.target.detach(this);
    this.target = undefined;
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
