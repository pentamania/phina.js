import phina from "../phina";
import { at, erase } from "../core/array"
import { forIn } from "../core/object"
import { EventDispatcher } from "../util/eventdispatcher"
import { Tweener } from "../accessory/tweener"
import { Draggable } from "../accessory/draggable";

/**
 * TODO: Elementのプロパティを引き継ぎたい…
 * @typedef {Element | any} ElementBasedObject
 * _typedef {{[k: string]: any} & Element} ElementBasedObject
 */

/**
 * Elementに適合するためのプロパティを保持してるかチェック: template用
 * @typedef {{
 *   addChild: (el: Elementizable)=> Elementizable
 *   remove: ()=> Elementizable
 *   parent?: Elementizable
 *   has: (type:string)=> boolean
 *   flare: (type:string)=> any
 * }} Elementizable 
 */

/**
 * @class phina.app.Element
 * _extends phina.util.EventDispatcher
 * # 主に要素の親子関係を扱うクラス
 * 主に親子関係等を定義するクラスです。
 */
export class Element extends EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {ElementBasedObject | null}
     * 親要素
     */
    this.parent = null;

    /**
     * @type {ElementBasedObject[]}
     * 子要素配列
     */
    this.children = [];

    /**
     * @type {boolean}
     * 有効かどうか
     */
    this.awake = true;

    /**
     * @type {boolean}
     * 要素クリック管理用フラグ
     */
    this._clicked = false;

    /**
     * @type {import('../accessory/accessory').Accessory[]}
     * Accessory配列
     * attachメソッドによって初期化
     */
    this.accessories = undefined;

    /**
     * @private
     * @type {Tweener}
     * 内部Tweenerクラス
     * tweenerアクセサによって初期化
     */
    this._tweener = undefined;

    /**
     * @private
     * @type {Draggable}
     */
    this._draggable = undefined;
  }

  /**
   * @method addChild
   * 自身に子要素を追加します。
   *
   * 自身を子要素として引数で指定した要素に追加するには {@link #addChildTo} を使用してください。
   *
   * @template {Elementizable} T
   * @param {T} child 追加する子要素
   * @returns {T} 追加した子要素
   */
  addChild(child) {
    if (child.parent) child.remove();

    child.parent = this;
    this.children.push(child);

    child.has('added') && child.flare('added');

    return child;
  }

  /**
   * @method addChildTo
   * 自身を子要素として引数で指定した要素に追加します。
   *
   * 自身に子要素を追加するには {@link #addChild} を使用してください。
   *
   * @template {Elementizable} T
   * @param {T} parent 自身を子要素として追加する要素
   * @returns {this}
   */
  addChildTo(parent) {
    parent.addChild(this);

    return this;
  }

  /**
   * @method addChildAt
   * 自身を、指定した要素の子要素の任意の配列インデックスに追加します。
   *
   * @template {Elementizable} T
   * @param {T} child 追加する子要素
   * @param {Number} index インデックス番号
   * @returns {T} 追加した子要素
   */
  addChildAt(child, index) {
    if (child.parent) child.remove();

    child.parent = this;
    this.children.splice(index, 0, child);

    child.has('added') && child.flare('added');

    return child;
  }

  /**
   * @method getChildAt
   * 指定したインデックスの子要素を返します。
   *
   * @param {Number} index インデックス番号
   * @returns {ElementBasedObject} 指定したインデックスの子要素
   */
  getChildAt(index) {
    // return this.children.at(index);
    return at.call(this.children, index);
  }

  /**
   * @todo
   * @method getChildByName
   * 指定した名前の子要素を返します。（未実装）
   */
  getChildByName(name) {
    // TODO:
  }

  /**
   * @method getChildIndex
   * 指定した子要素のインデックス番号を返します。
   *
   * @param {ElementBasedObject} child 子要素
   * @return {Number} 指定した子要素のインデックス番号
   */
  getChildIndex(child) {
    return this.children.indexOf(child);
  }

  /**
   * @method getParent
   * 指定した要素の親要素を返します。
   *
   * @return {ElementBasedObject} 指定した要素の親要素
   */
  getParent() {
    return this.parent;
  }

  /**
   * @method getRoot
   * 指定した要素の階層ツリーのルートを返します。
   *
   * @return {ElementBasedObject} 指定した要素の階層ツリーのルート
   */
  getRoot() {
    /** @type {ElementBasedObject} */
    var elm = this;
    for (elm=this.parent; elm.parent != null; elm = elm.parent) {

    }
    return elm;
  }

  /**
   * @method removeChild
   * @chainable
   * 指定した要素を自身の子要素から削除します。
   *
   * @template {Elementizable} T
   * @param {T} child 要素
   * @returns {this}
   */
  removeChild(child) {
    var index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.has('removed') && child.flare('removed');
    }
    return this;
  }

  /**
   * @method remove
   * 自身を親要素の子要素から削除します。
   * @returns {this}
   */
  remove() {
    if (!this.parent) return ;

    this.parent.removeChild(this);
    this.parent = null;

    return this;
  }

  /**
   * @method isAwake
   * 自身が有効かどうかを返します。
   *
   * @return {Boolean} 有効かどうか
   */
  isAwake() {
    return this.awake;
  }

  /**
   * @method wakeUp
   * 自身を有効にします。
   * @returns {this}
   */
  wakeUp() {
    this.awake = true;
    return this;
  }

  /**
   * @method sleep
   * 自身を無効にします。
   * @returns {this}
   */
  sleep() {
    this.awake = false;
    return this;
  }

  /**
   * @virtual
   * 更新用仮想関数
   * @param {import("../game/gameapp").AppUnion} [_app] アプリケーションクラス
   * @returns {any}
   */
  update(_app) {}

  /**
   * @method fromJSON
   * JSON 形式を使って自身に子要素を追加することができます。
   *
   * ### Example
   *      this.fromJSON({
   *        "children": {
   *          "label": {                  //キー名が追加する子要素の名前になる
   *            "className": "Label",     //クラス
   *            "arguments": ['hello!'],  //初期化時の引数
   *            "x":320,                  //その他プロパティ
   *            "y":480,
   *          },
   *        },
   *      });
   * 
   * @typedef {{
   *   children?: fromJSONData
   *   className?: string | (new (...args: any)=> any)
   *   arguments?: any
   *   [otherProp: string]: any
   * }} fromJSONData
   * @param {fromJSONData} json JSON 形式
   * @returns {this}
   */
  fromJSON(json) {

    var createChildren = 
      /**
       * @param {string | number} name
       * @param {fromJSONData} data
       */
      function(name, data) {
      var args = data.arguments;
      args = (args instanceof Array) ? args : [args];

      var _class;
      var element;
      if (typeof data.className === 'string') {
        // is phina class
        _class = phina.using(data.className);
        element = _class.apply(null, args);
      } else if (typeof data.className === 'function') {
        // is ES class
        // FIXME: インスタンス化にスプレッド構文が必要なため、es5サポートの場合babelが必要
        element = new data.className(...args);
      }

      element.name = name;
      this[name] = element;

      element.fromJSON(data);
      element.addChildTo(this)
    }.bind(this);

    forIn.call(json, function(key, value) {
    // json.forIn(function(key, value) {
      if (key === 'children') {
        forIn.call(value, function(name, data) {
        // value.forIn(function(name, data) {
          createChildren(name, data);
        });
      }
      else {
        if (key !== 'type' && key !== 'className') {
          this[key] = value;
        }
      }
    }, this);

    return this;
  }

  // /**
  //  * @method toJSON
  //  * 自身の子要素を JSON 形式で返します。
  //  *
  //  * @return {JSON} JSON形式
  //  */
  // toJSON() {
  //   var keys = Object.keys(phina.using(this.className).defaults || {});

  //   this._hierarchies.forEach(function(e) {
  //     var d = e.defaults;
  //     if (d) {
  //       Object.keys(d).forEach(function(k) {
  //         if (keys.indexOf(k) === -1) {
  //           keys.push(k);
  //         }
  //       });
  //     }
  //   });

  //   keys.push('name', 'className');

  //   var json = {};
  //   // keys.each(function(key) {
  //   keys.forEach(function(key) {
  //     json[key] = this[key];
  //   }, this);

  //   var children = this.children.map(function(child) {
  //     return child.toJSON();
  //   });

  //   if (children.length) {
  //     json.children = {};
  //     // children.each(function(child, i) {
  //     children.forEach(function(child, i) {
  //       json.children[child.name || (child.className + '_' + i)] = child;
  //     });
  //   }

  //   return json;
  // }

  /**
   * accessoryを付与する
   * @param  {import('../accessory/accessory').Accessory} accessory Accessory継承クラス
   * @return {this}
   */
  attach(accessory) {
    if (!this.accessories) {
      this.accessories = [];
      this.on('enterframe', function(e) {
        this.accessories.forEach(function(accessory) {
          accessory.update && accessory.update(e.app);
        });
      });
    }

    this.accessories.push(accessory);
    accessory.setTarget(this);
    accessory.flare('attached');

    return this;
  }

  /**
   * accessoryを削除
   * @param  {import('../accessory/accessory').Accessory} accessory Accessory継承クラス
   * @return {this}
   */
  detach(accessory) {
    if (this.accessories) {
      // this.accessories.erase(accessory);
      erase.call(this.accessories, accessory);
      accessory.setTarget(null);
      accessory.flare('detached');
    }

    return this;
  }

  /**
   * 自身に付与（attach）された内部tweenerオブジェクトを返却
   * 
   * アクセス時に存在しない場合、新たにTweenerを生成・付与する
   */
  get tweener() {
    if (!this._tweener) {
      this._tweener = new Tweener().attachTo(this);
    }
    return this._tweener;
  }

  /**
   * 自身に付与（attach）された内部draggableオブジェクトを返却
   * 
   * アクセス時に存在しない場合、新たにDraggableを生成・付与する
   * その際自動で有効化されるため、アクセスした地点でドラッグ可能になる
   */
  get draggable() {
    if (!this._draggable) {
      this._draggable = new Draggable().attachTo(this);
    }
    return this._draggable;
  }
}