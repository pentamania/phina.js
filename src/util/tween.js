import { clamp } from "../core/math";
import { forIn } from "../core/object";
import { EventDispatcher } from "../util/eventdispatcher"

/**
 * イージングの種類を表す文字列
 * @typedef {keyof Tween.EASING} TweenEasingType
 */

/**
 * イージング管理用のプロパティマップ型
 * @typedef {Record<string|number|symbol, number>} TweenPropMap
 */

/**
 * イージング関数の基礎型
 * @typedef {(time: number, baseVal: number, changedVal: number, duration: number)=> number } TweenEasingCommonFunction
 * 
 * イージング関数の拡張可能型
 * @typedef {(time: number, baseVal: number, changedVal: number, duration: number, ...otherArgs: number[])=> number} TweenEasingFunction
 */

/**
 * @class phina.util.Tween
 * _extends phina.util.EventDispatcher
 * 
 */
export class Tween extends EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * tween経過時間
     * 
     * @public
     * @type {number}
     */
    this.time = 0;

    /**
     * 内部イージング関数
     * 
     * @private
     * @type {TweenEasingFunction}
     */
    this._easing;

    /**
     * tween開始パラメータ
     * 
     * @protected TBD
     * @type {TweenPropMap}
     */
     this.beginProps;

    /**
     * tween終了パラメータ
     * 
     * @protected TBD
     * @type {TweenPropMap}
     */
     this.finishProps;

    /**
     * tween更新中パラメータ
     * 
     * @protected TBD
     * @type {TweenPropMap}
     */
     this.changeProps;

    /**
     * tween持続時間
     * 
     * @public
     * @type {number}
     */
    this.duration;
  }

  /**
   * Tweenクラスの汎用コアメソッド。
   * Tween.to, Tween.from, Tween.byといった処理で内部的に使用される
   * 
   * @param {any} target
   * @param {TweenPropMap} beginProps
   * @param {TweenPropMap} finishProps
   * @param {number} [duration] tween持続時間。無指定もしくは0のときはデフォルト値1000となる
   * @param {TweenEasingType} [easing] 
   * @returns {this}
   */
  fromTo(target, beginProps, finishProps, duration, easing) {
    this.target = target;
    this.beginProps = beginProps;
    this.finishProps = finishProps;
    this.duration = duration || 1000;
    this.easing = easing;

    // setup
    this.changeProps = Object.create(null);
    for (const key in beginProps) {
        this.changeProps[key] = finishProps[key] - beginProps[key];
    }

    return this;
  }

  /**
   * @param {any} target
   * @param {TweenPropMap} finishProps
   * @param {number} [duration]
   * @param {TweenEasingType} [easing]
   * @returns {this}
   */
  to(target, finishProps, duration, easing) {
    const beginProps = Object.create(null);

    for (const key in finishProps) {
      beginProps[key] = target[key];
    }

    this.fromTo(target, beginProps, finishProps, duration, easing);

    return this;
  }

  /**
   * @param {any} target
   * @param {TweenPropMap} beginProps
   * @param {number} [duration]
   * @param {TweenEasingType} [easing]
   * @returns {this}
   */
  from(target, beginProps, duration, easing) {
      const finishProps = Object.create(null);

      for (const key in beginProps) {
        finishProps[key] = target[key];
        target[key] = beginProps[key];
      }

      this.fromTo(target, beginProps, finishProps, duration, easing);

      return this;
  }

  /**
   * @param {any} target
   * @param {TweenPropMap} props
   * @param {number} [duration]
   * @param {TweenEasingType} [easing]
   * @returns {this}
   */
  by(target, props, duration, easing) {
    const beginProps = Object.create(null);
    const finishProps = Object.create(null);

    for (const key in props) {
      beginProps[key] = target[key];
      finishProps[key] = target[key] + props[key];
    }

    this.fromTo(target, beginProps, finishProps, duration, easing);

    return this;
  }

  /**
   * TODO
   */
  yoyo() {
    const temp = this.beginProps;
    this.beginProps = this.finishProps;
    this.finishProps = temp;
    // this.changeProps.forIn(function(key, value, index) {
    forIn.call(this.changeProps,
    (/** @type {string | number} */ key, /** @type {number} */ value)=> {
      this.changeProps[key] = -value;
      this.target[key] = this.beginProps[key];
    });
    // TODO: easing も反転させる
    // this.easing = easing;
    return this;
  }

  /**
   * 指定値分、時間を進める
   * 
   * @alias forward
   * @param {number} time
   */
  gain(time) {
    this.seek(this.time + time);
  }

  /**
   * 指定値分、時間を進める
   * 
   * @alias gain
   * @param {number} time
   */
  forward(time) {
    this.seek(this.time + time);
  }

  /**
   * 指定値分、時間を戻す
   * 
   * @param {number} time
   */
  backward(time) {
    this.seek(this.time - time);
  }

  /**
   * 時間に応じてパラメータを更新
   * 
   * @param {number} time
   * @returns {this}
   */
  seek(time) {
    // this.time = Math.clamp(time, 0, this.duration);
    this.time = clamp(time, 0, this.duration);

    // this.beginProps.forIn(
    forIn.call(this.beginProps,
    (/** @type {string | number} */ key, /** @type {number} */ value)=> {
      const v = /** @type function */(this.easing)(this.time, value, this.changeProps[key], this.duration);
      this.target[key] = v;
    });

    return this;
  }

  /**
   * ### Getter
   * 内部イージング関数を返す
   * 
   * @type {TweenEasingFunction | string | undefined}
   * （setterがstring/undefinedを受け付けるため、共用体としている）
   */
  get easing() { return this._easing; }

  /**
   * ### Setter
   * Easingタイプを文字列で指定、内部イージング関数を変更する
   * 
   * 存在しないEasingタイプ、あるいはundefinedなど文字列以外を指定すると
   * `default(=linear)`タイプのイージング関数がセットされる
   * 
   * @type {TweenEasingFunction | string | undefined}
   */
  set easing(v) {
    this._easing = Tween.EASING[/**@type {TweenEasingType}*/(v)] || Tween.EASING.default;
  }

}

/**
 * @static
 * イージング関数マップ
 * 
 * ### Reference
 * - <http://coderepos.org/share/wiki/JSTweener>
 * - <http://coderepos.org/share/browser/lang/javascript/jstweener/trunk/src/JSTweener.js>
 * - <http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js>
 * - <http://hosted.zeh.com.br/tweener/docs/en-us/misc/transitions.html>
 */
Tween.EASING = {
  /** default */
  default: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*t/d + b;
  },
  /** linear */
  linear: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*t/d + b;
  },
  /** swing */
  swing: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  /** easeInQuad */
  easeInQuad: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  /** easeOutQuad */
  easeOutQuad: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  /** easeInOutQuad */
  easeInOutQuad: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 *((--t)*(t-2) - 1) + b;
  },
  /** defeInCubic */
  easeInCubic: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  /** easeOutCubic */
  easeOutCubic: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  /** easeInOutCubic */
  easeInOutCubic: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  /** easeOutInCubic */
  easeOutInCubic: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutCubic(t*2, b, c/2, d);
    return Tween.EASING.easeInCubic((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInQuart */
  easeInQuart: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  /** easeOutQuart */
  easeOutQuart: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c *((t=t/d-1)*t*t*t - 1) + b;
  },
  /** easeInOutQuart */
  easeInOutQuart: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 *((t-=2)*t*t*t - 2) + b;
  },
  /** easeOutInQuart */
  easeOutInQuart: 
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutQuart(t*2, b, c/2, d);
    return Tween.EASING.easeInQuart((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInQuint */
  easeInQuint:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  /** easeOutQuint */
  easeOutQuint:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  /** easeInOutQuint */
  easeInOutQuint:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  /** easeOutInQuint */
  easeOutInQuint:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutQuint(t*2, b, c/2, d);
    return Tween.EASING.easeInQuint((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInSine */
  easeInSine:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
  },
  /** easeOutSine */
  easeOutSine:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c * Math.sin(t/d *(Math.PI/2)) + b;
  },
  /** easeInOutSine */
  easeInOutSine:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
  },
  /** easeOutInSine */
  easeOutInSine:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutSine(t*2, b, c/2, d);
    return Tween.EASING.easeInSine((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInExpo */
  easeInExpo:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
  },
  /** easeOutExpo */
  easeOutExpo:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
  },
  /** easeInOutExpo */
  easeInOutExpo:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t==0) return b;
    if(t==d) return b+c;
    if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
    return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
  },
  /** easeOutInExpo */
  easeOutInExpo:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutExpo(t*2, b, c/2, d);
    return Tween.EASING.easeInExpo((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInCirc */
  easeInCirc:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
  },
  /** easeOutCirc */
  easeOutCirc:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
  },
  /** easeInOutCirc */
  easeInOutCirc:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
    return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
  },
  /** easeOutInCirc */
  easeOutInCirc:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutCirc(t*2, b, c/2, d);
    return Tween.EASING.easeInCirc((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInElastic */
  easeInElastic:
  /** @type {(t: number, b: number, c: number, d: number, a: number, p: number)=> number} */
  function(t, b, c, d, a, p) {
    let s;
    if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
    if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
  },
  /** easeOutElastic */
  easeOutElastic:
  /** @type {(t: number, b: number, c: number, d: number, a: number, p: number)=> number} */
  function(t, b, c, d, a, p) {
    let s;
    if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
    if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
    return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
  },
  /** easeInOutElastic */
  easeInOutElastic:
  /** @type {(t: number, b: number, c: number, d: number, a: number, p: number)=> number} */
  function(t, b, c, d, a, p) {
    let s;
    if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
    if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
    if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  /** easeOutInElastic */
  easeOutInElastic:
  /** @type {(t: number, b: number, c: number, d: number, a: number, p: number)=> number} */
  function(t, b, c, d, a, p) {
    if(t < d/2) return Tween.EASING.easeOutElastic(t*2, b, c/2, d, a, p);
    return Tween.EASING.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
  },
  /** easeInBack */
  easeInBack:
  /** @type {(t: number, b: number, c: number, d: number, s?: number)=> number} */
  function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  /** easeOutBack */
  easeOutBack:
  /** @type {(t: number, b: number, c: number, d: number, s?: number)=> number} */
  function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  /** easeInOutBack */
  easeInOutBack:
  /** @type {(t: number, b: number, c: number, d: number, s?: number)=> number} */
  function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  /** easeOutInBack */
  easeOutInBack:
  /** @type {(t: number, b: number, c: number, d: number, s?: number)=> number} */
  function(t, b, c, d, s) {
    if(t < d/2) return Tween.EASING.easeOutBack(t*2, b, c/2, d, s);
    return Tween.EASING.easeInBack((t*2)-d, b+c/2, c/2, d, s);
  },
  /** easeInBounce */
  easeInBounce:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    return c - Tween.EASING.easeOutBounce(d-t, 0, c, d) + b;
  },
  /** easeOutBounce */
  easeOutBounce:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if((t/=d) <(1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if(t <(2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if(t <(2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  /** easeInOutBounce */
  easeInOutBounce:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeInBounce(t*2, 0, c, d) * .5 + b;
    else return Tween.EASING.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
  },
  /** easeOutInBounce */
  easeOutInBounce:
  /** @type {TweenEasingCommonFunction} */
  function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutBounce(t*2, b, c/2, d);
    return Tween.EASING.easeInBounce((t*2)-d, b+c/2, c/2, d);
  }
}