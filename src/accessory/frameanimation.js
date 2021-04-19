import { Accessory } from "./accessory";
import { AssetManager } from "../asset/assetmanager";

/**
 * Spriteクラスなど、FrameAnimationのtargetとして適正な型
 * @typedef {{
 *   srcRect: import("../geom/rect").Rect
 *   width: number
 *   height: number
 * } & import("./accessory").AccessoryTarget } FrameAnimationTarget
 */

/**
 * @class phina.accessory.FrameAnimation
 * _extends phina.accessory.Accessory
 * 
 * フレームアニメーション制御を行うAccessory派生クラス
 * 
 * 予めロード（パース）したスプライトシートJSONデータを使い、
 * Spriteクラスのフレーム範囲を制御することでアニメーションを実現する
 * @see https://qiita.com/alkn203/items/a287c7524193f5f4ca90
 * 
 * @example
 * // 予め"player_ss"という名前でスプライトシート画像、Jsonデータをアセット登録しておく
 * // player_ssには"walk"という名前のアニメーションを定義
 * const target = new phina.display.Sprite("player_ss");
 * const frameAnim = new phina.accessory.FrameAnimation("player_ss").attachTo(target);
 * frameAnim.gotoAndPlay("walk");
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

    /**
     * スプライトシートオブジェクト
     * 
     * @type {import('../asset/spritesheet').SpriteSheet}
     */
    this.ss = AssetManager.get('spritesheet', ss);

    /**
     * 再生中のアニメーションのデータオブジェクト
     * 
     * @type {import("../asset/spritesheet").SpriteSheetAnimationData | null}
     */
    this.currentAnimation

    /**
     * 再生中のアニメーション名
     * 
     * @type {(string | number) | null}
     */
    this.currentAnimationName

    /**
     * 停止状態
     * 
     * @type {boolean}
     */
    this.paused = true;

    /**
     * フレームサイズに合わせて対象の幅・高さを変えるかどうか
     * 
     * @type {boolean}
     */
    this.fit = true;

    /**
     * 現在のアニメーションフレームを表すインデックス値
     * 
     * @type {number}
     * @protected
     */
    this.currentFrameIndex

    /**
     * アニメーション更新用のアプリフレームのカウント値
     * 
     * @type {number}
     * @protected
     */
    this.frame

    /**
     * 終了フラグ：trueの時はupdate時にcurrentFrameIndexがリセットされる
     * 
     * @type {boolean}
     * @protected
     */
    this.finished = false;
  }

  /**
   * @param {*} _app Appクラスインスタンス
   */
  update(_app) {
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
   * 指定アニメーションを再生
   * 
   * @param {string | number} name アニメーション名
   * @param {boolean} [keep=true] 同名アニメーションがすでに再生中の場合、そのままにするかどうか
   * @returns {this}
   */
  gotoAndPlay(name, keep) {
    keep = (keep !== undefined) ? keep : true;
    if (keep && this.currentAnimation
             && name === this.currentAnimationName
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
   * 指定アニメーション及びその冒頭フレームをセット後、停止状態にする
   * 
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
   * フレーム更新処理
   * 
   * @protected
   * @returns {void}
   */
  _updateFrame() {
    if (!this.currentAnimation) return;

    var anim = this.currentAnimation;
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

    var index = anim.frames[this.currentFrameIndex];
    var frame = this.ss.getFrame(index);
    this.target.srcRect.set(frame.x, frame.y, frame.width, frame.height);

    if (this.fit) {
      this.target.width = frame.width;
      this.target.height = frame.height;
    }
  }

}