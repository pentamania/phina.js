import { clone, each } from "../core/array";
import { $extend } from "../core/object";
import { Accessory } from "./accessory"
import { Tween } from "../util/tween"

/**
 * Tweener更新タイプ
 * @typedef {"normal" | "delta" | "fps"} TweenerUpdateType
 */

/**
 * Tweenerタスクモード
 * @typedef {"to" | "by" | "from"} TweenerTaskMode
 */

/**
 * Tweenクラスを使用するタスク用パラメータ
 * @typedef {{
 *   type: "tween",
 *   mode: TweenerTaskMode,
 *   props: import("../util/tween").TweenPropMap,
 *   duration?: number,
 *   easing?: import("../util/tween").TweenEasingType,
 * }} TweenTypeTaskParam
 */

/**
 * {@link Tweener.wait}タスク用パラメータ
 * @typedef {{
 *   type: "wait",
 *   data: {
 *     limit: number,
 *   }
 * }} TweenerWaitTaskParam
 */

/**
 * {@link Tweener.call}タスク用パラメータ
 * @typedef {{
 *   type: "call",
 *   data: {
 *     func: Function,
 *     self: any,
 *     args?: any[],
 *   }
 * }} TweenerCallTaskParam
 */

/**
 * {@link Tweener.set}タスク用パラメータ
 * @typedef {{
 *   type: "set",
 *   data: {
 *     values: Record<string|number|symbol, any>,
 *   }
 * }} TweenerSetTaskParam
 */

/**
 * タスクパラメータ共用体
 * @typedef {(
 *   TweenTypeTaskParam |
 *   TweenerWaitTaskParam |
 *   TweenerCallTaskParam |
 *   TweenerSetTaskParam
 * )} TaskParamUnion
 */

/**
 * @class phina.accessory.Tweener
 * _extends phina.accessory.Accessory
 * 
 * Tweenerはオブジェクトのプロパティに対して、
 * Tweenアニメーションの効果を与えるクラスです。
 * 
 * 主に {@link phina.app.Element} とそのサブクラスで使用されます。
 */
export class Tweener extends Accessory {

  /**
   * @constructor
   * @param {import("./accessory").AccessoryTarget} [target]
   */
  constructor(target) {
    super(target);

    /**
     * アニメーションを更新する方法を指定します。  
     * 変更するとdurationによる時間の進み方が変わります。  
     * 詳しくは {@link Tweener.UPDATE_MAP} を参照してください。
     * 
     * @public
     * @type {TweenerUpdateType}
     */
    this.updateType = 'delta';

    /**
     * Tweenオブジェクト参照
     * タスクに応じてセットもしくはnullになる
     * 
     * @private
     * @type {Tween | null | undefined}
     */
     this._tween = null;

    /**
     * ループ内部フラグ
     * {@link Tweener._init} で初期化
     * デフォルトではfalse
     * 
     * @private
     * @type {boolean!}
     */
    this._loop;

    /**
     * Tweenerタスクキュー配列
     * {@link Tweener._init} で初期化
     * 
     * @private
     * @type {TaskParamUnion[]!}
     */
    this._tasks;

    /**
     * タスク管理用キューインデックス値
     * {@link Tweener._init} で初期化
     * 
     * @private
     * @type {number!}
     */
    this._index;

    /**
     * {@link Tweener.wait} 処理用プロパティ
     * 
     * @private
     * @type {{ time: number, limit: number } | null | undefined}
     */
    this._wait;
    
    /**
     * Tweenerが実行中かどうか
     * 
     * {@link Tweener._init} で初期化
     * デフォルトではtrue
     * 
     * @protected
     * @type {boolean!}
     */
    this.playing;

    /**
     * 内部更新関数
     * 実行中のタスクによって内容が切り替わる
     * 
     * 基本は {@link Tweener.update} を介して
     * 毎フレーム実行される
     * 
     * {@link Tweener._init} で初期化
     * 
     * @private
     * @type {(
     *   typeof Tweener.prototype._updateTask |
     *   typeof Tweener.prototype._updateTween |
     *   typeof Tweener.prototype._updateWait
     * )}
     */
    this._update;

    this._init();
  }

  /**
   * @private
   */
  _init() {
    this._loop = false;
    this._tasks = [];
    this._index = 0;
    this.playing = true;
    this._update = this._updateTask;
  }

  /**
   * 内部更新関数を実行
   * 
   * @param {import('../app/baseapp').BaseApp} app
   */
  update(app) {
    this._update(app);
  }

  /**
   * {@link Tweener.updateType}を変更します。
   * 
   * @chainable
   * @param {TweenerUpdateType} type 更新方法を表す文字列
   * @returns {this}
   */
  setUpdateType(type) {
    this.updateType = type;
    return this;
  }

  /**
   * propsで指定した値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * 
   * @chainable
   * @param {import("../util/tween").TweenPropMap} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  to(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'to',
      props: props,
      duration: duration,
      easing: easing,
    });
    return this;
  }

  /**
   * アニメーション開始時の値とpropsで指定した値を加算した値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * 
   * @chainable
   * @param {import("../util/tween").TweenPropMap} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  by(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'by',
      props: props,
      duration: duration,
      easing: easing,
    });

    return this;
  }

  /**
   * propsで指定した値からアニメーション開始時の値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * 
   * @chainable
   * @param {import("../util/tween").TweenPropMap} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  from(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'from',
      props: props,
      duration: duration,
      easing: easing,
    });
    return this;
  }

  /**
   * 指定した時間が経過するまで待機します。
   * 
   * @chainable
   * @param {Number} time waitする時間
   * @returns {this}
   */
  wait(time) {
    this._add({
      type: 'wait',
      data: {
        limit: time,
      },
    });
    return this;
  }

  /**
   * 現在設定されているアニメーションが終了した時に呼び出される関数をセットします。
   * 
   * @chainable
   * @param {Function} func 呼び出される関数
   * @param {Object} [self] (optional) func内でthisにしたいオブジェクト。
   * @param {Object[]} [args] (optional) funcの引数にしたい値
   * @returns {this}
   */
  call(func, self, args) {
    this._add({
      type: 'call',
      data: {
        func: func,
        self: self || this,
        args: args,
      },
    });
    return this;
  }

  /**
   * 現在設定されているアニメーションが終了した時にプロパティをセットします。  
   * 第一引数にオブジェクトをセットすることもできます。
   * 
   * @chainable
   * @param {String | Record<string, any>} key valueをセットするプロパティ名か、変更したいプロパティをkeyとしたオブジェクト。
   * @param {Record<string, any>} [value] (optional) セットする値
   * @returns {this}
   */
  set(key, value) {
    /** @type {Record<string, any> | null} */
    var values = null;
    if (typeof key === "string") {
      values = {};
      values[key] = value;
    }
    else {
      values = key;
    }
    this._tasks.push({
      type: "set",
      data: {
        values: values
      }
    });

    return this;
  }

  /**
   * x, yに対して、 {@link Tweener.to} の処理を行います。
   * 
   * @chainable
   * @param {Number} x
   * @param {Number} y
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  moveTo(x, y, duration, easing) {
    return this.to({ x: x, y: y }, duration, easing);
  }
  
  /**
   * x, yに対して、 {@link Tweener.by} の処理を行います。
   * 
   * @chainable
   * @param {Number} x
   * @param {Number} y
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  moveBy(x, y, duration, easing) {
    return this.by({ x: x, y: y }, duration, easing);
  }

  /**
   * rotationに対して、 {@link Tweener.to} の処理を行います。
   * 
   * @chainable
   * @param {Number} rotation
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  rotateTo(rotation, duration, easing) {
    return this.to({ rotation: rotation }, duration, easing);
  }
  
  /**
   * rotationに対して、 {@link Tweener.by} の処理を行います。
   * 
   * @chainable
   * @param {Number} rotation
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  rotateBy(rotation, duration, easing) {
    return this.by({ rotation: rotation }, duration, easing);
  }

  /**
   * scaleX, scaleYに対して {@link Tweener.to} の処理を行います。
   * 
   * @chainable
   * @param {Number} scale scaleXとscaleYに設定する値
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  scaleTo(scale, duration, easing) {
    return this.to({ scaleX: scale, scaleY: scale }, duration, easing);
  }
  /**
   * scaleX, scaleYに対して {@link Tweener.by} の処理を行います。
   * 
   * @chainable
   * @param {Number} scale scaleXとscaleYに設定する値
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  scaleBy(scale, duration, easing) {
    return this.by({ scaleX: scale, scaleY: scale }, duration, easing);
  }

  /**
   * alphaに対して {@link Tweener.to} の処理を行います。
   * 
   * @chainable
   * @param {Number} value alphaに設定する値
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  fade(value, duration, easing) {
    return this.to({ alpha: value }, duration, easing);
  }

  /**
   * alphaを0にするアニメーションを設定します。
   * 
   * @chainable
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  fadeOut(duration, easing) {
    return this.fade(0.0, duration, easing);
  }

  /**
   * alphaを1にするアニメーションを設定します。
   * 
   * @chainable
   * @param {Number} [duration] (optional) アニメーションにかける時間
   * @param {import("../util/tween").TweenEasingType} [easing] (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @returns {this}
   */
  fadeIn(duration, easing) {
    return this.fade(1.0, duration, easing);
  }

  /**
   * アニメーション開始
   * 
   * @chainable
   * @returns {this}
   */
  play() {
    this.playing = true;
    return this;
  }

  /**
   * アニメーションを一時停止
   * 
   * @chainable
   * @returns {this}
   */
  pause() {
    this.playing = false;
    return this;
  }

  /**
   * アニメーションを停止し、最初まで巻き戻します。
   * 
   * @chainable
   * @returns {this}
   */
  stop() {
    this.playing = false;
    this.rewind();
    return this;
  }

  /**
   * アニメーションを巻き戻し
   * 
   * @chainable
   * @returns {this}
   */
  rewind() {
    this._update = this._updateTask;
    this._index = 0;
    return this;
  }

  /**
   * 未実装
   * 
   * @todo
   * @returns {this}
   */
  yoyo() {
    // TODO: 最初の値が分からないので反転できない...
    this._update = this._updateTask;
    this._index = 0;
    // @ts-ignore
    each.call(this._tasks, function(task) {
    // this._tasks.each(function(task) {
      if (task.type === 'tween') {

      }
    });
    this.play();

    return this;
  }

  /**
   * アニメーションループ設定
   * 
   * @chainable
   * @param {Boolean} flag
   * @returns {this}
   */
  setLoop(flag) {
    this._loop = flag;
    return this;
  }

  /**
   * アニメーションをクリア
   * {EventDispatcher.clear}を上書きすることに注意
   * 
   * @chainable
   * @returns {this}
   */
  clear() {
    this._init();
    return this;
  }

  /**
   * JSON形式でTweenerタスクを設定する
   * 
   * @example
   * const tweener = new Tweener();
   * tweener.fromJSON({
   *   loop: true,
   *   tweens: [
   *     // [method, arg1, arg2,,,],
   *     ['to', {value: 100}, 1000, 'swing'],
   *     ['wait', 1000],
   *     ['set', 'text', 'END']
   *   ]
   * );
   * 
   * @typedef {{[P in keyof Tweener]: P}[keyof Tweener]} TweenerProps
   * Tweenerクラスの全プロパティ名列挙型（メソッド名取得用）
   * 
   * @typedef {[TweenerProps, ...any]} TweenParamArray
   * tweenerタスク設定型
   * 
   * @chainable
   * @param {Object} json
   * @param {true} [json.loop] ループするかどうか
   * @param {TweenParamArray[]} json.tweens
   * 実行したいtweenerタスク群を配列で指定する
   * 各タスクは`["method", arg1, arg2,,,]`のように
   * 最初にTweenerメソッド名、続いて引数を指定する
   * @returns {this}
   */
  fromJSON(json) {
    if (json.loop !== undefined) {
      this.setLoop(json.loop);
    }

    json.tweens.forEach((t)=> {
      t = /** @type {TweenParamArray} */(clone.call(t));
      // t = t.clone();

      /** @type {TweenerProps} */
      const method = t.shift();

      /** @type {(...args: any[])=> any} */
      (this[method]).apply(this, t);
    });

    return this;
  }

  /**
   * タスクをキュー追加
   * 
   * @private
   * @param {TaskParamUnion} params
   */
  _add(params) {
    this._tasks.push(params);
  }

  /**
   * タスク内容自体を更新する
   * 
   * タスク種類に応じて {@link Tweener._update} の内容を変更する
   * _updateTask自身を代入し、再帰的な処理を行うこともある
   * 
   * @private
   * @param {import('../app/baseapp').BaseApp} app
   */
  _updateTask(app) {
    if (!this.playing) return ;

    var task = this._tasks[this._index];
    if (!task) {
      if (this._loop) {
        this.rewind();
        this._update(app);
      }
      else {
        this.playing = false;
      }
      return ;
    }
    else {
      ++this._index;
    }

    if (task.type === 'tween') {
      this._tween = new Tween();

      var duration = task.duration || this._getDefaultDuration();
      if (task.mode === 'to') {
        this._tween.to(this.target, task.props, duration, task.easing);
      }
      else if (task.mode === 'by') {
        this._tween.by(this.target, task.props, duration, task.easing);
      }
      else {
        this._tween.from(this.target, task.props, duration, task.easing);
      }
      this._update = this._updateTween;
      this._update(app);
    }
    else if (task.type === 'wait') {
      this._wait = {
        time: 0,
        limit: task.data.limit,
      };

      this._update = this._updateWait;
      this._update(app);
    }
    else if (task.type === 'call') {
      task.data.func.apply(task.data.self, task.data.args);
      // 1フレーム消費しないよう再帰
      this._update(app);
    }
    else if (task.type === 'set') {
      $extend.call(this.target, task.data.values);
      // this.target.$extend(task.data.values);
      // 1フレーム消費しないよう再帰
      this._update(app);
    }
  }

  /**
   * Tweenタスク更新処理
   * 
   * @private
   * @param {import('../app/baseapp').BaseApp} app
   */
  _updateTween(app) {
    if (!this._tween) return;
    const tween = this._tween;
    const time = this._getUnitTime(app);

    tween.forward(time);
    this.flare('tween');

    if (tween.time >= tween.duration) {
      delete this._tween;
      this._tween = null;
      this._update = this._updateTask;
    }
  }

  /**
   * Waitタスク更新処理
   * 
   * @private
   * @param {import('../app/baseapp').BaseApp} app
   */
  _updateWait(app) {
    if (!this._wait) return;
    const wait = this._wait;
    const time = this._getUnitTime(app);
    wait.time += time;

    if (wait.time >= wait.limit) {
      delete this._wait;
      this._wait = null;
      this._update = this._updateTask;
    }
  }

  /**
   * 単位経過時間を取得
   * {@link Tweener.updateType} で計算方法が変化
   * 
   * @private
   * @param {import('../app/baseapp').BaseApp} app
   */
  _getUnitTime(app) {
    var obj = UPDATE_MAP[this.updateType];
    if (obj) {
      return obj.func(app);
    }
    else {
      return 1000 / app.fps;
    }
  }

  /**
   * @private
   */
  _getDefaultDuration() {
    var obj = UPDATE_MAP[this.updateType];
    return obj && obj.duration;
  }

}

/**
 * @static
 * {@link #updateType}に設定する更新方法の定義です。
 * 下記の表に定義済みの更新方法を{@link #updateType}に設定することで、
 * アニメーションの更新方法を変更することができます。
 * 
 * | 更新方法 | 単位(デフォルト値) | 1フレームあたりのアニメーション速度 |
 * |-|-|-|
 * | normal | ミリ秒(1000) | app.fpsによって変化 |
 * | delta | ミリ秒(1000) | 経過時間によって変化 |
 * | fps | フレーム(30) | 必ず同じ速度で変化 |
 * 
 * @type {{
 *   [key in TweenerUpdateType]: {
 *     func: (app: import('../app/baseapp').BaseApp)=> number,
 *     duration: number,
 *   }
 * }}
 */
var UPDATE_MAP = Tweener.UPDATE_MAP = {
  normal: {
    func: function(app) {
      return 1000 / app.fps;
    },
    duration: 1000,
  },

  delta: {
    func: function(app) {
      return app.ticker.deltaTime;
    },
    duration: 1000,
  },

  fps: {
    func: function() {
      return 1;
    },
    duration: 30,
  },

};
