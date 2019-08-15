
/**
 * @class phina.util.Grid
 */
export class Grid {

  // /** 幅 */
  // width: 640,
  // /** 列数 */
  // columns: 12,
  // /** ループ */
  // loop: false,
  // /** オフセット値 */
  // offset: 0,

  /**
   * @constructor
   */
  constructor() {
    if (typeof arguments[0] === 'object') {
      var param = arguments[0];
      var width = param.width || 640;
      var columns = param.columns || 12;
      var loop = param.loop || false;
      var offset = param.offset || 0;
    }
    else {
      var width   = arguments[0] || 640;
      var columns = arguments[1] || 12;
      var loop    = arguments[2] || false;
      var offset = arguments[3] || 0;
    }

    this.width = width;
    this.columns = columns;
    this.loop = loop;
    this.offset = offset;
    this.unitWidth = this.width/this.columns;
  }

  // スパン指定で値を取得(負数もok)
  span(index) {
    if (this.loop) {
      index += this.columns;
      index %= this.columns;
    }
    return this.unitWidth * index + this.offset;
  }

  //
  unit() {
    return this.unitWidth;
  }

  center(offset) {
    var index = offset || 0;
    return (this.width/2) + (this.unitWidth * index);
  }

}