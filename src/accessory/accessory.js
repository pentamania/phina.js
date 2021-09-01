import { EventDispatcher } from "../util/eventdispatcher"

/**
 * Accessoryのtargetプロパティとして最低限かどうか
 * @typedef {{
 *   detach: typeof import('../app/element').Element.prototype.detach
 *   [k: string]: any
 * }} AccessoryTarget
 */

/**
 * Accessoryアタッチ可能型
 * @typedef {{
 *   attach: typeof import('../app/element').Element.prototype.attach
 * } & AccessoryTarget } AccessoryAttachable
 */

/**
 * @class phina.accessory.Accessory
 * _extends phina.util.EventDispatcher
 *
 * ゲームオブジェクトに特定の振る舞いを付与するクラス  
 * オブジェクトの`attach`メソッドを介して有効化する
 *
 * 本クラスは抽象クラスのため、直接使用することは稀。
 * 通常はclass拡張を行い、コンストラクタやupdate関数を
 * 定義することで特徴づけを行う
 *
 * @example
 * const sprite = new Sprite("player");
 * const acc = new Accessory();
 * acc.update = function() {
 *   this.target.rotation += 2;
 * };
 * sprite.attach(acc);
 */
export class Accessory extends EventDispatcher {

  /**
   * @constructor
   * @param {AccessoryTarget} [target]
   * 操作対象。アタッチはされない（＝自動更新されない）ことに注意。
   */
  constructor(target) {
    super();

    /**
     * 操作対象
     * 
     * @public
     * @type {AccessoryTarget | null | undefined}
     */
    this.target = target;
  }

  /**
   * 更新関数
   * 
   * targetにアタッチされてると、そのtargetのenterframeイベントを経由して
   * 毎フレーム実行される
   * （=> targetの更新が有効でないときは実行されない）
   * 
   * サブクラスなどで上書き定義することで特徴づけを行う
   * 
   * @virtual
   * @public
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {}

  /**
   * 操作対象（target）をセット
   * 
   * このメソッド単体ではtarget経由の自動更新は行われない。
   * 同時に自動更新もさせたい場合は {@link Accessory.attachTo} を使用のこと
   * 
   * @public
   * @param {AccessoryTarget | null} target
   * @returns {this}
   */
  setTarget(target) {
    if (this.target === target) return this;

    this.target = target;
    return this;
  }

  /**
   * 操作対象（target）を返す
   * 
   * @public
   * @returns {typeof Accessory.prototype.target}
   */
  getTarget() {
    return this.target;
  }

  /**
   * 操作対象（target）が存在するかどうか
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
   * targetに自身へのアタッチを外させ、同時にtarget参照を切る
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
