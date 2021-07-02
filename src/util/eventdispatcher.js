import { $method, forIn } from "../core/object"

/**
 * カスタムイベントの基本パラメータ  
 * @typedef {Object} BasicEventObject
 * @property {string} type イベント名
 * @property {any} [target] イベント対象
 */

/**
 * イベントリスナとなる関数  
 * thisの参照は呼び出したオブジェクト自身となる
 * @callback PhinaEventHandler
 * @param {BasicEventObject & {[key:string]:any}} event BasicEventObjectに加え、自身で付け加えたデータをパラメータとして渡すことができる
 * @typedef {PhinaEventHandler} PhinaEventListener
 */

/**
 * @class phina.util.EventDispatcher
 * 
 * # イベントを扱うためのクラス
 * イベントを扱うためのメソッドやプロパティを定義しているクラスです。
 * phina.js が提供するクラスの多くはこの EventDispatcher クラスのサブクラスとなっているため、
 * ほとんどのクラスで容易にイベントを扱うことができます。
 *
 * 当クラスに`onhoge`のように`on~`という名前でメソッドを定義することで
 * イベントリスナを設定することもできるが、あまり推奨されない。
 * 呼び出される順序は、まずon~関数が呼び出され、その後 `on`メソッド で登録した順番。
 * 
 * @memberof phina
 */
export class EventDispatcher {

  constructor() {
    /**
     * @private
     * @type {{[k: string]: PhinaEventHandler[]}}
     */
    this._listeners = {};
  }

  /**
   * イベントリスナを登録します。
   * 登録したイベントリスナは{@link EventDispatcher.flare} や {@link EventDispatcher.fire}を
   * 介して実行（発火）することができます。
   *
   * １つのイベントに対するイベントリスナはいくつでも登録することができます。
   *
   * いくつかのサブクラスについてはライブラリが特定条件下で発火するイベントがあります。
   * 例えば {@link Object2D} クラスを継承したクラスではユーザーインタラクションに対して
   * "pointstart"などのイベントが発火されます。
   *
   * @example
   * const myObj = new EventDispatcher();
   * myObj.on("myevent", ()=> {
   *   console.log("Event 1");
   * });
   * myObj.on("myevent", ()=> {
   *   console.log("Event 2");
   * });
   * // イベント発火
   * myObj.flare("myevent"); // "Event 1" "Event 2"
   * 
   * @example
   * // thisはアクティブなSceneクラスのインスタンス
   * const shape = new CircleShape()
   *   .addChildTo(this)
   *   .setInteractive(true) // interactiveプロパティをtrueにする
   *   .setPosition(50, 50);
   * shape.on("pointstart", function(e) {
   *   console.log("Pointed shape");
   * });
   *
   * @chainable
   * 
   * @param {string} type イベントの種類
   * @param {PhinaEventHandler} listener イベントリスナとなる関数
   * @returns {this}
   */
  on(type, listener) {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
    return this;
  }

  /**
   * イベントリスナを削除します。
   * 
   * ある種類のイベントに対するイベントリスナをすべて削除するには {@link #clearEventListener} を使用してください。
   * 
   * @example
   * const myObj = new EventDispatcher();
   * const eventHandler = ()=> {
   *   console.log("Event fired!");
   * })
   * myObj.on("myevent", eventHandler);
   * 
   * // イベント発火
   * myObj.flare("myevent"); // "Event fired!"
   * 
   * // イベント削除
   * myObj.off("myevent", eventHandler);
   * 
   * @chainable
   * 
   * @param {string} type イベントの種類
   * @param {PhinaEventHandler} listener イベントリスナ関数
   * @returns {this}
   */
  off(type, listener) {
    var listeners = this._listeners[type];
    var index = listeners.indexOf(listener);
    if (index != -1) {
      listeners.splice(index,1);
    }
    return this;
  }

  /**
   * イベントパラメータオブジェクトを指定してイベントを発火します。
   * {@link EventDispatcher.flare} の内部処理で使用、単独で使用することは稀
   * 
   * @example
   * const myObj = new EventDispatcher();
   * const fireParam = {type: "myevent"}
   * myObj.on("myevent", (e)=> {
   *   console.log(e); // {type: "myevent", target: myObj}
   *   console.log(e === fireParam); // -> true
   * });
   * 
   * myObj.fire(fireParam)
   * 
   * @chainable
   *
   * @param {BasicEventObject} e イベントパラメータオブジェクト
   * @returns {this}
   */
   fire(e) {
    e.target = this;
    var oldEventName = 'on' + e.type;
    // @ts-ignore
    if (this[oldEventName]) this[oldEventName](e);

    var listeners = this._listeners[e.type];
    if (listeners) {
      // var temp = listeners.clone();
      var temp = listeners.slice(0);
      for (var i=0,len=temp.length; i<len; ++i) {
          temp[i].call(this, e);
      }
    }

    return this;
  }

  /**
   * イベント名を指定してカスタムイベントを発火します。
   *
   * param 引数を指定することによりカスタムイベントに任意のプロパティを設定することができます。
   * これにより、呼び出し元がイベントリスナに任意の値を渡すことができます。
   * （ただし target プロパティには必ず自分自身が格納されます。）
   *
   * @example
   * const myObj = new EventDispatcher();
   * myObj.on("myevent", (e)=> {
   *   console.log(e); // {type: "myevent", target: myObj, foo: "foo"}
   * });
   * 
   * myObj.flare("myevent", {foo: "foo"});
   * 
   * @chainable
   *
   * @param {string} type カスタムイベントの名前
   * @param {any} [param] カスタムイベントにプロパティを設定するためのオブジェクト
   * @returns {this}
  */
  flare(type, param) {
    /** @type {{type: string, [key:string]: any}} */
    var e = {type:type};
    if (param) {
      forIn.call(param, function(/** @type {string | number} */ key, /** @type {any} */ val) {
      // param.forIn(function(key, val) {
        e[key] = val;
      });
    }
    this.fire(e);

    return this;
  }

  /**
   * 一度だけ実行されるイベントリスナを登録します。
   * 指定したイベントリスナが一度実行されると、そのイベントリスナは削除されます。
   * それ以外の挙動は {@link EventDispatcher.on} と同じです。
   * 
   * @example
   * const myObj = new EventDispatcher();
   * myObj.one("fireonce", (e)=> {
   *   console.log("Event fired!");
   * });
   * 
   * myObj.flare("fireonce"); // "Event fired!"
   * myObj.flare("fireonce"); // イベントリスナは削除されているため、何も起きません
   * 
   * @chainable
   *
   * @param {string} type イベントの種類
   * @param {PhinaEventHandler} listener イベントリスナとなる関数
   * @returns {this}
   */
  one(type, listener) {
    var self = this;

    var func = function() {
      // TODO: Fix arguments TS error somehow
      // @ts-ignore
      var result = listener.apply(self, arguments);
      self.off(type, func);
      return result;
    };

    this.on(type, func);

    return this;
  }

  /**
   * イベントリスナが登録されているかどうかを調べます。
   * 
   * 指定したイベントの種類に対するイベントリスナが登録されている場合は true、
   * そうでない場合は false を返します。
   *
   * @example
   * const myObj = new EventDispatcher();
   * myObj.on("myevent", (e)=> {
   *   console.log("Event fired!");
   * });
   * 
   * myObj.has("myevent"); // true
   * myObj.has("otherevent"); // false
   * 
   * @param {string} type イベントの種類
   * @return {boolean} 指定したイベントのイベントリスナが登録されているかどうか
   */
  has(type) {
    // @ts-ignore
    return (this._listeners[type] !== undefined && this._listeners[type].length !== 0) || !!this['on' + type];
  }

  /**
   * ある種類のイベントに対するイベントリスナをすべて削除します。
   *
   * 特定のイベントリスナのみを削除するには {@link EventDispatcher.off} を使用してください。
   * 
   * @example
   * const myObj = new EventDispatcher();
   * myObj.on("myevent", (e)=> {
   *   console.log("Event fired!");
   * });
   * 
   * myObj.clearEventListener("myevent");
   * myObj.flare("myevent"); // イベントリスナは削除されているため、何も起きません
   * 
   * @chainable
   * 
   * @param {string} type イベントの種類
   * @returns {this}
   */
  clearEventListener(type) {
    var oldEventName = 'on' + type;
    // @ts-ignore
    if (this[oldEventName]) delete this[oldEventName];
    this._listeners[type] = [];
    return this;
  }
}

/**
 * 従来のclearメソッドも追加定義
 * サブクラス（Tweenerクラス等）でclearがオーバーライドされる場合、clearListenersを使用する
 */
$method.call(EventDispatcher.prototype, "clear",
  /** @this EventDispatcher */
  function(/** @type {string} */ type) {
    // deprecatedメッセージ表示？
    return this.clearEventListener(type);
  }
);


/**
 * @method addEventListener
 * {@link EventDispatcher.on} のエイリアスです。
 */
/**
 * @method removeEventListener
 * {@link EventDispatcher.off} のエイリアスです。
 */
/**
 * @method clearEventListener
 * {@link EventDispatcher.clear} のエイリアスです。
 */
/**
 * @method hasEventListener
 * {@link EventDispatcher.has} のエイリアスです。
 */
/**
 * @method dispatchEvent
 * {@link EventDispatcher.fire} のエイリアスです。
 */
/**
 * @method dispatchEventByType
 * {@link EventDispatcher.flare} のエイリアスです。
 */
const methodMap = {
  addEventListener: 'on',
  removeEventListener: 'off',
  hasEventListener: 'has',
  dispatchEvent: 'fire',
  dispatchEventByType: 'flare',
};

// TODO: Add to class as method
// @ts-ignore
forIn.call(methodMap, function(old, name) {
// methodMap.forIn(function(old, name) {

  // @ts-ignore
  $method.call(EventDispatcher.prototype, old, EventDispatcher.prototype[name]);
  // EventDispatcher.prototype.$method(old, phina.util.EventDispatcher.prototype[name]);
});