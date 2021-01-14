import { $safe } from "../core/object"
import { Shape } from "../display/shape";
import { format } from "../core/string";

/**
 * @typedef {{
 *   text?: string,
 *   fontColor?: import("../graphics/canvas").CanvasStyle,
 *   fontSize?: number,
 *   fontWeight?: string | number,
 *   fontFamily?: string,
 *   cornerRadius?: number
 * } & import('../display/shape').ShapeOptions } ButtonOptions
 */

/**
 * @class phina.ui.Button
 * Button
 * _extends phina.display.Shape
 */
export class Button extends Shape {

  /**
   * @constructor
   * @param {ButtonOptions} [options]
   */
  constructor(options) {
    options = $safe.call(options || {}, Button.defaults);
    // options = (options || {}).$safe(phina.ui.Button.defaults);
    super(options);

    this.cornerRadius = options.cornerRadius;
    this.text         = options.text;
    this.fontColor    = options.fontColor;
    this.fontSize     = options.fontSize;
    this.fontWeight     = options.fontWeight;
    this.fontFamily   = options.fontFamily;

    this.setInteractive(true);
    this.on('pointend', function() {
      this.flare('push');
    });
  }

  /**
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

  /**
   * @param {import('../graphics/canvas').Canvas} canvas 
   */
  postrender(canvas) {
    var context = canvas.context;
    // text
    var font = format.call("{fontWeight} {fontSize}px {fontFamily}", this);
    // var font = "{fontWeight} {fontSize}px {fontFamily}".format(this);
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = this.fontColor;
    context.fillText(this.text, 0, 0);
  }

}

/**
 * @type {ButtonOptions}
 * @static
 */
Button.defaults = {
  width: 200,
  height: 80,
  backgroundColor: 'transparent',
  fill: 'hsl(200, 80%, 60%)',
  stroke: null,

  cornerRadius: 8,
  text: 'Hello',
  fontColor: 'white',
  fontSize: 32,
  fontWeight: '',
  fontFamily: "'HiraKakuProN-W3'", // Hiragino or Helvetica,
}

// defined
Shape.watchRenderProperty.call(Button, 'cornerRadius');
Shape.watchRenderProperty.call(Button, 'text');
Shape.watchRenderProperty.call(Button, 'fontColor');
Shape.watchRenderProperty.call(Button, 'fontSize');
Shape.watchRenderProperty.call(Button, 'fontFamily');