import { $safe, $watch } from "../core/object";
import { Vector2 } from "../geom/vector2";
import { PlainElement } from "./plainelement";

/**
 * Shapeクラスオプション
 * @typedef {{
 *   padding?: number,
 *   backgroundColor?: import('../graphics/canvas').CanvasStyle,
 *   fill?: import('../graphics/canvas').CanvasStyle | false,
 *   stroke?: import('../graphics/canvas').CanvasStyle | false,
 *   strokeWidth?: number,
 *   lineCap?: CanvasLineCap,
 *   lineJoin?: CanvasLineJoin,
 *   shadow?: string | false,
 *   shadowBlur?: number,
 * } & import('../display/displayelement').DisplayElementOptions } ShapeOptions
 */

/**
 * @class phina.display.Shape
 * _extends phina.display.PlainElement
 */
export class Shape extends PlainElement {

  /**
   * @param {ShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.Shape.defaults);
    options = $safe.call({}, options||{}, Shape.defaults)

    super(options);

    this.padding = options.padding;

    this.backgroundColor = options.backgroundColor;
    this.fill = options.fill;
    this.stroke = options.stroke;
    this.strokeWidth = options.strokeWidth;
    this.lineCap = options.lineCap;
    this.lineJoin = options.lineJoin;

    this.shadow = options.shadow;
    this.shadowBlur = options.shadowBlur;

    this.watchDraw = true;
    this._dirtyDraw = true;

    /** @this Shape */
    var checkRender = function() {
      // render
      if (this.watchDraw && this._dirtyDraw === true) {
        this.render(this.canvas);
        this._dirtyDraw = false;
      }
    };

    this.on('enterframe', checkRender);
    this.on('added', checkRender);
  }

  calcCanvasWidth() {
    return this.width + this.padding*2;
  }

  calcCanvasHeight() {
    return this.height + this.padding*2;
  }

  calcCanvasSize () {
    return {
      width: this.calcCanvasWidth(),
      height: this.calcCanvasHeight(),
    };
  }

  isStrokable() {
    return this.stroke && 0 < this.strokeWidth;
  }

  /**
   * @virtual
   * @param  {import('../graphics/canvas').Canvas} _canvas 
   * @returns {any}
   */
  prerender(_canvas) {

  }

  /**
   * @virtual
   * @param  {import('../graphics/canvas').Canvas} _canvas 
   * @returns {any}
   */
  postrender(_canvas) {

  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   * @returns {void}
   */
  renderFill(canvas) {
    canvas.fill();
  }

  /**
   * @param {import('../graphics/canvas').Canvas} canvas 
   * @returns {void}
   */
  renderStroke(canvas) {
    canvas.stroke();
  }

  /**
   * @param {import('../graphics/canvas').Canvas} canvas 
   * @returns {this}
   */
  render(canvas) {
    var context = canvas.context;
    // リサイズ
    var size = this.calcCanvasSize();
    canvas.setSize(size.width, size.height);
    // クリアカラー
    canvas.clearColor(this.backgroundColor);
    // 中心に座標を移動
    canvas.transformCenter();

    // 描画前処理
    this.prerender(this.canvas);

    // ストローク描画
    if (this.isStrokable()) {
      context.strokeStyle = /** @type {import('../graphics/canvas').CanvasStyle} */(this.stroke);
      context.lineWidth = this.strokeWidth;
      context.lineCap = this.lineCap;
      context.lineJoin = this.lineJoin;
      context.shadowBlur = 0;
      this.renderStroke(canvas);
    }

    // 塗りつぶし描画
    if (this.fill) {
      context.fillStyle = this.fill;

      // shadow の on/off
      if (this.shadow) {
        context.shadowColor = this.shadow;
        context.shadowBlur = this.shadowBlur;
      }
      else {
        context.shadowBlur = 0;
      }

      this.renderFill(canvas);
    }

    // 描画後処理
    this.postrender(this.canvas);

    return this;
  }

  /**
   * 指定プロパティを監視し、変更があったらダーティフラグを立てて再描画を促す
   * @param {string} key
   * @returns {void}
   */
  static watchRenderProperty(key) {
    // this.prototype.$watch(key, function(newVal, oldVal) {
    $watch.call(this.prototype, key, function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this._dirtyDraw = true;
      }
    });
  }

  /**
   * Shape.watchRenderPropertyをまとめて行う
   * @param {string[]} keys
   * @returns {void}
   */
  static watchRenderProperties(keys) {
    var watchRenderProperty = this.watchRenderProperty || Shape.watchRenderProperty;
    keys.forEach(function(key) {
      watchRenderProperty.call(this, key);
    }, this);
  }

}

/**
 * @type {ShapeOptions}
 * @static
 */
Shape.defaults = {
  width: 64,
  height: 64,
  padding: 8,

  backgroundColor: '#aaa',
  fill: '#00a',
  stroke: '#aaa',
  strokeWidth: 4,
  lineCap: 'round',
  lineJoin: 'round',

  shadow: false,
  shadowBlur: 4,
}

// _defined
Shape.watchRenderProperties([
  'width',
  'height',
  'radius',
  'padding',
  'backgroundColor',
  'fill',
  'stroke',
  'strokeWidth',
  'lineCap',
  'lineJoin',
  'shadow',
  'shadowBlur',
]);


/**
 * @typedef {{
 *   cornerRadius?: number
 * } & ShapeOptions } RectangleShapeOptions
 */

  /**
 * @class phina.display.RectangleShape
 * _extends phina.display.Shape
 * 矩形描画クラス
 */
export class RectangleShape extends Shape {

  /**
   * @param {RectangleShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.RectangleShape.defaults);
    options = $safe.call({}, options||{}, RectangleShape.defaults)

    super(options);

    this.cornerRadius = options.cornerRadius;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

}

/**
 * @type {RectangleShapeOptions}
 * @static
 */
RectangleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'blue',
  stroke: '#aaa',
  strokeWidth: 4,
  cornerRadius: 0,
}

// _defined
Shape.watchRenderProperty.call(RectangleShape, 'cornerRadius');


/**
 * @typedef {{
 *   radius?: number
 * } & ShapeOptions } CircleShapeOptions
 */

/**
 * @class phina.display.CircleShape
 * _extends phina.display.Shape
 */
export class CircleShape extends Shape {

  /**
   * @param {CircleShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.CircleShape.defaults);
    options = $safe.call({}, options||{}, CircleShape.defaults)

    super(options);

    this.setBoundingType('circle');
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.circle(0, 0, this.radius);
  }

}

/**
 * @type {CircleShapeOptions}
 * @static
 */
CircleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'red',
  stroke: '#aaa',
  strokeWidth: 4,
  radius: 32,
}


/**
 * @class phina.display.TriangleShape
 * _extends phina.display.Shape
 */
export class TriangleShape extends Shape {

  /**
   * @param {CircleShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.TriangleShape.defaults);
    options = $safe.call({}, options||{}, TriangleShape.defaults)

    super(options);

    this.setBoundingType('circle');
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, 3);
  }

}

/**
 * @type {CircleShapeOptions}
 * @static
 */
TriangleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'green',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
}


/**
 * @typedef {{
 *   sides?: number,
 * } & CircleShapeOptions } PolygonShapeOptions
 */
/**
 * @typedef {{
 *   sideIndent?: number,
 * } & PolygonShapeOptions } StarShapeOptions
 */

/**
 * @class phina.display.StarShape
 * _extends phina.display.Shape
 */
export class StarShape extends Shape {

  /**
   * @param {StarShapeOptions} [options] 
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.StarShape.defaults);
    options = $safe.call({}, options||{}, StarShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
    this.sideIndent = options.sideIndent;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.star(0, 0, this.radius, this.sides, this.sideIndent);
  }

}

/**
 * @type {StarShapeOptions}
 * @static
 */
StarShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'yellow',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  sides: 5,
  sideIndent: 0.38,
}

// _defined
Shape.watchRenderProperty.call(StarShape, 'sides');
Shape.watchRenderProperty.call(StarShape, 'sideIndent');


/**
 * @class phina.display.PolygonShape
 * _extends phina.display.Shape
 */
export class PolygonShape extends Shape {

  /**
   * @param {PolygonShapeOptions} [options] 
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PolygonShape.defaults);
    options = $safe.call({}, options||{}, PolygonShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, this.sides);
  }

}

/**
 * @type {PolygonShapeOptions}
 * @static
 */
PolygonShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'cyan',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  sides: 5,
}

// defined
Shape.watchRenderProperty.call(PolygonShape, 'sides');


/**
 * @typedef {{
 *   cornerAngle?: number,
 * } & CircleShapeOptions } HeartShapeOptions
 */

/**
 * @class phina.display.HeartShape
 * _extends phina.display.Shape
 */
export class HeartShape extends Shape {

  /**
   * @param {HeartShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.HeartShape.defaults);
    options = $safe.call({}, options||{}, HeartShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.cornerAngle = options.cornerAngle;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    canvas.heart(0, 0, this.radius, this.cornerAngle);
  }

}

/**
 * @type {HeartShapeOptions}
 * @static
 */
HeartShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'pink',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  cornerAngle: 45,
}

// defined
Shape.watchRenderProperty.call(HeartShape, 'cornerAngle');


/**
 * @typedef {{
 *   paths?: Vector2[]
 * } & ShapeOptions } PathShapeOptions
 */

/**
 * @class phina.display.PathShape
 * _extends phina.display.Shape
 */
export class PathShape extends Shape {
  // paths: null,

  /**
   * @param {PathShapeOptions} [options]
   */
  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PathShape.defaults);
    options = $safe.call({}, options||{}, PathShape.defaults)

    super(options);
    this.paths = options.paths || [];
    this.lineJoin = options.lineJoin;
    this.lineCap = options.lineCap;
  }

  /**
   * @param {Vector2[]} paths
   * @returns {this}
   */
  setPaths (paths) {
    this.paths = paths;
    this._dirtyDraw = true;
    return this;
  }

  /**
   * @returns {this}
   */
  clear () {
    this.paths.length = 0;
    this._dirtyDraw = true;
    return this;
  }

  /**
   * @param {Vector2[]} paths 
   * @returns {this}
   */
  addPaths (paths) {
    [].push.apply(this.paths, paths);
    this._dirtyDraw = true;
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  addPath (x, y) {
    this.paths.push(new Vector2(x, y));
    this._dirtyDraw = true;
    return this;
  }

  /**
   * @param {string | number} i
   * @returns {Vector2}
   */
  getPath (i) {
    return this.paths[i];
  }

  /**
   * @returns {Vector2[]} paths 
   */
  getPaths () {
    return this.paths;
  }

  /**
   * @param {string | number} i
   * @param {number} x
   * @param {number} y
   */
  changePath (i, x, y) {
    this.paths[i].set(x, y);
    this._dirtyDraw = true;
    return this;
  }

  /**
   * @returns {{width: number, height: number}}
   */
  calcCanvasSize () {
    var paths = this.paths;
    if (paths.length === 0) {
      return {
        width: this.padding * 2,
        height:this.padding * 2,
      };
    }
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;

    for (var i = 0, len = paths.length; i < len; ++i) {
      var path = paths[i];
      if (maxX < path.x) { maxX = path.x; }
      if (minX > path.x) { minX = path.x; }
      if (maxY < path.y) { maxY = path.y; }
      if (minY > path.y) { minY = path.y; }
    }
    return {
      width: Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + this.padding * 2,
      height: Math.max(Math.abs(maxY), Math.abs(minY)) * 2 + this.padding * 2,
    };
  }

  /**
   * @returns {number}
   */
  calcCanvasWidth () {
    return this.calcCanvasSize().width;
  }

  /**
   * @returns {number}
   */
  calcCanvasHeight () {
    return this.calcCanvasSize().height;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender (canvas) {
    var paths = this.paths;
    if (paths.length > 1) {
      var c = canvas.context;
      var p = paths[0];
      c.beginPath();
      c.moveTo(p.x, p.y);
      for (var i = 1, len = paths.length; i < len; ++i) {
        p = paths[i];
        c.lineTo(p.x, p.y);
      }
    }
  }

}

/**
 * @type {PathShapeOptions}
 * @static
 */
PathShape.defaults = {
  fill: false,
  backgroundColor: 'transparent',
}