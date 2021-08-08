import { $safe } from "../core/object";
import { Shape } from "../display/shape";
import { CircleGauge } from "./gauge";

/**
 * @typedef {{
 *   gaugeBackgroundColor: import('../graphics/canvas').CanvasStyle
 *   gaugeColor: import('../graphics/canvas').CanvasStyle
 *   gaugeWidth: number
 *   gaugeBackgroundWidth?: number
 * } & import("./gauge").CircleGaugeOptions } RingGaugeOptions
 */

/**
 * @class phina.ui.RingGauge
 * _extends phina.ui.CircleGauge
 */
export class RingGauge extends CircleGauge {
  /**
   * @param {Partial<RingGaugeOptions>} options
   */
  constructor(options) {
    /** @type {RingGaugeOptions} */
    const optionFulfilled = $safe.call({}, options, {
      gaugeBackgroundColor: "#aaa",
      gaugeColor: "#26EE71",
      gaugeWidth: 12,
      anticlockwise: false,
    });
    super(optionFulfilled);

    /**
     * ゲージ幅
     * @type {number}
     */
    this.gaugeWidth = optionFulfilled.gaugeWidth;

    /**
     * ゲージ背景部分の色
     * @type {import('../graphics/canvas').CanvasStyle}
     */
    this.gaugeBackgroundColor = optionFulfilled.gaugeBackgroundColor;

    /**
     * ゲージ背景部分の幅
     * @type {number}
     */
    this.gaugeBackgroundWidth =
      optionFulfilled.gaugeBackgroundWidth != null
        ? optionFulfilled.gaugeBackgroundWidth
        : this.gaugeWidth * 1.5;

    // renderStrokeを誘起するため、strokeプロパティにtrue判定される値を代入する
    // 値そのものは使わない
    this.stroke = optionFulfilled.gaugeColor;

    // fill処理をさせない
    this.fill = undefined;
  }

  /**
   * @override
   * CircleGauge.renderFillを無効化
   */
  renderFill() {}

  /**
   * @override
   * @param {import('../graphics/canvas').Canvas} canvas
   */
  renderStroke(canvas) {
    var ctx = canvas.context;
    var radius = this.radius - this.gaugeBackgroundWidth / 2;

    // 背景部
    if (this.gaugeBackgroundWidth && this.gaugeBackgroundColor) {
      ctx.lineWidth = this.gaugeBackgroundWidth;
      ctx.strokeStyle = this.gaugeBackgroundColor;
      canvas.strokeCircle(0, 0, radius);
    }

    // メインゲージ部
    ctx.lineWidth = this.gaugeWidth;
    ctx.strokeStyle = this.gaugeColor;
    canvas.strokeArc(0, 0, radius, this.startAngle, this.endAngle);
  }

  /**
   * @type {RingGaugeOptions}
   */
  static defaults = {
    gaugeBackgroundColor: "#aaa",
    gaugeColor: "#26EE71",
    gaugeWidth: 12,
    anticlockwise: false,
  };
}
Shape.watchRenderProperty.call(RingGauge, "gaugeBackgroundColor");
Shape.watchRenderProperty.call(RingGauge, "gaugeWidth");
Shape.watchRenderProperty.call(RingGauge, "gaugeBackgroundWidth");
