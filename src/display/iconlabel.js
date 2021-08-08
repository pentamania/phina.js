import { $safe } from "../core/object";
import { Label } from "./label";

/**
 * @typedef {{
 *   text: string | number,
 * } & import('../display/label').LabelOptions } IconLabelOptions
 */

/**
 * @class phina.display.IconLabel
 * アイコンフォントを表示
 */
export class IconLabel extends Label {
  /**
   * @param {IconLabelOptions | string} optionOrText
   */
  constructor(optionOrText) {
    /** @type {Partial<IconLabelOptions>} */
    let optionPartial;
    if (typeof optionOrText === "string") {
      optionPartial = { text: optionOrText };
    } else {
      optionPartial = optionOrText;
    }
    super($safe.call({}, optionPartial, IconLabel.defaults));

    this.setSize(this.fontSize, this.fontSize);
  }

  /**
   * @property text
   * @type {string | number}
   * 16進数（文字列）で指定
   */
  get text() {
    return this._text;
  }
  set text(v) {
    var iconInt = typeof v === "string" ? parseInt(v, 16) : v;
    this._text = String.fromCharCode(iconInt);
    this._lines = (this.text + "").split("\n");
  }
}

/**
 * @type {IconLabelOptions}
 * @static
 */
IconLabel.defaults = {
  text: "f024",
  fontSize: 100,
  fontFamily: "FontAwesome",
};
