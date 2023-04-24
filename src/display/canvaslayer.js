import { $safe } from "../core/object";
import { Canvas } from "../graphics/canvas"
import { DisplayElement } from "./displayelement";
import { CanvasRenderer } from "./canvasrenderer";
import { Grid } from "../util/grid";

/**
 * @class phina.display.Layer
 * _extends phina.display.DisplayElement
 */
export class Layer extends DisplayElement {

  /**
   * @param {DisplayElement.defaults} [options] 
   */
  constructor(options) {
    options = $safe.call({}, options||{}, {
    // options = ({}).$safe(options, {
      width: 640,
      height: 960,
    });
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.gridX = new Grid(options.width, 16);
    this.gridY = new Grid(options.height, 16);
    this.renderChildBySelf = true;

    /**
     * @type HTMLCanvasElement 
     */
    this.domElement;
  }

  /**
   * @param {Canvas} canvas
   * @returns {void}
   */
  draw(canvas) {
    if (!this.domElement) return ;

    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}


/**
 * @class phina.display.CanvasLayer
 * _extends phina.display.Layer
 */
export class CanvasLayer extends Layer {

  /**
   * @param {DisplayElement.defaults} options 
   */
  constructor(options) {
    super(options);
    this.canvas = new Canvas();
    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    this.renderer = new CanvasRenderer(this.canvas);
    this.domElement = this.canvas.domElement;

    this.on('enterframe',
    /** @this CanvasLayer */
    function() {
      var temp = this._worldMatrix;
      this._worldMatrix = null;
      this.renderer.render(this);
      this._worldMatrix = temp;
    });
  }

  /**
   * @param {Canvas} canvas
   * @returns {void}
   */
  draw(canvas) {
    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}
