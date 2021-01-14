import { DisplayElement } from "./displayelement";
import { Canvas } from "../graphics/canvas";

/**
 * @class phina.display.PlainElement
 * _extends phina.display.DisplayElement
 */
export class PlainElement extends DisplayElement {

  /**
   * @param {DisplayElement.defaults} options 
   */
  constructor(options) {
    super(options);
    this.canvas = new Canvas();
    this.canvas.setSize(this.width, this.height);
  }

  /**
   * @param {Canvas} canvas
   * @returns {void}
   */
  draw(canvas) {
    var image = this.canvas.domElement;
    var w = image.width;
    var h = image.height;

    var x = -w*this.origin.x;
    var y = -h*this.origin.y;

    canvas.context.drawImage(image,
      0, 0, w, h,
      x, y, w, h
      );
  }
}