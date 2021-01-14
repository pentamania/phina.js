import { Accessory } from "./accessory";
import { AssetManager } from "../asset/assetmanager";

/**
 * @typedef {{
 *   srcRect: import("../geom/rect").Rect
 *   width: number
 *   height: number
 * } & import("./accessory").AccessoryTarget } FrameAnimationTarget
 */

/**
 * @class phina.accessory.FrameAnimation
 * _extends phina.accessory.Accessory
 */
export class FrameAnimation extends Accessory {

  /**
   * @constructor
   * @param {string} ss ロード済みスプライトシートデータAssetキー
   */
  constructor(ss) {
    super();

    /** @type {FrameAnimationTarget} */
    this.target

    /** @type {string | number} */
    this.currentAnimationName

    /** @type {number} */
    this.currentFrameIndex

    /** @type {number} */
    this.frame

    /**
     * スプライトシートオブジェクト
     * @type {import('../asset/spritesheet').SpriteSheet}
     */
    this.ss = AssetManager.get('spritesheet', ss);

    /** @type {boolean} */
    this.paused = true;

    /** @type {boolean} */
    this.finished = false;

    /** @type {boolean} */
    this.fit = true;
  }

  /**
   * 更新関数
   */
  update() {
    if (this.paused) return ;
    if (!this.currentAnimation) return ;

    if (this.finished) {
      this.finished = false;
      this.currentFrameIndex = 0;
      return ;
    }

    ++this.frame;
    if (this.frame%this.currentAnimation.frequency === 0) {
      ++this.currentFrameIndex;
      this._updateFrame();
    }
  }

  /**
   * @param {string | number} name アニメーション名
   * @param {boolean} [keep=true] アニメーションがすでに再生中の場合、何もしないかどうか
   * @returns {this}
   */
  gotoAndPlay(name, keep) {
    keep = (keep !== undefined) ? keep : true;
    if (keep && name === this.currentAnimationName
             && this.currentFrameIndex < this.currentAnimation.frames.length
             && !this.paused) {
      return this;
    }
    this.currentAnimationName = name;
    this.frame = 0;
    this.currentFrameIndex = 0;
    this.currentAnimation = this.ss.getAnimation(name);
    this._updateFrame();

    this.paused = false;

    return this;
  }

  /**
   * @param {string} name アニメーション名
   * @returns {this}
   */
  gotoAndStop(name) {
    this.currentAnimationName = name;
    this.frame = 0;
    this.currentFrameIndex = 0;
    this.currentAnimation = this.ss.getAnimation(name);
    this._updateFrame();

    this.paused = true;

    return this;
  }

  /**
   * @private
   * フレーム更新
   * 
   * @returns {void}
   */
  _updateFrame() {
    var anim = this.currentAnimation;
    if (anim) {
      if (this.currentFrameIndex >= anim.frames.length) {
        if (anim.next) {
          this.gotoAndPlay(anim.next);
          return ;
        }
        else {
          this.paused = true;
          this.finished = true;
          return ;
        }
      }
    }

    var index = anim.frames[this.currentFrameIndex];
    var frame = this.ss.getFrame(index);
    this.target.srcRect.set(frame.x, frame.y, frame.width, frame.height);

    if (this.fit) {
      this.target.width = frame.width;
      this.target.height = frame.height;
    }
  }

}