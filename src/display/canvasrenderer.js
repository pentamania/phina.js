import { Circle } from "../geom/circle";
import { Rect } from "../geom/rect";

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

    /**
     * コライダー（当たり判定）を描画するかどうか
     * 
     * @type {boolean}
     */
    this.showCollider = false;

    /**
     * コライダー描画時のfillStyle
     * @type {import("../graphics/canvas").CanvasStyle}
     */
    this.colliderFillStyle = 'rgba(255, 0, 0, 0.4)';
  }

  /**
   * デバッグ用にコライダーを描画する
   * @protected
   * 
   * @param {import("../app/object2d").Object2D} obj
   */
  _drawCollider(obj) {
    var context = this.canvas.context;
    var col = obj.getGlobalCollider();
    if (!col) return;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = this.colliderFillStyle;
    if (col instanceof Rect) {
      this.canvas.fillRect(col.x, col.y, col.width, col.height);
    } else if (col instanceof Circle) {
      this.canvas.fillCircle(col.x, col.y, col.radius);
    }
    context.restore();
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
    sortChildrenByRenderOrder(obj);
  
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
    sortChildrenByRenderOrder(obj);

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

      if (this.showCollider) this._drawCollider(obj);
    }
  }
}

/**
 * @static
 * 描画順変更処理機能を有効化 [default: true]
 * trueにするとレンダリングにsort処理が入るため、若干負荷が上がる
 */
CanvasRenderer.enableRenderOrdering = true

/**
 * renderOrder比較関数
 * 
 * @param {import("./displayelement").DisplayElement} a 
 * @param {import("./displayelement").DisplayElement} b 
 * @returns {number}
 */
const renderOrderCompareFn = (a, b) =>
  (a.renderOrder || 0) - (b.renderOrder || 0);

/**
 * ElementのchildrenをrenderOrderによって順序入れ替え
 * 
 * @param {import("../app/element").ElementBasedObject} obj
 * @returns {void}
 */
function sortChildrenByRenderOrder(obj) {
  if (CanvasRenderer.enableRenderOrdering && obj.children.length)
    obj.children.sort(renderOrderCompareFn);
}
