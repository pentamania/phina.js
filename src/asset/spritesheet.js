import { forIn } from "../core/object";
import { range } from "../core/array";
import { times } from "../core/number";
import { Asset } from "./asset";

/**
 * @typedef {Object} SpriteSheetFrameData
 * @property {number} x フレーム左上x座標
 * @property {number} y フレーム左上y座標
 * @property {number} width フレーム横幅
 * @property {number} height フレーム縦幅
 */

 /**
 * 各アニメーションの詳細
 * @typedef {Object} SpriteSheetAnimationData
 * @property {number[]} frames フレーム番号順の数列 ex) [0, 1, 2]
 * @property {string | number} next 現アニメーション終了時に移行したいアニメーション名、ループさせたい場合は同じアニメーションを指定
 * @property {number} frequency フレーム更新頻度（間隔）
 */

/**
 * SpriteSheetAnimationDataの配列版
 * @typedef {[
 *   number, // 開始フレームindex
 *   number, // 終了フレームindex
 *   string | number, // next
 *   number  // frequency
 * ]} SpriteSheetAnimationDataArray
 */

/**
 * アニメーションテーブル
 * @typedef {{
 *   [key in (string | number)]: SpriteSheetAnimationData
 * }} SpriteSheetAnimationTable
 */

/**
 * @typedef {Object} SpriteSheetFrameSetupParam
 * @property {number} width １フレームの横幅
 * @property {number} height １フレームの縦幅
 * @property {number} rows 横のフレーム数
 * @property {number} cols 縦のフレーム数
 */

/**
 * SpriteSheetクラスセットアップ用のデータオブジェクト
 * @typedef {Object} SpriteSheetSetupParam
 * @property {SpriteSheetFrameSetupParam} frame フレームのサイズ・分割数データ
 * @property {{
 *   [key in (string | number)]: SpriteSheetAnimationData | SpriteSheetAnimationDataArray
 * }} animations
 */

/**
 * @class phina.asset.SpriteSheet
 * _extends phina.asset.Asset
 */
export class SpriteSheet extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * jsonファイルへのパス文字列、もしくはjsonデータオブジェクトそのもの
     * @type {string | SpriteSheetSetupParam}
     */
    this.src

    /**
     * 総フレーム数
     * @type {number}
     */
    this.frame

    /** @type {SpriteSheetFrameData[]} */
    this.frames

    /** @type {SpriteSheetAnimationTable} */
    this.animations
  }

  /**
   * @param {SpriteSheetSetupParam} params
   * @returns {this}
   */
  setup(params) {
    this._setupFrame(params.frame);
    this._setupAnim(params.animations);
    return this;
  }

  /**
   * @override
   * @param {(arg0: this) => void} resolve
   * @returns {void}
   */
  _load(resolve) {

    var self = this;

    if (typeof this.src === 'string') {
      var xml = new XMLHttpRequest();
      xml.open('GET', this.src);
      xml.onreadystatechange = function() {
        if (xml.readyState === 4) {
          if ([200, 201, 0].indexOf(xml.status) !== -1) {
            var data = xml.responseText;
            var json = JSON.parse(data);

            self.setup(json);

            resolve(self);
          }
        }
      };

      xml.send(null);
    }
    else {
      this.setup(this.src);
      resolve(self);
    }

  }

  /**
   * @private
   * @param {SpriteSheetFrameSetupParam} frame
   */
  _setupFrame(frame) {
    /** @type {SpriteSheetFrameData[]} */
    var frames = this.frames = [];
    var unitWidth = frame.width;
    var unitHeight = frame.height;

    var count = frame.rows * frame.cols;
    this.frame = count;

    times.call(count, function(i) {
    // (count).times(function(i) {
      var xIndex = i%frame.cols;
      var yIndex = (i/frame.cols)|0;

      frames.push({
        x: xIndex*unitWidth,
        y: yIndex*unitHeight,
        width: unitWidth,
        height: unitHeight,
      });
    });
  }

  /**
   * @private
   * @param {SpriteSheetSetupParam["animations"]} animations
   */
  _setupAnim(animations) {
    this.animations = {};

    // デフォルトアニメーション
    this.animations["default"] = {
        frames: range.call([], 0, this.frame),
        // frames: [].range(0, this.frame),
        next: "default",
        frequency: 1,
    };

    // animations.forIn(
    forIn.call(animations, 
    /**
     * @this {SpriteSheet}
     * @param {string | number} key
     * @param {SpriteSheetAnimationData | SpriteSheetAnimationDataArray} value
     */
    function(key, value) {
      var anim = value;

      if (anim instanceof Array) {
        this.animations[key] = {
          frames: range.call([], anim[0], anim[1]),
          // frames: [].range(anim[0], anim[1]),
          next: anim[2],
          frequency: anim[3] || 1,
        };
      }
      else {
        this.animations[key] = {
          frames: anim.frames,
          next: anim.next,
          frequency: anim.frequency || 1
        };
      }

    }, this);
  }

  /**
   * フレームを取得
   * @param {number} index
   * @returns {SpriteSheetFrameData}
   */
  getFrame(index) {
    return this.frames[index];
  }

  /**
   * @param {string | number} [name="default"]
   * @returns {SpriteSheetAnimationData}
   */
  getAnimation(name) {
    name = (name !== undefined) ? name : "default";
    return this.animations[name];
  }

}