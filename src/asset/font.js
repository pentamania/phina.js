import { last } from "../core/array";
import { format as stringFormat } from "../core/string";
import { Asset } from "./asset";
import { Flow } from "../util/flow"
import { Canvas } from "../graphics/canvas";

/** @typedef {string|number|null} FontName 基本はstring型 */

/**
 * @class phina.asset.Font
 * _extends phina.asset.Asset
 */
export class Font extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();

    /** @type {FontName} */
    this.fontName = null;
  }

  /**
   * @param {string} path
   * @returns {Flow}
   */
  load(path) {
    this.src = path;

    var reg = /(.*)(?:\.([^.]+$))/;
    var key = this.fontName || last.get.call(path.match(reg)[1].split('/'));    //フォント名指定が無い場合はpathの拡張子前を使用
    // var key = this.fontName || path.match(reg)[1].split('/').last;    //フォント名指定が無い場合はpathの拡張子前を使用
    var type = path.match(reg)[2];
    var format = "unknown";
    switch (type) {
      case "ttf":
        format = "truetype"; break;
      case "otf":
        format = "opentype"; break;
      case "woff":
        format = "woff"; break;
      case "woff2":
        format = "woff2"; break;
      default:
        console.warn("サポートしていないフォント形式です。(" + path + ")");
    }
    this.format = format;
    this.fontName = key;

    if (format !== "unknown") {
      var text = stringFormat.call("@font-face { font-family: '{0}'; src: url({1}) format('{2}'); }", key, path, format);
      // var text = "@font-face { font-family: '{0}'; src: url({1}) format('{2}'); }".format(key, path, format);
      var e = document.querySelector("head");
      var fontFaceStyleElement = document.createElement("style");
      if (fontFaceStyleElement.innerText) {
        fontFaceStyleElement.innerText = text;
      } else {
        fontFaceStyleElement.textContent = text;
      }
      e.appendChild(fontFaceStyleElement);
    }

    return new Flow(this._load.bind(this));
  }

  /**
   * @param {(arg0: Font) => void} resolve
   */
  _load(resolve) {
    if (this.format !== "unknown") {
      this._checkLoaded(this.fontName, 
      /** @this {Font} */
      function() {
        this.loaded = true;
        resolve(this);
      }.bind(this));
    } else {
      this.loaded = true;
      resolve(this);
    }
  }

  /**
   * @param {FontName} font
   * @param {() => any} [callback]
   */
  _checkLoaded (font, callback) {
    var canvas = new Canvas();
    var DEFAULT_FONT = canvas.context.font.split(' ')[1];
    canvas.context.font = '40px ' + DEFAULT_FONT;

    var checkText = "1234567890-^\\qwertyuiop@[asdfghjkl;:]zxcvbnm,./\!\"#$%&'()=~|QWERTYUIOP`{ASDFGHJKL+*}ZXCVBNM<>?_１２３４５６７８９０－＾￥ｑｗｅｒｔｙｕｉｏｐａｓｄｆｇｈｊｋｌｚｘｃｖｂｎｍ，．あいうかさたなをん時は金なり";
    // 特殊文字対応
    checkText += String.fromCharCode(0xf04b);

    var before = canvas.context.measureText(checkText).width;
    canvas.context.font = '40px ' + font + ', ' + DEFAULT_FONT;

    var timeoutCount = 30;
    var checkLoadFont = function () {
      var after = canvas.context.measureText(checkText).width;
      if (after !== before) {
        setTimeout(function() {
          callback && callback();
        }, 100);
      } else {
        if (--timeoutCount > 0) {
          setTimeout(checkLoadFont, 100);
        }
        else {
          callback && callback();
          console.warn("timeout font loading");
        }
      }
    };
    checkLoadFont();
  }

  /**
   * @param {FontName} name
   * @returns {this}
   */
  setFontName(name) {
    if (this.loaded) {
      console.warn("フォント名はLoad前にのみ設定が出来ます(" + name + ")");
      return this;
    }
    this.fontName = name;
    
    return this;
  }

  /**
   * @returns {FontName}
   */
  getFontName() {
    return this.fontName;
  }

}