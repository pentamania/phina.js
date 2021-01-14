import { EventDispatcher } from "./eventdispatcher"
import { clear } from "../core/array"

/**
 * @class phina.util.Flow
 * tick management class
 * _extends phina.util.EventDispatcher
 */
export class Flow extends EventDispatcher {

  /**
   * @constructor
   * @param {{ (resolve: Function, reject: Function): void; }} func
   * @param {boolean} [wait]
   */
  constructor(func, wait) {
    super();

    /** @type {"pending" | "resolved" | "rejected"} */
    this.status = 'pending';

    /** @type {any} */
    this.resultValue = null;

    /** @type {Function[]} */
    this._queue = [];

    this.func = func;

    if (wait !== true) {
      var self = this;
      var resolve = function() {
        self.resolve.apply(self, arguments);
        self.status = 'resolved';
      };
      var reject = function() {
        self.reject.apply(self, arguments);
        self.status = 'rejected';
      };

      this.func(resolve, reject);
    }
  }

  /**
   * @private おそらく
   * 成功
   */
  resolve(arg) {
    this.resultValue = arg;

    // キューに積まれた関数を実行
    this._queue.forEach(function(func) {
      func(this.resultValue);
    }, this);
    // this._queue.clear();
    clear.call(this._queue)
  }

  /**
   * @private おそらく
   * 失敗
   */
  reject() {

  }

  /**
   * 非同期終了時の処理を登録
   * @param {{(result: any): any}} func
   * @returns {Flow}
   */
  then(func) {
    var self = this;
    // 成功ステータスだった場合は即実行
    if (this.status === 'resolved') {
      var value = func(this.resultValue);
      return Flow.resolve(value);
    }
    else {
      var flow = new Flow(function(resolve) {
        resolve();
      }, true);

      this._queue.push(function(arg) {
        var resultValue = func(arg);

        if (resultValue instanceof Flow) {
          resultValue.then(function(value) {
            flow.resolve(value);
          });
        }
        else {
          flow.resolve(resultValue);
        }
      });

      return flow;
    }
  }

  /**
   * @param {Flow | any} value
   * @returns {Flow}
   */
  static resolve(value) {
    if (value instanceof Flow) {
      return value;
    }
    else {
      var flow = new Flow(function(resolve) {
        resolve(value);
      });
      return flow;
    }
  }

  /**
   * @param {Flow[]} flows
   * @returns {Flow}
   */
  static all(flows) {
    return new Flow(function(resolve) {
      var count = 0;

      var args = [];

      flows.forEach(function(flow) {
        flow.then(function(d) {
          ++count;
          args.push(d);

          if (count >= flows.length) {
            resolve(args);
          }
        });
      });
    });
  }

}