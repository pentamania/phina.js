import { DisplayElement } from "./displayelement";

/**
 * phina.display.PathShapeのライト版
 * PathShapeよりシンプルだが描画範囲が狭い分、処理軽い
 */
export class PathSprite extends DisplayElement {
  /**
   * @public
   * @type {import("../geom/vector2").Vector2[]}
   */
  paths = [];

  /**
   * @public
   * @type {import("../graphics/canvas").CanvasStyle}
   */
  stroke = "magenta";

  /**
   * @public
   * @type {number}
   */
  strokeWidth = 8;

  /**
   * 描画処理
   * @param {import("../graphics/canvas").Canvas}canvas  本体appのCanvasRenderer.canvas参照
   */
  draw(canvas) {
    if (this.paths.length <= 1) return;

    canvas.save();
    canvas.strokeStyle = this.stroke;
    canvas.lineWidth = this.strokeWidth;

    {
      const ctx = canvas.context;
      let p = this.paths[0];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      for (let i = 1, len = this.paths.length; i < len; ++i) {
        p = this.paths[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    canvas.restore();
  }
}
