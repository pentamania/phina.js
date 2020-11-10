import { $safe, $watch } from "../core/object";
import { Vector2 } from "../geom/vector2";
import { PlainElement } from "./plainelement";

/**
 * @class phina.display.Shape
 * @extends phina.display.PlainElement
 */
export class Shape extends PlainElement {

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
   * @param  {phina.graphics.Canvas} canvas 
   * @return {any}
   */
  prerender(canvas) {

  }

  /**
   * @virtual
   * @param  {phina.graphics.Canvas} canvas 
   * @return {any}
   */
  postrender(canvas) {

  }

  renderFill(canvas) {
    canvas.fill();
  }

  renderStroke(canvas) {
    canvas.stroke();
  }

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
      context.strokeStyle = this.stroke;
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

  static watchRenderProperty(key) {
    // this.prototype.$watch(key, function(newVal, oldVal) {
    $watch.call(this.prototype, key, function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this._dirtyDraw = true;
      }
    });
  }

  static watchRenderProperties(keys) {
    var watchRenderProperty = this.watchRenderProperty || Shape.watchRenderProperty;
    keys.forEach(function(key) {
      watchRenderProperty.call(this, key);
    }, this);
  }

}

// static props
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
 * @class phina.display.RectangleShape
 * @extends phina.display.Shape
 */
export class RectangleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.RectangleShape.defaults);
    options = $safe.call({}, options||{}, RectangleShape.defaults)

    super(options);

    this.cornerRadius = options.cornerRadius;
  }

  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

}

// static props
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
 * @class phina.display.CircleShape
 * @extends phina.display.Shape
 */
export class CircleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.CircleShape.defaults);
    options = $safe.call({}, options||{}, CircleShape.defaults)

    super(options);

    this.setBoundingType('circle');
  }

  prerender(canvas) {
    canvas.circle(0, 0, this.radius);
  }

}

// static props
CircleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'red',
  stroke: '#aaa',
  strokeWidth: 4,
  radius: 32,
}


/**
 * @class phina.display.TriangleShape
 * @extends phina.display.Shape
 */
export class TriangleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.TriangleShape.defaults);
    options = $safe.call({}, options||{}, TriangleShape.defaults)

    super(options);

    this.setBoundingType('circle');
  }

  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, 3);
  }

}

// static props
TriangleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'green',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
}


/**
 * @class phina.display.StarShape
 * @extends phina.display.Shape
 */
export class StarShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.StarShape.defaults);
    options = $safe.call({}, options||{}, StarShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
    this.sideIndent = options.sideIndent;
  }

  prerender(canvas) {
    canvas.star(0, 0, this.radius, this.sides, this.sideIndent);
  }

}

// static props
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
 * @extends phina.display.Shape
 */
export class PolygonShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PolygonShape.defaults);
    options = $safe.call({}, options||{}, PolygonShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
  }

  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, this.sides);
  }

}

// static props
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
 * @class phina.display.HeartShape
 * @extends phina.display.Shape
 */
export class HeartShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.HeartShape.defaults);
    options = $safe.call({}, options||{}, HeartShape.defaults)

    super(options);

    this.setBoundingType('circle');
    this.cornerAngle = options.cornerAngle;
  }

  prerender(canvas) {
    canvas.heart(0, 0, this.radius, this.cornerAngle);
  }

}
// static props
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
 * @class phina.display.PathShape
 * @extends phina.display.Shape
 */
export class PathShape extends Shape {
  // paths: null,

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PathShape.defaults);
    options = $safe.call({}, options||{}, PathShape.defaults)

    super(options);
    this.paths = options.paths || [];
    this.lineJoin = options.lineJoin;
    this.lineCap = options.lineCap;
  }

  setPaths (paths) {
    this.paths = paths;
    this._dirtyDraw = true;
    return this;
  }

  clear () {
    this.paths.length = 0;
    this._dirtyDraw = true;
    return this;
  }

  addPaths (paths) {
    [].push.apply(this.paths, paths);
    this._dirtyDraw = true;
    return this;
  }

  addPath (x, y) {
    this.paths.push(new Vector2(x, y));
    this._dirtyDraw = true;
    return this;
  }

  getPath (i) {
    return this.paths[i];
  }

  getPaths () {
    return this.paths;
  }

  changePath (i, x, y) {
    this.paths[i].set(x, y);
    this._dirtyDraw = true;
    return this;
  }

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

  calcCanvasWidth () {
    return this.calcCanvasSize().width;
  }

  calcCanvasHeight () {
    return this.calcCanvasSize().height;
  }

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

// static props
PathShape.defaults = {
  fill: false,
  backgroundColor: 'transparent',
}