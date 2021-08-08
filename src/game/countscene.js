import { $safe } from "../core/object";
import { clone, range } from "../core/array";
import { DisplayScene } from "../display/displayscene";
import { Label } from "../display/label";

/**
 * @typedef {Object} CountSceneOptionExtend
 * @property {number|number[]} [count] カウントダウン回数。配列で渡した場合、その逆順でカウントダウンを行う
 * @property {import("../index.esm").CanvasStyle} [fontColor] フォントの色
 * @property {number} [fontSize] フォントサイズ
 * @property {string} [exitType] 'auto'のとき、自動でpopScene
 * 
 * @typedef {import("../display/displayscene").DisplaySceneOptions & CountSceneOptionExtend} CountSceneOptions
 */

/**
 * @class phina.game.CountScene
 * _extends phina.display.DisplayScene
 * 
 * 自動でカウントダウンを行う一時用Scene
 * メインのシーンでゲーム開始前にpushSceneするのが一般的な使い方
 */
export class CountScene extends DisplayScene {

  /**
   * @constructor
   * @param {CountSceneOptions} [options]
   */
  constructor(options) {
    super(options);

    options = $safe.call(options || {}, CountScene.defaults);
    // options = (options || {}).$safe(phina.game.CountScene.defaults);

    this.backgroundColor = options.backgroundColor;

    this.fromJSON({
      children: {
        label: {
          className: Label,
          // className: 'phina.display.Label',
          arguments: {
            fill: options.fontColor,
            fontSize: options.fontSize,
            stroke: false,
          },
          x: this.gridX.center(),
          y: this.gridY.center(),
        },
      }
    });

    /** @type {Label} */
    this.label;

    /** @type {number[]} */
    this.countList;

    if (options.count instanceof Array) {
      this.countList = clone.call(options.count).reverse();
      // this.countList = options.count.clone().reverse();
    }
    else {
      this.countList = range.call([], 1, options.count+1);
      // this.countList = Array.range(1, options.count+1);
    }
    this.counter = this.countList.length;
    this.exitType = options.exitType;

    this._updateCount();
  }

  _updateCount() {
    var endFlag = this.counter <= 0;
    var index = --this.counter;

    this.label.text = this.countList[index];

    this.label.scale.set(1, 1);
    this.label.tweener
      .clear()
      .to({
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
      }, 250)
      .wait(500)
      .to({
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0.0
      }, 250)
      .call(
      /** @this CountScene */
      function() {
        if (this.counter <= 0) {
          this.flare('finish');
          if (this.exitType === 'auto') {
            this.app.popScene();
          }
        }
        else {
          this._updateCount();
        }
      }, this);
  }

}

/** @type {CountSceneOptions} */
CountScene.defaults = {
  count: 3,

  width: 640,
  height: 960,

  fontColor: 'white',
  fontSize: 164,
  backgroundColor: 'rgba(50, 50, 50, 1)',

  exitType: 'auto',
}
