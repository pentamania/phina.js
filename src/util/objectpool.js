import { times } from "../core/number";
import phina from "../phina";
import { EventDispatcher } from "./eventdispatcher";

/**
 * Accessoryのtargetプロパティとして最低限かどうか
 * @typedef {{
 *   has: typeof import("../util/eventdispatcher").EventDispatcher.prototype.has
 *   flare: typeof import("../util/eventdispatcher").EventDispatcher.prototype.flare
 *   getParent: typeof import("../app/element").Element.prototype.getParent
 *   [k: string]: any
 * }} ObjectPoolable
 */

/**
 * phina.util.ObjectPool
 * オブジェクトプールクラス
 * 後述の管理クラスを経由して使うのがおすすめ
 */
export class ObjectPool extends EventDispatcher {
  constructor() {
    super();

    /** @type {ObjectPoolable[]} */
    this._pool = [];
  }

  /**
   * プールへオブジェクトを追加する
   * 
   * @chainable
   * @param {ObjectPoolable} obj
   * @returns {this}
   */
  add(obj) {
    this._pool.push(obj);
    return this;
  }

  /**
   * プール内から親を持ってない（addChildされてない）objを探す。
   * 見つかったらコールバックで引数として返す。
   *
   * @param {(obj: ObjectPoolable)=> any} [success]
   * 取得成功時のコールバック
   * @param {()=> any} [failure]
   * 取得失敗時のコールバック
   * @returns {ObjectPoolable | null}
   */
  pick(success, failure) {
    var foundObj = this._pool.find(function (obj) {
      if (obj.getParent() == null) {
        obj.has("picked") && obj.flare("picked");
        success(obj);
        return true;
      }
    });

    // Not found
    if (!foundObj && failure) failure();
    return foundObj;
  }

  get length() {
    return this._pool.length;
  }
}

/**
 * @class phina.util.ObjectPoolManager
 * オブジェクトプール管理用シングルトンクラス
 */
export class ObjectPoolManager {
  /** 全プール */
  static pools = {};

  /**
   * @method setPool
   * 
   * @param {string} key プールを取得する際のキー名
   * @param {number} objectNum プールするオブジェクトの数
   * @param {string|(new (...args: any)=> any)} ObjClass プールするオブジェクトクラス
   * @param {Array} args クラス引数
   * @returns {ObjectPoolManager}
   */
  static setPool(key, objectNum, ObjClass, args) {
    var pool = new ObjectPool();

    /** @type {(new (...args: any)=> any)} */
    let ClassConstructor;
    if (typeof ObjClass === "string") {
      ClassConstructor = phina.using(ObjClass);
    } else {
      ClassConstructor = ObjClass;
    }
    if (!(typeof ClassConstructor === "function")) {
      console.error(
        "[phina.js] Pooling ObjClass should be function or phina registered class string"
      );
    }

    times.call(objectNum, function () {
      var instance = ClassConstructor.apply(null, args);
      pool.add(instance);
    });

    this.pools[key] = pool;
    return this;
  }

  /**
   * @param {string | number} key
   */
  static getPool(key) {
    return this.pools[key];
  }

  /**
   * @param {string | number} key
   * @param {ObjectPoolable} obj
   */
  static add(key, obj) {
    return this.pools[key].add(obj);
  }

  /**
   * @param {string | number} key
   * @param {(obj: ObjectPoolable)=> any} [success]
   * 取得成功時のコールバック
   * @param {()=> any} [failure]
   * 取得失敗時のコールバック
   */
  static pick(key, success, failure) {
    return this.pools[key].pick(success, failure);
  }
}
