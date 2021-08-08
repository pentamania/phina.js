/**
 * @typedef {{
 *  width?: number;
 *  columns?: number;
 *  loop?: boolean;
 *  offset?: number;
 * }} GridOptions
 */

/**
 * @class phina.util.Grid
 */
export class Grid {

  /**
   * @constructor
   * @param {GridOptions | number} _optionsOrWidth
   * @param {number} [_col]
   * @param {boolean} [_loop]
   * @param {number} [_offset]
   */
  constructor(_optionsOrWidth, _col, _loop, _offset) {
    var width, columns, loop, offset;
    if (typeof arguments[0] === 'object') {
      /** @type {GridOptions} */
      var param = arguments[0];
      width = param.width || 640;
      columns = param.columns || 12;
      loop = param.loop || false;
      offset = param.offset || 0;
    }
    else {
      width   = arguments[0] || 640;
      columns = arguments[1] || 12;
      loop    = arguments[2] || false;
      offset = arguments[3] || 0;
    }

    /** @type {number} 幅 */
    this.width = width;

    /** @type {number} 列数 */
    this.columns = columns;

    /** @type {boolean} span指定時にループするかどうか */
    this.loop = loop;

    /** @type {number} オフセット値 */
    this.offset = offset;

    /** @type {number} グリッド単位値 */
    this.unitWidth = this.width/this.columns;
  }

  /**
   * スパン指定で値を取得(負数もok)
   * @param {number} index
   * @returns {number}
   */
  span(index) {
    if (this.loop) {
      index += this.columns;
      index %= this.columns;
    }
    return this.unitWidth * index + this.offset;
  }

  /**
   * グリッド単位を返す
   * @returns {number}
   */
  unit() {
    return this.unitWidth;
  }

  /**
   * @param {number} [offset] 中心からのずれを単位数で指定
   * @returns {number}
   */
  center(offset) {
    var index = offset || 0;
    return (this.width/2) + (this.unitWidth * index);
  }

}