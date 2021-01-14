import { clone, each } from "../core/array";
import { $extend } from "../core/object";
import { Accessory } from "./accessory"
import { Tween } from "../util/tween"

/**
 * @typedef {"normal" | "delta" | "fps"} TweenerUpdateType tweener更新タイプ
 * 
 * @typedef {"to" | "by" | "from"} TweenerTaskMode tweenerタスクモード
 * 
 * @typedef {{
 *   type: "tween",
 *   mode: TweenerTaskMode,
 *   props: Object,
 *   duration?: number,
 *   easing?: import("../util/tween").TweenEasingType,
 * }} TweenTypeTaskParam Tweenクラスを使用するタスクの設定用パラメータ
 * 
 * @typedef {{
 *   type: "wait" | "call" | "set",
 *   data: {[key: string]: any}
 * }} CommonTypeTaskParam その他の汎用タスク用パラメータ
 * 
 * @typedef {TweenTypeTaskParam | CommonTypeTaskParam} TaskParamUnion
 */

/**
 * @class phina.accessory.Tweener
 * # Tweener
 * Tweenerはオブジェクトのプロパティに対して、
 * Tweenアニメーションの効果を与えるクラスです。  
 * 主に {@link phina.app.Element} とそのサブクラスで使用されます。
 * _extends phina.accessory.Accessory
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
     * 詳しくは{@link #UPDATE_MAP}を参照してください。
     * @type {TweenerUpdateType}
     */
    this.updateType = 'delta';

    this._init();
  }

  /**
   * @private
   * 初期化
   */
  _init() {
    this._loop = false;

    /** @type {TaskParamUnion[]} */
    this._tasks = [];

    this._index = 0;
    this.playing = true;
    this._update = this._updateTask;
  }

  /**
   * @param {BaseApp} app
   */
  update(app) {
    this._update(app);
  }

  /**
   * {@link #updateType}を変更します。
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
   * @chainable
   * @param {{[key: string]: any}} props 変更したいプロパティをkeyとしたオブジェクト
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
   * @chainable
   * @param {{[key: string]: any}} props 変更したいプロパティをkeyとしたオブジェクト
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
   * @chainable
   * @param {{[key: string]: any}} props 変更したいプロパティをkeyとしたオブジェクト
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
   * @chainable
   * @param {String | Object} key valueをセットするプロパティ名か、変更したいプロパティをkeyとしたオブジェクト。
   * @param {Object} [value] (optional) セットする値
   * @returns {this}
   */
  set(key, value) {
    var values = null;
    if (arguments.length == 2) {
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
   * x, yに対して、 {@link #to} の処理を行います。
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
   * x, yに対して、 {@link #by} の処理を行います。
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
   * rotationに対して、 {@link #to} の処理を行います。
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
   * rotationに対して、 {@link #by} の処理を行います。
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
   * scaleX, scaleYに対して {@link #to} の処理を行います。
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
   * scaleX, scaleYに対して {@link #by} の処理を行います。
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
   * alphaに対して {@link #to} の処理を行います。
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
   * @chainable
   * @returns {this}
   */
  play() {
    this.playing = true;
    return this;
  }

  /**
   * アニメーションを一時停止
   * @chainable
   * @returns {this}
   */
  pause() {
    this.playing = false;
    return this;
  }

  /**
   * アニメーションを停止し、最初まで巻き戻します。
   * @chainable
   * @returns {this}
   */
  stop() {
    this.playing = false;
    this.rewind();
    return this;
  }

  /**
   * アニメーションを巻き戻す
   * @chainable
   * @returns {this}
   */
  rewind() {
    this._update = this._updateTask;
    this._index = 0;
    return this;
  }

  yoyo() {
    // TODO: 最初の値が分からないので反転できない...
    this._update = this._updateTask;
    this._index = 0;
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
   * @chainable
   * @override {EventDispatcher#clear}を上書き
   * @returns {this}
   */
  clear() {
    this._init();
    return this;
  }

  /**
   * @typedef {[string, ...any]} TweenParamArray
   * JSON形式でアニメーションを設定します。
   * @chainable
   * 
   * ```
   * [
   *   [method, arg1, arg2,,,],
   *   ['to', {value: 100}, 1000, 'swing'],
   *   ['wait', 1000],
   *   ['set', 'text', 'END']
   * ]
   * ```
   * 
   * @param {Object} json
   * @param {Boolean} json.loop (optional) ループする場合true
   * @param {TweenParamArray} json.tweens 設定するアニメーション
   * @returns {this}
   */
  fromJSON(json) {
    if (json.loop !== undefined) {
      this.setLoop(json.loop);
    }

    each.call(json.tweens, 
    // json.tweens.each(
      /**
       * @this Tweener
       * @param {TweenParamArray} t
       */
      function(t) {
        t = clone.call(t);
        // t = t.clone();
        var method = t.shift();
        this[method].apply(this, t);
      }, this
    );

    return this;
  }

  /**
   * @param {TaskParamUnion} params
   */
  _add(params) {
    this._tasks.push(params);
  }

  /**
   * @param {BaseApp} app 
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
      // this._tween = phina.util.Tween();
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
   * @param {BaseApp} app 
   */
  _updateTween(app) {
    var tween = this._tween;
    var time = this._getUnitTime(app);

    tween.forward(time);
    this.flare('tween');

    if (tween.time >= tween.duration) {
      delete this._tween;
      this._tween = null;
      this._update = this._updateTask;
    }
  }

  /**
   * @param {BaseApp} app 
   */
  _updateWait(app) {
    var wait = this._wait;
    var time = this._getUnitTime(app);
    wait.time += time;

    if (wait.time >= wait.limit) {
      delete this._wait;
      this._wait = null;
      this._update = this._updateTask;
    }
  }

  /**
   * @private
   * @param {BaseApp} app 
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
 *     func: (app?: BaseApp)=> number,
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

// Element側で拡張
// /**
//  * @member phina.app.Element
//  * @property tweener
//  * 自身にアタッチ済みの{@link phina.accessory.Tweener}オブジェクト。
//  */
// phina.app.Element.prototype.getter('tweener', function() {
//   if (!this._tweener) {
//     this._tweener = phina.accessory.Tweener().attachTo(this);
//   }
//   return this._tweener;
// });