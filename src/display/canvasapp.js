import { $safe } from "../core/object"
import { DomApp } from "./domapp"
import { Canvas } from "../graphics/canvas"
import { Grid } from "../util/grid"
import { DisplayScene } from "../display/displayscene"

/**
 * CanvasApp初期化オプション  
 * DisplaySceneの初期化に使われることも考え、そのオプションパラメータも継承
 * @typedef {{ 
 *  append?: boolean
 *  columns?: number
 *  backgroundColor?: import("../graphics/canvas").CanvasStyle
 *  fit?: boolean
 *  pixelated?: boolean
 * } 
 * & import("./domapp").DomAppOptions
 * & import("./displayscene").DisplaySceneOptions } CanvasAppOptions
 */

/**
 * @class phina.display.CanvasApp
 * _extends phina.display.DomApp
 */
export class CanvasApp extends DomApp {

  /**
   * @constructor
   * @param {CanvasAppOptions} options
   */
  constructor(options) {
    options = $safe.call((options || {}), CanvasApp.defaults)
    // options = (options || {}).$safe(CanvasApp.defaults);
    
    if (!options.query && !options.domElement) {
      options.domElement = document.createElement('canvas');
      if (options.append) {
        document.body.appendChild(options.domElement);
      }
    }
    super(options);

    this.gridX = new Grid({
      width: options.width,
      columns: options.columns,
    });
    this.gridY = new Grid({
      width: options.height,
      columns: options.columns,
    });

    this.canvas = new Canvas(this.domElement);
    this.canvas.setSize(options.width, options.height);

    this.backgroundColor = (options.backgroundColor !== undefined) ? options.backgroundColor : 'white';

    this.replaceScene(new DisplayScene({
      width: options.width,
      height: options.height,
    }));

    if (options.fit) {
      this.fitScreen();
    }

    if (options.pixelated) {
      // チラつき防止
      // ドット絵ゲームのサポート
      // https://drafts.csswg.org/css-images/#the-image-rendering
      // https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering#Browser_compatibility
      if (navigator.userAgent.match(/Firefox\/\d+/)) {
        this.domElement.style.imageRendering = 'crisp-edges';
      } else {
        this.domElement.style.imageRendering = 'pixelated';
      }
    }

    // pushScene, popScene 対策
    this.on('push', function() {
      // onenter 対策で描画しておく
      if (this.currentScene.canvas) {
        this._draw();
      }
    });
  }

  /**
   * @override
   * 描画処理
   */
  _draw() {
    if (this.backgroundColor) {
      this.canvas.clearColor(this.backgroundColor);
    } else {
      this.canvas.clear();
    }

    var currentScene = /** @type {DisplayScene} */(this.currentScene);
    if (currentScene.canvas) {
      currentScene._render();

      // this._scenes.each(
      this._scenes.forEach(
      /** @param {DisplayScene} scene */
      function(scene) {
        var c = scene.canvas;
        if (c) {
          this.canvas.context.drawImage(c.domElement, 0, 0, c.width, c.height);
        }
      }, this);
    }
  }

  /**
   * CanvasクラスのfitScreenを実行
   * @returns {void}
   */
  fitScreen() {
    this.canvas.fitScreen();
  }

}

/**
 * @static
 * @type {CanvasAppOptions}
 */
CanvasApp.defaults = {
  width: 640,
  height: 960,
  columns: 12,
  fit: true,
  append: true,
}