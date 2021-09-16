import { $safe } from "../core/object";
import { Element as PhinaElement } from "./element";
import { Vector2 } from "../geom/vector2"
import { Matrix33 } from "../geom/matrix33";
import { Collision } from "../geom/collision";
import { Rect } from "../geom/rect";
import { Circle } from "../geom/circle";

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
 * _extends phina.app.Element
 * 
 * 位置・回転・スケールおよびそれらの計算処理など
 * 2D描画に必須のプロパティとメソッド、
 * および各種当たり判定処理用メソッドを備えたクラス
 * 
 * いわゆる抽象クラスのため、直接使うことは稀
 * 通常は拡張元として利用する
 */
export class Object2D extends PhinaElement {
  /**
   * @param {Object2DOptions} [options]
   */
  constructor(options) {
    super()

    // options = ({}).$safe(options, phina.app.Object2D.defaults);

    /**
     * 足りないパラメータをデフォルト値({@link Object2D.defaults})で補ったoptions
     * @type {Required<Object2DOptions>}
     */
    const optionFulfilled = $safe.call({}, options, Object2D.defaults);

    /**
     * 位置
     * 
     * x, yアクセサからも取得・設定可能
     * 
     * @public
     * @type {Vector2}
     */
    this.position = new Vector2(optionFulfilled.x, optionFulfilled.y);

    /**
     * スケール
     * 
     * scaleX, scaleYアクセサから取得・設定可能
     * 
     * @public
     * @type {Vector2}
     */
    this.scale = new Vector2(optionFulfilled.scaleX, optionFulfilled.scaleY);

    /**
     * 回転角度
     * 度数（degree）単位で指定する
     * 
     * @type {number} */
    this.rotation = optionFulfilled.rotation || 0;

    /**
     * オブジェクトの基準（原点）位置
     * 
     * 描画位置、当たり判定処理などに影響する
     * またrotationの回転軸でもある
     * 
     * 例えばx:0, y:0とすると左上が原点、
     * x:1.0, y:1.0とすると右下が原点となるように振る舞う
     * 
     * originX, originYアクセサから取得・設定可能
     * 
     * @type {Vector2} */
    this.origin = new Vector2(optionFulfilled.originX, optionFulfilled.originY);

    /**
     * ローカル変換行列
     * 
     * @private
     * @type {Matrix33}
     */
    this._matrix = new Matrix33().identity();

    /**
     * ワールド変換行列
     * 
     * @public CanvasRendererなどで内部使用
     * @type {Matrix33 | null}
     */
    this._worldMatrix = new Matrix33().identity();

    /**
     * 行列計算用キャッシュ値
     * 
     * @private
     * @type {number}
     */
    this._cachedRotation;

    /**
     * 内部行列計算用キャッシュ値（rotation用）
     * 
     * @private
     * @type {number}
     */
    this._sr;

    /**
     * 内部行列計算用キャッシュ値（rotation用）
     * 
     * @private
     * @type {number}
     */
    this._cr;

    /**
     * ユーザーインタラクションを有効化するかどうか
     * 
     * trueにすることでユーザー入力（mouse/touch）に応じて
     * オブジェクトが`point~`イベントを発火するようになる
     * 
     * ただしその分、判定のための処理負荷がかかるため、
     * 不要であればfalseにしておく
     * 
     * 発火するイベントについては以下を参照のこと
     * @see https://qiita.com/pentamania/items/50b655724916c503ac8c#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E7%99%BA%E7%81%AB%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0
     * 
     * @example
     * const obj = new Object2D();
     * obj.interactive = true;
     * 
     * obj.on('pointover', ()=> console.log("mouse/touch over"))
     * obj.on('pointstart', ()=> console.log("mousedown or touchstart"))
     * obj.on('pointend', ()=> console.log("mouseup or touchend"))
     * 
     * @default false
     * @public
     * @type {boolean}
     */
    this.interactive = false;

    /**
     * Interactiveクラスでのフラグ処理用
     * 
     * @type {{ [id: number]: boolean }}
     */
    this._overFlags = {};

    /**
     * Interactiveクラスでのフラグ処理用
     * 
     * @type {{ [id: number]: boolean }}
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
     * 
     * @private
     * @type {number}
     */
    this._radius

    /**
     * 直径: boundingTypeがcircleの際にwidth/height値として使用  
     * radiusアクセサsetの際に更新
     * 
     * @private
     * @type {number}
     */
    this._diameter

    this.width = optionFulfilled.width;
    this.height = optionFulfilled.height;
    this.radius = optionFulfilled.radius;

    /**
     * 当たり判定範囲の種別
     * 
     * @public
     * @type {Object2DBoundingType}
     */
    this.boundingType = optionFulfilled.boundingType;

    /** @type {Object2D|PhinaElement} */
    this.parent;
    
    /**
     * @protected
     * @type {Rect|Circle|undefined}
     */
    this._collider;
  }

  /**
   * 当たり判定用のRectもしくはCircleをセットアップする。
   * radiusもしくはwidthどちらかは必ず指定する。
   * 
   * @param {Object} params
   * @param {Number} [params.x=0] - 相対位置x
   * @param {Number} [params.y=0] - 相対位置y
   * @param {Number} [params.radius] - 円形にする場合に指定：0は無効
   * @param {Number} [params.width] - 矩形にする場合に指定：0は無効、radius優先
   * @param {Number} [params.height] - 矩形にする場合に指定：0は無効、指定なければwidthの値が適用される
   * @returns {this}
   */
  setCollider(params) {
    params = $safe.call({}, params, {
      x: 0,
      y: 0,
    });
    if (params.radius) {
      this._collider = new Circle(params.x, params.y, params.radius);
    } else if (params.width) {
      params.height = params.height || params.width;
      this._collider = new Rect(params.x, params.y, params.width, params.height);
    }
    return this;
  }

  /**
   * colliderのグローバル領域を取得する
   * TODO: Rect/Circleは毎回作りなおさず、キャッシュする？
   *
   * @returns {Rect|Circle|null}
   */
  getGlobalCollider() {
    if (!this._collider) return null;

    if (this._collider instanceof Rect) {
      return new Rect(
        this.colliderGlobalX,
        this.colliderGlobalY,
        this._collider.width,
        this._collider.height
      );
    } else {
      return new Circle(
        this.colliderGlobalX,
        this.colliderGlobalY,
        this._collider.radius
      );
    }
  }

  /**
   * 点と衝突しているかを判定
   * boundingTypeによって判定範囲が変わる
   * 
   * @param {Number} x
   * @param {Number} y
   * @returns {boolean}
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
   * 対象の位置が判定範囲内にあるかどうかを判定
   * @param {any} elm
   */
  hitTestElementPosition(elm) {
    var col = this.getGlobalCollider();
    if (col) {
      return col.contains(elm.globalX, elm.globalY);
    } else {
      return this.hitTest(elm.globalX, elm.globalY);
    }
  }

  /**
   * 自身を矩形として、点と衝突しているかを判定
   * 
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
   * 
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
   * 
   * @param {Object2D} elm
   * @returns {boolean}
   */
  hitTestElement(elm) {
    if (this.collider && elm.collider) {
      var thisCol = this.getGlobalCollider();
      var targetCol = elm.getGlobalCollider();

      if (thisCol instanceof Rect) {
        if (targetCol instanceof Rect) {
          // 矩形 vs 矩形
          return Collision.testRectRect(thisCol, targetCol);
        } else {
          // 矩形 vs 円形
          return Collision.testCircleRect(targetCol, thisCol);
        }
      } else {
        if (targetCol instanceof Rect) {
          // 円形 vs 矩形
          return Collision.testCircleRect(thisCol, targetCol);
        } else {
          // 円形 vs 円形
          return Collision.testCircleCircle(thisCol, targetCol);
        }
      }
    } else {
      // 従来の処理
      var rect0 = this;
      var rect1 = elm;
      return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
             (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
    }
  }

  /**
   * 渡された座標をローカル座標に変換して返す
   * 
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
   * 
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
   * 
   * @param {Number} x
   * @returns {this}
   */
  setX(x) {
    this.position.x = x;
    return this;
  }
  
  /**
   * Y 座標値をセット
   * 
   * @param {Number} y
   * @returns {this}
   */
  setY(y) {
    this.position.y = y;
    return this;
  }
  
  /**
   * XY 座標をセット
   * 
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
   * 回転角度をセット
   * 
   * @param {Number} rotation
   * @returns {this}
   */
  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  /**
   * スケールをセット
   * 
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
   * {@link Object2D.origin} を参照のこと
   * 
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
   * 
   * @param {Number} width
   * @returns {this}
   */
  setWidth(width) {
    this.width = width;
    return this;
  }
  
  /**
   * 高さをセット
   * 
   * @param {Number} height
   * @returns {this}
   */
  setHeight(height) {
    this.height = height;
    return this;
  }
  
  /**
   * サイズ(幅, 高さ)をセット
   * 
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
   * 判定範囲種類をセット
   * 
   * @param {Object2DBoundingType} type
   * @returns {this}
   */
  setBoundingType(type) {
    this.boundingType = type;
    return this;
  }

  /**
   * 指定座標へ移動
   * 
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
   * 指定値だけ相対移動
   * 
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
   * グローバル（ワールド）行列を再計算
   * 
   * @returns {void|this}
   * parentプロパティが存在しないときは何もせず、何も返さない
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
   * 基準点のx値
   */
  get originX()   { return this.origin.x; }
  set originX(v)  { this.origin.x = v; }

  /**
   * @property    originY
   * 基準点のy値
   */
  get originY()   { return this.origin.y; }
  set originY(v)  { this.origin.y = v; }

  /**
   * @property    scaleX
   * スケールx値
   */
  get scaleX()   { return this.scale.x; }
  set scaleX(v)  { this.scale.x = v; }
  
  /**
   * @property    scaleY
   * スケールy値
   */
  get scaleY()   { return this.scale.y; }
  set scaleY(v)  { this.scale.y = v; }
  
  /**
   * @property    width
   * 幅。矩形タイプの場合は内部width値、円タイプの場合は直径値を返す
   * 円タイプの場合、{@link Object2D.radius}の設定値が反映される
   */
  get width()   {
    return (this.boundingType === 'rect') ?
      this._width : this._diameter;
  }
  set width(v)  { this._width = v; }

  /**
   * @property    height
   * 高さ。矩形タイプの場合は内部height値、円タイプの場合は直径値を返す
   * 円タイプの場合、{@link Object2D.radius}の設定値が反映される
   */
  get height()   {
    return (this.boundingType === 'rect') ?
      this._height : this._diameter;
  }
  set height(v)  { this._height = v; }

  /**
   * @property    radius
   * 半径値
   * 
   * - 円タイプの場合は内部半径値を返す
   * - 矩形タイプの場合は内部widthとheight値を合算して4で割った値を返す
   * 
   * セッターでは同時に直径値も更新される
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
   * 上辺y座標
   */
  get top()   { return this.y - this.height*this.originY; }
  set top(v)  { this.y = v + this.height*this.originY; }

  /**
   * @property    right
   * 右辺x座標
   */
  get right()   { return this.x + this.width*(1-this.originX); }
  set right(v)  { this.x = v - this.width*(1-this.originX); }

  /**
   * @property    bottom
   * 下辺y座標
   */
  get bottom()   { return this.y + this.height*(1-this.originY); }
  set bottom(v)  { this.y = v - this.height*(1-this.originY); }

  /**
   * @property    left
   * 左辺x座標
   */
  get left()   { return this.x - this.width*this.originX; }
  set left(v)  { this.x = v + this.width*this.originX; }

  /**
   * @property    centerX
   * 中心x座標。getterのみ
   */
  get centerX()   { return this.x + this.width/2 - this.width*this.originX; }
  // set centerX(v)  {
  //   // TODO: どうしようかな??
  // }

  /**
   * @property    centerY
   * 中心y座標。getterのみ
   */
  get centerY()   { return this.y + this.height/2 - this.height*this.originY; }
  // set centerY(v)  {
  //   // TODO: どうしようかな??
  // }

  /**
   * Global position x
   */
  get globalX() {
    return this._worldMatrix.m02;
  }

  /**
   * Global position y
   */
  get globalY() {
    return this._worldMatrix.m12;
  }

  get collider() {
    // return this._collider.clone();
    return this._collider;
  }
  set collider(v) {
    this.setCollider(v);
  }

  /**
   * Global position x of the collider
   * @returns {number}
   */
  get colliderGlobalX() {
    if (this._collider instanceof Rect) {
      return this.globalX + this._collider.x - this._collider.width * this.originX;
    } else {
      return this.globalX + this._collider.x;
    }
  }

  /**
   * Global position y of the collider
   * @returns {number}
   */
  get colliderGlobalY() {
    if (this._collider instanceof Rect) {
      return this.globalY + this._collider.y - this._collider.height * this.originY;
    } else {
      return this.globalY + this._collider.y;
    }
  }

  /**
   * Type of the collider
   * @returns {Object2DBoundingType}
   */
  get colliderType() {
    // if (!this._collider) return null;
    if (!this._collider) return "none";
    if (this._collider instanceof Rect) {
      return 'rect';
    } else {
      return 'circle';
    }
  }
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