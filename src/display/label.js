import { Shape } from "./shape";
import { $safe } from "../core/object";
import { format } from "../core/string";

/**
 * @typedef {{
 *   text?: any
 *   fontSize?: number
 *   fontWeight?: string | number
 *   fontFamily?: string
 *   align?: CanvasTextAlign
 *   baseline?: CanvasTextBaseline
 *   lineHeight?: number
 * } & import("./shape").ShapeOptions } LabelOptions
 */

/**
 * @class phina.display.Label
 * _extends phina.display.Shape
 */
export class Label extends Shape {

  /**
   * @constructor
   * @param {LabelOptions} [options]
   */
  constructor(options) {
    if (typeof arguments[0] !== 'object') {
      options = { text: arguments[0], };
    }
    else {
      options = arguments[0];
    }

    options = $safe.call({}, options||{}, Label.defaults)
    // options = ({}).$safe(options, phina.display.Label.defaults);

    super(options);

    /**
     * 内部テキスト文字列。こちらは更新しても描画に反映されない
     * {@link Label.text} アクセサを利用して取得・更新する事
     * 
     * @protected
     * @type {any}
     */
    this._text;

    /**
     * 入力テキストを改行制御文字（`\n`）で分割した文字列配列
     * テキスト描画、内部キャンバスサイズ計算等に使用
     * 
     * {@link Label.text} setter代入時に更新
     * 
     * @protected
     * @type {string[]}
     */
    this._lines = [];

    this.text = options.text;

    /**
     * フォントの大きさ
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {number}
     */
    this.fontSize = options.fontSize;

    /**
     * フォントの太さ (あるいは重み)
     * @see https://developer.mozilla.org/ja/docs/Web/CSS/font-weight
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {string | number}
     */
    this.fontWeight = options.fontWeight;

    /**
     * フォントファミリー
     * @see https://developer.mozilla.org/ja/docs/Web/CSS/font-family
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {string}
     */
    this.fontFamily = options.fontFamily;

    /**
     * テキストの基準位置（縦軸）を設定
     * @see https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/textAlign
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {CanvasTextAlign}
     */
    this.align = options.align;

    /**
     * テキストのベースライン (基準線) を設定
     * @see https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/textBaseline
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {CanvasTextBaseline}
     */
    this.baseline = options.baseline;

    /**
     * テキストの行高さ補正値
     * fontSizeにこの値を乗算したものを各行の高さとする
     * 
     * 
     * 値を書き換えると自動的に再描画が行われる
     * 
     * @public
     * @type {number}
     */
    this.lineHeight = options.lineHeight;
  }

  /**
   * 各テキスト行から、描画に必要な幅を計算する
   * 
   * @override
   * 最も長い行幅にpadding値を加えた値を返すよう上書き
   * 
   * @public
   * @returns {number}
   */
  calcCanvasWidth() {
    var width = 0;
    var canvas = this.canvas;
    canvas.context.font = this.font;
    this._lines.forEach(function(line) {
      var w = canvas.context.measureText(line).width;
      if (width < w) {
        width = w;
      }
    }, this);
    if (this.align !== 'center') width*=2;

    return width + this.padding*2;
  }

  /**
   * テキスト行数から描画に必要な高さを計算する
   * 
   * @override
   * fontSizeに行数、baseline、lineHeightやpadding値を加味した値を返す用
   * 
   * @returns {number}
   */
  calcCanvasHeight() {
    var height = this.fontSize * this._lines.length;
    if (this.baseline !== 'middle') height*=2;
    return height*this.lineHeight + this.padding*2;
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  prerender(canvas) {
    var context = canvas.context;
    context.font = this.font;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;

    var lines = this._lines;
    this.lineSize = this.fontSize*this.lineHeight;
    this._offset = -Math.floor(lines.length/2)*this.lineSize;
    this._offset += ((lines.length+1)%2) * (this.lineSize/2);
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  renderFill(canvas) {
    var context = canvas.context;
    this._lines.forEach(function(line, i) {
      context.fillText(line, 0, i*this.lineSize+this._offset);
    }, this);
  }

  /**
   * @param  {import('../graphics/canvas').Canvas} canvas 
   */
  renderStroke(canvas) {
    var context = canvas.context;
    this._lines.forEach(function(line, i) {
      context.strokeText(line, 0, i*this.lineSize+this._offset);
    }, this);
  }

  /**
   * 描画されるテキスト値
   * 
   * 基本はstring型で指定、
   * またセットの際、改行制御文字`\n`が含まれるとそこで改行が行われる
   * 
   * 値を書き換えると自動的に再描画が行われる
   * 
   * @type {any}
  */
  get text() { return this._text; }
  set text(v) {
    this._text = v;
    this._lines = (this.text + '').split('\n');
  }

  /**
   * 内部フォントパラメータを一括指定プロパティ形式にフォーマットした文字列を返す
   * @see https://developer.mozilla.org/ja/docs/Web/CSS/font
   * 
   * @type {string}
   */
  get font() {
    return format.call("{fontWeight} {fontSize}px {fontFamily}", this);
    // return "{fontWeight} {fontSize}px {fontFamily}".format(this);
  }

}

/**
 * @type {LabelOptions}
 * @static
 */
Label.defaults = {
  backgroundColor: 'transparent',

  fill: 'black',
  stroke: null,
  strokeWidth: 2,

  // 
  text: 'Hello, world!',
  // 
  fontSize: 32,
  fontWeight: '',
  fontFamily: "'HiraKakuProN-W3'", // Hiragino or Helvetica,
  // 
  align: 'center',
  baseline: 'middle',
  lineHeight: 1.2,
}

// defined
Shape.watchRenderProperty.call(Label, 'text');
Shape.watchRenderProperty.call(Label, 'fontSize');
Shape.watchRenderProperty.call(Label, 'fontWeight');
Shape.watchRenderProperty.call(Label, 'fontFamily');
Shape.watchRenderProperty.call(Label, 'align');
Shape.watchRenderProperty.call(Label, 'baseline');
Shape.watchRenderProperty.call(Label, 'lineHeight');