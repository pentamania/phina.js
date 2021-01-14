import { $safe } from "../core/object"
import { Scene } from "../app/scene"
import { Canvas } from "../graphics/canvas"
import { CanvasRenderer } from "../display/canvasrenderer"
import { Grid } from "../util/grid"

/**
 * @typedef {{
 *   width?: number,
 *   height?: number,
 *   imageSmoothing?: boolean,
 *   backgroundColor?: import("../graphics/canvas").CanvasStyle,
 * }} DisplaySceneOptions
 */

/**
 * @class phina.display.DisplayScene
 * _extends phina.app.Scene
 */
export class DisplayScene extends Scene {

  /**
   * @param {DisplaySceneOptions} [params]
   */
  constructor(params) {
    super();

    params = $safe.call({}, params, DisplayScene.defaults)
    // params = ({}).$safe(params, DisplayScene.defaults);

    this.canvas = new Canvas();
    this.canvas.setSize(params.width, params.height);
    this.renderer = new CanvasRenderer(this.canvas);
    this.backgroundColor = (params.backgroundColor) ? params.backgroundColor : null;

    this.width = params.width;
    this.height = params.height;
    this.gridX = new Grid(params.width, 16);
    this.gridY = new Grid(params.height, 16);

    // TODO: 一旦むりやり対応
    this.interactive = true;
    // this.setInteractive = function(flag) {
    //   this.interactive = flag;
    // };
    this._overFlags = {};
    this._touchFlags = {};

    var ctx = this.canvas.context;
    if (params.imageSmoothing === false) {
      ctx.imageSmoothingEnabled = false;
      ctx['webkitImageSmoothingEnabled'] = false;
      ctx['msImageSmoothingEnabled'] = false;
    }
  }

  /**
   * @param {boolean} flag
   */
  setInteractive(flag) {
    this.interactive = flag;
  }

  hitTest() {
    return true;
  }

  /**
   * @virtual
   * @param {import("../display/canvasapp").CanvasApp} [_app] アプリケーション本体の参照
   */
  update(_app) {}

  /**
   * @returns {void}
   */
  _update() {
    if (this.update) {
      this.update();
    }
  }

  /**
   * @returns {void}
   */
  _render() {
    this.renderer.render(this);
  }

}

/** @type DisplaySceneOptions */
DisplayScene.defaults = {
  width: 640,
  height: 960,
  imageSmoothing: true,
}