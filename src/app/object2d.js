import { $safe } from "../core/object";
import { Element as PhinaElement } from "./element";
import { Vector2 } from "../geom/vector2"
import { Matrix33 } from "../geom/matrix33";

/**
 * 判定処理の際、どのような形状として扱うか
 * @typedef {"rect"|"circle"|"none"} Object2DBoundingType
 */

/**
 * @typedef {{
 *  x?: Number,
 *  y?: Number,
 *  scaleX?: Number,
 *  scaleY?: Number,
 *  rotation?: Number,
 *  originX?: Number,
 *  originY?: Number,
 *  width?: Number,
 *  height?: Number,
 *  radius?: Number,
 *  boundingType?: Object2DBoundingType,
 * }} Object2DOptions
 */

/**
 * @class phina.app.Object2D
 * Object2D
 * _extends phina.app.Element
 */
export class Object2D extends PhinaElement {

  // /** 位置 */
  // position: null,
  // /** 回転 */
  // rotation: 0,
  // /** スケール */
  // scale: null,
  // /** 基準位置 */
  // origin: null,

  /**
   * @param {Object2DOptions} [options]
   */
  constructor(options) {
    super()

    options = $safe.call({}, options, Object2D.defaults)
    // options = ({}).$safe(options, phina.app.Object2D.defaults);

    /** @type {Vector2} 位置 */
    this.position = new Vector2(options.x, options.y);

    /** @type {Vector2} スケール */
    this.scale    = new Vector2(options.scaleX, options.scaleY);

    /** @type {number} 回転（度数単位） */
    this.rotation = options.rotation || 0;

    /** @type {Vector2} 基準位置、回転軸 */
    this.origin   = new Vector2(options.originX, options.originY);

    /**
     * @private
     * @type {Matrix33}
     * ローカル変換行列
     */
    this._matrix = new Matrix33().identity();
    /**
     * @type {Matrix33 | null}
     * ワールド変換行列
     */
    this._worldMatrix = new Matrix33().identity();

    /**
     * @private
     * @type {number} 行列計算用キャッシュ値
     */
    this._cachedRotation;
    /**
     * @private
     * @type {number} 行列計算用キャッシュ値
     */
    this._sr;
    /**
     * @private
     * @type {number} 行列計算用キャッシュ値
     */
    this._cr;

    /**
     * @type {boolean}
     * インタラクション可能かどうか
     */
    this.interactive = false;
    /**
     * @type {{ [id: number]: boolean }}
     * Interactiveクラスでのフラグ処理用
     */
    this._overFlags = {};
    /**
     * @type {{ [id: number]: boolean }}
     * Interactiveクラスでのフラグ処理用
     */
    this._touchFlags = {};

    /**
     * @protected
     * @type {number}
     */
    this._width
    /**
     * @protected
     * @type {number}
     */
    this._height
    /**
     * 半径: boundingTypeがcircleの場合のみ使用
     * @private
     * @type {number}
     */
    this._radius
    /**
     * 直径: boundingTypeがcircleの際にwidth/height値として使用  
     * radiusアクセサsetの際に更新
     * @private
     * @type {number}
     */
    this._diameter

    this.width = options.width;
    this.height = options.height;
    this.radius = options.radius;
    /**
     * 当たり判定範囲の種別
     * @type {Object2DBoundingType}
     */
    this.boundingType = options.boundingType;

    /** @type {Object2D|PhinaElement} */
    this.parent;
  }

  /**
   * 点と衝突しているかを判定
   * @param {Number} x
   * @param {Number} y
   */
  hitTest(x, y) {
    if (this.boundingType === 'rect') {
      return this.hitTestRect(x, y);
    }
    else if (this.boundingType === 'circle') {
      return this.hitTestCircle(x, y);
    }
    else {
      // none の場合
      return true;
    }
  }

  /**
   * 自身を矩形として、点と衝突しているかを判定
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  hitTestRect(x, y) {
    var p = this.globalToLocal(new Vector2(x, y));

    var left   = -this.width*this.originX;
    var right  = +this.width*(1-this.originX);
    var top    = -this.height*this.originY;
    var bottom = +this.height*(1-this.originY);

    return ( left < p.x && p.x < right ) && ( top  < p.y && p.y < bottom );
  }

  /**
   * 自身を円形として、点と衝突しているかを判定
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  hitTestCircle(x, y) {
    // 円判定
    var p = this.globalToLocal(new Vector2(x, y));
    if (((p.x)*(p.x)+(p.y)*(p.y)) < (this.radius*this.radius)) {
        return true;
    }
    return false;
  }

  /**
   * 要素と衝突しているかを判定
   * @param {Object2D} elm
   * @returns {boolean}
   */
  hitTestElement(elm) {
    var rect0 = this;
    var rect1 = elm;
    return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
           (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
  }

  /**
   * 渡された座標をローカル座標に変換して返す
   * @param {import("../geom/vector2").PrimitiveVector2} p 値は変更しません
   * @returns {Vector2} 新規作成されたローカル座標オブジェクト
   */
  globalToLocal(p) {
    var matrix = this._worldMatrix.clone();
    matrix.invert();
    // matrix.transpose();

    var temp = matrix.multiplyVector2(p);

    return temp;
  }

  /**
   * インタラクション可能かどうかを変更  
   * 同時にboundingTypeも変更可能
   * @param {boolean} flag
   * @param {Object2DBoundingType} [type]
   * @returns {this}
   */
  setInteractive(flag, type) {
    this.interactive = flag;
    if (type) {
      this.boundingType = type;
    }

    return this;
  }

  /**
   * X 座標値をセット
   * @param {Number} x
   * @returns {this}
   */
  setX(x) {
    this.position.x = x;
    return this;
  }
  
  /**
   * Y 座標値をセット
   * @param {Number} y
   * @returns {this}
   */
  setY(y) {
    this.position.y = y;
    return this;
  }
  
  /**
   * XY 座標をセット
   * @param {Number} x
   * @param {Number} y
   * @returns {this}
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    return this;
  }

  /**
   * 回転をセット
   * @param {Number} rotation
   * @returns {this}
   */
  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  /**
   * スケールをセット
   * @param {Number} x
   * @param {Number} [y] 省略した場合、xパラメータ値が適用されます
   * @returns {this}
   */
  setScale(x, y) {
    this.scale.x = x;
    if (arguments.length <= 1) {
        this.scale.y = x;
    } else {
        this.scale.y = y;
    }
    return this;
  }
  
  /**
   * 基準点をセット
   * @param {Number} x
   * @param {Number} y
   * @returns {this}
   */
  setOrigin(x, y) {
    this.origin.x = x;
    this.origin.y = y;
    return this;
  }
  
  /**
   * 幅をセット
   * @param {Number} width
   * @returns {this}
   */
  setWidth(width) {
    this.width = width;
    return this;
  }
  
  /**
   * 高さをセット
   * @param {Number} height
   * @returns {this}
   */
  setHeight(height) {
    this.height = height;
    return this;
  }
  
  /**
   * サイズ(幅, 高さ)をセット
   * @param {Number} width
   * @param {Number} height
   * @returns {this}
   */
  setSize(width, height) {
    this.width  = width;
    this.height = height;
    return this;
  }

  /**
   * @param {Object2DBoundingType} type
   * @returns {this}
   */
  setBoundingType(type) {
    this.boundingType = type;
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  moveTo(x, y) {
    this.position.x = x;
    this.position.y = y;
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  moveBy(x, y) {
    this.position.x += x;
    this.position.y += y;
    return this;
  }

  /**
   * グローバル行列を計算
   * @returns {this}
   */
  _calcWorldMatrix() {
    if (!this.parent) return ;

    // cache check
    if (this.rotation != this._cachedRotation) {
      this._cachedRotation = this.rotation;

      var r = this.rotation*(Math.PI/180);
      this._sr = Math.sin(r);
      this._cr = Math.cos(r);
    }

    var local = this._matrix;
    var parent = /** @type {Object2D} */(this.parent)._worldMatrix || Matrix33.IDENTITY;
    var world = this._worldMatrix;

    // ローカルの行列を計算
    local.m00 = this._cr * this.scale.x;
    local.m01 =-this._sr * this.scale.y;
    local.m10 = this._sr * this.scale.x;
    local.m11 = this._cr * this.scale.y;
    local.m02 = this.position.x;
    local.m12 = this.position.y;

    // cache
    var a00 = local.m00; var a01 = local.m01; var a02 = local.m02;
    var a10 = local.m10; var a11 = local.m11; var a12 = local.m12;
    var b00 = parent.m00; var b01 = parent.m01; var b02 = parent.m02;
    var b10 = parent.m10; var b11 = parent.m11; var b12 = parent.m12;

    // 親の行列と掛け合わせる
    world.m00 = b00 * a00 + b01 * a10;
    world.m01 = b00 * a01 + b01 * a11;
    world.m02 = b00 * a02 + b01 * a12 + b02;

    world.m10 = b10 * a00 + b11 * a10;
    world.m11 = b10 * a01 + b11 * a11;
    world.m12 = b10 * a02 + b11 * a12 + b12;

    return this;
  }

  /**
   * @property    x
   * x座標値
   */
  get x()   { return this.position.x; }
  set x(v)  { this.position.x = v; }

  /**
   * @property    y
   * y座標値
   */
  get y()   { return this.position.y; }
  set y(v)  { this.position.y = v; }

  /**
   * @property    originX
   * x座標値
   */
  get originX()   { return this.origin.x; }
  set originX(v)  { this.origin.x = v; }

  /**
   * @property    originY
   * y座標値
   */
  get originY()   { return this.origin.y; }
  set originY(v)  { this.origin.y = v; }

  /**
   * @property    scaleX
   * スケールX値
   */
  get scaleX()   { return this.scale.x; }
  set scaleX(v)  { this.scale.x = v; }
  
  /**
   * @property    scaleY
   * スケールY値
   */
  get scaleY()   { return this.scale.y; }
  set scaleY(v)  { this.scale.y = v; }
  
  /**
   * @property    width
   * width
   */
  get width()   {
    return (this.boundingType === 'rect') ?
      this._width : this._diameter;
  }
  set width(v)  { this._width = v; }

  /**
   * @property    height
   * height
   */
  get height()   {
    return (this.boundingType === 'rect') ?
      this._height : this._diameter;
  }
  set height(v)  { this._height = v; }

  /**
   * @property    radius
   * 半径
   */
  get radius()   {
    return (this.boundingType === 'rect') ?
      (this.width+this.height)/4 : this._radius;
  }
  set radius(v)  {
    this._radius = v;
    this._diameter = v*2;
  }
  
  /**
   * @property    top
   * 左
   */
  get top()   { return this.y - this.height*this.originY; }
  set top(v)  { this.y = v + this.height*this.originY; }

  /**
   * @property    right
   * 左
   */
  get right()   { return this.x + this.width*(1-this.originX); }
  set right(v)  { this.x = v - this.width*(1-this.originX); }

  /**
   * @property    bottom
   * 左
   */
  get bottom()   { return this.y + this.height*(1-this.originY); }
  set bottom(v)  { this.y = v - this.height*(1-this.originY); }

  /**
   * @property    left
   * 左
   */
  get left()   { return this.x - this.width*this.originX; }
  set left(v)  { this.x = v + this.width*this.originX; }

  /**
   * @property    centerX
   * centerX
   */
  get centerX()   { return this.x + this.width/2 - this.width*this.originX; }
  // set centerX(v)  {
  //   // TODO: どうしようかな??
  // }

  /**
   * @property    centerY
   * centerY
   */
  get centerY()   { return this.y + this.height/2 - this.height*this.originY; }
  // set centerY(v)  {
  //   // TODO: どうしようかな??
  // }
}

/**
 * @type {Object2DOptions}
 * @static
 */
Object2D.defaults = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  originX: 0.5,
  originY: 0.5,
  width: 64,
  height: 64,
  radius: 32,
  boundingType: 'rect',
}