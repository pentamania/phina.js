/**
 * @typedef {import("../app/element").Element & {
 *   backgroundColor?: import("../graphics/canvas").CanvasStyle
 * }} RenderableScene
 */

/**
 * @typedef {import("./displayelement").DisplayElement & {
 *   clip?: (canvas: import('../graphics/canvas').Canvas)=> any,
 *   draw?: (canvas: import('../graphics/canvas').Canvas)=> any
 * }} RenderableElement
 */

/**
 * @class phina.display.CanvasRenderer
 */
export class CanvasRenderer {

  /**
   * @param {import('../graphics/canvas').Canvas} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this._context = this.canvas.context;
  }

  /**
   * @param {RenderableScene} scene
   */
  render(scene) {
    this.canvas.clear();
    if (scene.backgroundColor) {
      this.canvas.clearColor(scene.backgroundColor);
    }

    this._context.save();
    this.renderChildren(scene);
    this._context.restore();
  }

  /**
   * @param {import("../app/element").ElementBasedObject} obj
   */
  renderChildren(obj) {
    // 子供たちも実行
    if (obj.children.length > 0) {
      var tempChildren = /** @type {RenderableElement[]}*/(obj.children.slice());
      for (var i=0,len=tempChildren.length; i<len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    }
  }

  /**
   * @param {RenderableElement} obj
   */
  renderObject(obj) {
    if (obj.visible === false && !obj.interactive) return;

    obj._calcWorldMatrix && obj._calcWorldMatrix();

    if (obj.visible === false) return;

    obj._calcWorldAlpha && obj._calcWorldAlpha();

    var context = this.canvas.context;

    context.globalAlpha = obj._worldAlpha;
    context.globalCompositeOperation = obj.blendMode;

    if (obj._worldMatrix) {
      // 行列をセット
      var m = obj._worldMatrix;
      context.setTransform( m.m00, m.m10, m.m01, m.m11, m.m02, m.m12 );
    }

    if (obj.clip) {

      context.save();

      obj.clip(this.canvas);
      context.clip();

      if (obj.draw) obj.draw(this.canvas);

      // 子供たちも実行
      if (obj.renderChildBySelf === false && obj.children.length > 0) {
          var tempChildren = obj.children.slice();
          for (var i=0,len=tempChildren.length; i<len; ++i) {
              this.renderObject(tempChildren[i]);
          }
      }

      context.restore();
    }
    else {
      if (obj.draw) obj.draw(this.canvas);

      // 子供たちも実行
      if (obj.renderChildBySelf === false && obj.children.length > 0) {
        var tempChildren = obj.children.slice();
        for (var i=0,len=tempChildren.length; i<len; ++i) {
          this.renderObject(tempChildren[i]);
        }
      }

    }
  }

}