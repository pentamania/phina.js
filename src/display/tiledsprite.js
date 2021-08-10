import { AssetManager } from "../asset/assetmanager";
import { Rect } from "../geom/rect";
import { Vector2 } from "../geom/vector2";
import { Canvas } from "../graphics/canvas";
import { DisplayElement } from "./displayelement";

/**
 * @class phina.display.TiledSprite
 * 
 * 指定したテクスチャをタイル状に並べて表示する
 * 背景スクロールなどに使用
 */
export class TiledSprite extends DisplayElement {
  /**
   * @param {Parameters<typeof TiledSprite.prototype.setImage>} params
   */
  constructor(params) {
    super();

    /**
     * スプライト元画像（テクスチャ）。setImageで初期化
     * @protected
     * @type {import("./sprite").SpriteImage}
     */
    this._image = null;

    /**
     * タイル幅
     * 
     * @protected
     * @type {number}
     */
    this._tileWidth = 0;

    /**
     * タイル高さ
     * 
     * @protected
     * @type {number}
     */
    this._tileHeight = 0;

    /**
     * フレーム矩形
     * 
     * @type {Rect}
     */
    this.srcRect = new Rect();

    /**
     * タイル描画位置オフセット.
     * スクロール表現などで使用
     * 
     * @type {Vector2}
     */
    this.offset = new Vector2(0, 0);

    /**
     * パターン元となるタイル画像を保持するためのCanvasクラス
     * @private
     * @type {Canvas}
     */
    this._tempCanvas = new Canvas();

    /**
     * タイル用CanvasPattern
     * @protected
     * @type {CanvasPattern}
     */
    this._canvasPattern = null;

    this.setImage(...params);
  }

  /**
   * 画像をセット
   * 
   * {@link Sprite.setImage} との違いはタイルサイズの保持処理があること
   * 
   * @public
   * @param {string | import("./sprite").SpriteImage } image
   * @param {number} [width]
   * @param {number} [height]
   * @returns {this}
   */
  setImage(image, width, height) {
    this._image =
      typeof image === "string" ? AssetManager.get("image", image) : image;
    this.width = this._image.domElement.width;
    this.height = this._image.domElement.height;

    if (width) {
      this.width = width;
    }
    if (height) {
      this.height = height;
    }
    this._tileWidth = this.width;
    this._tileHeight = this.height;

    this.frameIndex = 0; // this.setFrameIndex(0)

    return this;
  }

  /**
   * indexに応じてタイル化範囲をセット
   * 
   * {@link Sprite.setFrameIndex} との違いは
   * - タイルサイズの設定
   * - パターンの再レンダリング
   * 処理があること
   * 
   * @public
   * @param {number} index
   * @param {number} [width] タイル幅
   * @param {number} [height] タイル高さ
   * @returns {this}
   */
  setFrameIndex(index, width, height) {
    var tw = width || this._tileWidth || this._width;
    var th = height || this._tileHeight || this._height;
    var row = ~~(this.image.domElement.width / tw);
    var col = ~~(this.image.domElement.height / th);
    var maxIndex = row * col;
    index = index % maxIndex;

    var x = index % row;
    var y = ~~(index / row);
    this.srcRect.x = x * tw;
    this.srcRect.y = y * th;
    this.srcRect.width = tw;
    this.srcRect.height = th;

    this._frameIndex = index;

    this._tileWidth = tw;
    this._tileHeight = th;
    this._renderPattern();

    return this;
  }

  /**
   * オフセット値を一括セット
   * 
   * @public
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  setOffset(x, y) {
    this.offset.x = x;
    this.offset.y = y;
    return this;
  }

  /**
   * パターン元となるタイル画像を内部キャンバスに描画
   * 
   * @protected
   * @returns {void}
   */
  _renderPattern() {
    var tempCanvas = this._tempCanvas;
    var image = this.image.domElement;
    var srcRect = this.srcRect;
    tempCanvas.clear().setSize(srcRect.width, srcRect.height);
    tempCanvas.drawImage(
      image,
      srcRect.x,
      srcRect.y,
      srcRect.width,
      srcRect.height,
      0,
      0,
      srcRect.width,
      srcRect.height
    );
    this._canvasPattern = tempCanvas.context.createPattern(
      tempCanvas.canvas,
      "repeat"
    );
  }

  /**
   * 描画処理
   * アクティブなシーングラフに追加されているときはrendererによって毎フレーム実行される
   * 
   * @param {Canvas} canvas rendererのcanvas
   * @returns {void}
   */
  draw(canvas) {
    var context = canvas.context;
    context.fillStyle = this._canvasPattern;
    context.translate(
      -this._width * this.originX - this.offset.x,
      -this._height * this.originY - this.offset.y
    );
    context.fillRect(this.offset.x, this.offset.y, this._width, this._height);
  }

  get image() {
    return this._image;
  }
  set image(v) {
    this.setImage(v);
  }

  get frameIndex() {
    return this._frameIndex;
  }
  set frameIndex(idx) {
    this.setFrameIndex(idx);
  }

  get offsetX() {
    return this.offset.x;
  }
  set offsetX(v) {
    this.offset.x = v;
  }

  get offsetY() {
    return this.offset.y;
  }
  set offsetY(v) {
    this.offset.y = v;
  }
}
