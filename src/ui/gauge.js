import { $safe } from "../core/object"
import { clamp } from "../core/math"
import { Shape } from "../display/shape";

/**
 * @typedef {{
 *   value?: number
 *   maxValue?: number
 *   gaugeColor?: import("../graphics/canvas").CanvasStyle
 *   animation?: boolean
 *   cornerRadius?: number
 * } & import('../display/shape').ShapeOptions } GaugeOptions
 */

/**
 * @class phina.ui.Gauge
 * _extends phina.display.Shape
 */
export class Gauge extends Shape {

  /**
   * @param {GaugeOptions} [options] 
   */
  constructor(options) {
    options = $safe.call({}, options || {}, Gauge.defaults);
    // options = ({}).$safe(options || {}, phina.ui.Gauge.defaults);
    
    super(options);

    /**
     * @private
     * @type {number}
     */
    this._value = (options.value !== undefined) ? options.value : options.maxValue;

    /**
     * @type {number} 最大値
     */
    this.maxValue = options.maxValue;

    this.gaugeColor = options.gaugeColor;
    
    /**
     * @type {number} 最大値
     */
    this.cornerRadius = options.cornerRadius;

    /**
     * @type {number} 見た目の値
     */
    this.visualValue = (options.value !== undefined) ? options.value : options.maxValue;

    /**
     * @type {boolean} アニメーションさせるかどうか
     */
    this.animation = options.animation;

    /**
     * @type {number} アニメーション完了時間をミリ秒指定
     * @default 1000
     */
    this.animationTime = 1*1000;
  }

  /**
   * 満タンかをチェック
   * @returns {boolean}
   */
  isFull() {
    return this.value === this.maxValue;
  }

  /**
   * 空っぽかをチェック
   * @returns {boolean}
   */
  isEmpty() {
    return this.value === 0;
  }

  /**
   * @param {number} value
   * @returns {void}
   */
  setValue(value) {
    value = clamp(value, 0, this.maxValue);
    // value = Math.clamp(value, 0, this.maxValue);

    // end when now value equal value of argument
    if (this.value === value) return ;

    // fire value change event
    this.flare('change');

    this._value = value;

    if (this.animation) {
      var range = Math.abs(this.visualValue-value);
      var time = (range/this.maxValue)*this.animationTime;

      // @ts-ignore
      this.tweener.ontween = function() {
        this._dirtyDraw = true;
      }.bind(this);
      this.tweener
        .clear()
        .to({'visualValue': value}, time)
        .call(function() {
          this.flare('changed');
          if (this.isEmpty()) {
            this.flare('empty');
          }
          else if (this.isFull()) {
            this.flare('full');
          }
        }, this);
    }
    else {
      this.visualValue = value;
      this.flare('changed');
      if (this.isEmpty()) {
        this.flare('empty');
      }
      else if (this.isFull()) {
        this.flare('full');
      }
    }
  }

  /**
   * 
   * @returns {number}
   */
  getRate() {
    var rate = this.visualValue/this.maxValue;
    return rate;
  }

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  postrender(canvas) {
    var rate = this.getRate();
    canvas.context.fillStyle = this.gaugeColor;
    canvas.context.save();
    canvas.context.clip();
    canvas.fillRect(-this.width/2, -this.height/2, this.width*rate, this.height);
    canvas.context.restore();
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this.setValue(v);
  }

}

/**
 * @type {GaugeOptions}
 * @static
 */
Gauge.defaults = {
  width: 256,
  height: 32,
  backgroundColor: 'transparent',
  fill: 'white',
  stroke: '#aaa',
  strokeWidth: 4,
  maxValue: 100,
  gaugeColor: '#44f',
  cornerRadius: 0,
  animation: true
}

// defined
Shape.watchRenderProperty.call(Gauge, 'value');
Shape.watchRenderProperty.call(Gauge, 'maxValue');
Shape.watchRenderProperty.call(Gauge, 'gaugeColor');
Shape.watchRenderProperty.call(Gauge, 'cornerRadius');

/**
 * @typedef {{
 *   anticlockwise?: boolean
 *   showPercentage?: boolean
 * } & GaugeOptions } CircleGaugeOptions
 */

/**
 * @class phina.ui.CircleGauge
 * _extends phina.ui.Gauge
 */
export class CircleGauge extends Gauge {

  /**
   * @param {CircleGaugeOptions} [options] 
   */
  constructor(options) {
    options = $safe.call(options || {}, {
    // options = (options || {}).$safe({
      backgroundColor: 'transparent',
      fill: '#aaa',
      stroke: '#222',

      radius: 64,
      anticlockwise: true,
      showPercentage: false, // TODO
    });

    super(options);

    this.setBoundingType('circle');

    this.radius = options.radius;
    this.anticlockwise = options.anticlockwise;
    this.showPercentage = options.showPercentage;
  }

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} _canvas 
   */
  prerender(_canvas) {
    var rate = this.getRate();
    var end = (Math.PI*2)*rate;
    this.startAngle = 0;
    this.endAngle = end;

    this.canvas.rotate(-Math.PI*0.5);
    this.canvas.scale(1, -1);
  }

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  renderFill(canvas) {
    canvas.fillPie(0, 0, this.radius, this.startAngle, this.endAngle);
  }

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  renderStroke(canvas) {
    canvas.strokeArc(0, 0, this.radius, this.startAngle, this.endAngle);
  }

  postrender() {
    // if (this.showPercentage) {
    //   // TODO:
    //   var left = Math.max(0, this.limit-this.time);
    //   this.label.text = Math.ceil(left/1000)+'';
    // }
  }

}