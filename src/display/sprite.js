import { DisplayElement } from "./displayelement";
import { Rect } from "../geom/rect";
import { AssetManager } from "../asset/assetmanager";

/**
 * Sprite画像ソースとして使えるオブジェクト型
 * TextureクラスやCanvasクラスなど
 * @typedef {{
 *   domElement: HTMLCanvasElement | HTMLImageElement;
 *   [key: string]: any;
 * }} SpriteImage
 */

/**
 * AssetManagerに登録した画像キー、もしくはSpriteImageオブジェクト
 * @typedef {string | SpriteImage} SpriteImageSrc
 */

/**
 * @class phina.display.Sprite
 * _extends phina.display.DisplayElement
 */
export class Sprite extends DisplayElement {

  /**
   * @param {SpriteImageSrc} image
   * @param {number} [width]
   * @param {number} [height]
   */
  constructor(image, width, height) {
    super();

    /**
     * スプライト元画像（テクスチャ）。setImageで初期化
     * @private
     * @type {SpriteImage}
     */
    this._image

    /**
     * フレームインデックス。setImageで初期化
     * @private
     * @type {number}
     */
    this._frameIndex

    /**
     * 画像描画範囲
     * @type {Rect}
     */
    this.srcRect = new Rect();

    this.setImage(image, width, height);
  }

  /**
   * @param {import("../graphics/canvas").Canvas} canvas 
   */
  draw(canvas) {
    var image = this.image.domElement;

    // canvas.context.drawImage(image,
    //   0, 0, image.width, image.height,
    //   -this.width*this.origin.x, -this.height*this.origin.y, this.width, this.height
    //   );

    var srcRect = this.srcRect;
    canvas.context.drawImage(image,
      srcRect.x, srcRect.y, srcRect.width, srcRect.height,
      -this._width*this.originX, -this._height*this.originY, this._width, this._height
      );
  }

  /**
   * スプライト元画像を設定
   * @param {SpriteImageSrc} image
   * @param {number} [width]
   * @param {number} [height]
   * @returns {this}
   */
  setImage(image, width, height) {
    if (typeof image === 'string') {
      image = AssetManager.get('image', image);
    }
    this._image = /**@type {SpriteImage} */ (image);
    this.width = this._image.domElement.width;
    this.height = this._image.domElement.height;

    if (width) { this.width = width; }
    if (height) { this.height = height; }

    this.frameIndex = 0;

    return this;
  }

  /**
   * フレームインデックスを指定し、そのフレームに合わせて描画範囲を更新  
   * @param {number} index フレームインデックス。最大値を超えた場合はループ
   * @param {number} [width] フレームサイズ幅
   * @param {number} [height] フレームサイズ高さ
   * @returns {this}
   */
  setFrameIndex(index, width, height) {
    var tw  = width || this._width;      // tw
    var th  = height || this._height;    // th
    var row = ~~(this.image.domElement.width / tw);
    var col = ~~(this.image.domElement.height / th);
    var maxIndex = row*col;
    index = index%maxIndex;
    
    var x = index%row;
    var y = ~~(index/row);
    this.srcRect.x = x*tw;
    this.srcRect.y = y*th;
    this.srcRect.width  = tw;
    this.srcRect.height = th;

    this._frameIndex = index;

    return this;
  }

  get image() {return this._image;}
  set image(v) {
    this.setImage(v);
  }

  get frameIndex() {return this._frameIndex;}
  set frameIndex(idx) {
    this.setFrameIndex(idx);
  }
}