// import { first, last, clear } from "../core/array"
import { clamp } from "../core/math"
import { EventDispatcher } from "../util/eventdispatcher"
import { Vector2 } from "../geom/vector2"

/**
 * @class phina.input.Input
 * @extends phina.util.EventDispatcher
 */
export class Input extends EventDispatcher {

  // /** domElement */
  // domElement = null

  constructor(domElement) {
    super();

    this.domElement = domElement || window.document;

    this.position = new Vector2(0, 0);
    this.startPosition = new Vector2(0, 0);
    this.deltaPosition = new Vector2(0, 0);
    this.prevPosition = new Vector2(0, 0);
    this._tempPosition = new Vector2(0, 0);

    this.maxCacheNum = Input.defaults.maxCacheNum;
    this.minDistance = Input.defaults.minDistance;
    this.maxDistance = Input.defaults.maxDistance;
    this.cachePositions = [];
    this.flickVelocity = new Vector2(0, 0);

    this.flags = 0;
  }

  update() {
    this.last = this.now;
    this.now = this.flags;
    this.start = (this.now ^ this.last) & this.now;
    this.end   = (this.now ^ this.last) & this.last;

    // 変化値を更新
    this.deltaPosition.x = this._tempPosition.x - this.position.x;
    this.deltaPosition.y = this._tempPosition.y - this.position.y;

    if (this.deltaPosition.x === 0 && this.deltaPosition.y === 0) {
      this._moveFlag = false;
    }
    else {
      this._moveFlag = true;
    }

    if (this.start) {
      this.startPosition.set(this.position.x, this.position.y);
    }

    // 前回の座標を更新
    this.prevPosition.set(this.position.x, this.position.y);

    // 現在の位置を更新
    this.position.set(this._tempPosition.x, this._tempPosition.y);

    if (this.cachePositions.length > this.maxCacheNum) {
      this.cachePositions.shift();
    }
    this.cachePositions.push(this.position.clone());
  }

  _start(x, y, flag) {
    flag = (flag !== undefined) ? flag : 1;
    // console.log('start', x, y);
    this._move(x, y);

    this.flags |= flag;

    var x = this._tempPosition.x;
    var y = this._tempPosition.y;
    this.position.set(x, y);
    this.prevPosition.set(x, y);

    this.flickVelocity.set(0, 0);
    // this.cachePositions.clear();
    this.cachePositions.length = 0;
  }

  _end(flag) {
    flag = (flag !== undefined) ? flag : 1;
    this.flags &= ~(flag);

    if (this.cachePositions.length < 2) return;

    // var first = this.cachePositions.first;
    // var last = this.cachePositions.last;
    var first = this.cachePositions[0];
    var last = this.cachePositions[this.cachePositions.length-1];

    var v = Vector2.sub(last, first);

    var len = v.length();

    if (len > this.minDistance) {
      // var normalLen = len.clamp(this.minDistance, this.maxDistance);
      var normalLen = clamp(len, this.minDistance, this.maxDistance);
      v.div(len).mul(normalLen);
      this.flickVelocity.set(v.x, v.y);
    }

    // this.cachePositions.clear();
    this.cachePositions.length = 0;
  }

  // スケールを考慮
  _move(x, y) {
    this._tempPosition.x = x;
    this._tempPosition.y = y;

    // adjust scale
    var elm = this.domElement;
    var rect = elm.getBoundingClientRect();
    if (rect.width) {
      this._tempPosition.x *= elm.width / rect.width;
    }
    if (rect.height) {
      this._tempPosition.y *= elm.height / rect.height;
    }
  }

  /**
   * @property    x
   * x座標値
   */
  get x() { return this.position.x; }
  set x(v) { this.position.x = v; }

  /**
   * @property    y
   * y座標値
   */
  get y() { return this.position.y; }
  set y(v) { this.position.y = v; }

  /**
   * @property    dx
   * dx値
   */
  get dx() { return this.deltaPosition.x; }
  set dx(v) { this.deltaPosition.x = v; }

  /**
   * @property    dy
   * dy値
   */
  get dy() { return this.deltaPosition.y; }
  set dy(v) { this.deltaPosition.y = v; }

  /**
   * @property    fx
   * fx値
   */
  get fx() { return this.flickVelocity.x; }
  set fx(v) { this.flickVelocity.x = v; }

  /**
   * @property    fy
   * fy値
   */
  get fy() { return this.flickVelocity.y; }
  set fy(v) { this.flickVelocity.y = v; }

}

Input.defaults = {
  maxCacheNum: 3,
  minDistance: 10,
  maxDistance: 100,
}
