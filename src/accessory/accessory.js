import { EventDispatcher } from "../util/eventdispatcher"

/**
 * Accessoryのtargetプロパティとして最低限かどうか
 * @typedef {{
 *   detach: typeof import('../app/element').Element.prototype.detach
 *   [k: string]: any
 * }} AccessoryTarget
 */

/**
 * Accessoryアタッチ可能オブジェクト
 * @typedef {{
 *   attach: typeof import('../app/element').Element.prototype.attach
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
     * 
     * @public
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
   * @public
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {}

  /**
   * 操作対象を設定
   * 
   * このメソッド単体ではtarget経由の自動更新は行われない。
   * 同時に自動更新もさせたい場合は {@link Accessory.attachTo} を使用のこと
   * 
   * @public
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
   * @public
   * @returns {AccessoryTarget | undefined}
   */
  getTarget() {
    return this.target;
  }

  /**
   * アタッチ対象が存在するかどうか
   * 
   * @public
   * @returns {boolean}
   */
  isAttached() {
    return !!this.target;
  }

  /**
   * 対象に自身をアタッチさせる
   * 
   * @public
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
   * @public
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
