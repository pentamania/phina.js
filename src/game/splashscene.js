import { DisplayScene } from "../display/displayscene";
import { Texture } from "../asset/texture";
import { Sprite } from "../display/sprite";

/**
 * @typedef {Object} SplashSceneOptionExtend
 * @property {string} imageURL 表示する画像URL
 * 
 * @typedef {import("../display/displayscene").DisplaySceneOptions & SplashSceneOptionExtend} SplashSceneOptions
 */

/**
 * @class phina.game.SplashScene
 * _extends phina.display.DisplayScene
 */
export class SplashScene extends DisplayScene {

  /**
   * @param {SplashSceneOptions} [options]
   */
  constructor(options) {
    var defaults = SplashScene.defaults;
    super(options);

    var texture = new Texture();
    texture.load(defaults.imageURL).then(
    /** @this SplashScene */
    function() {
      this._init();
    }.bind(this));
    this.texture = texture;
  }

  /**
   * @private
   * 初期化関数
   */
  _init() {
    this.sprite = new Sprite(this.texture).addChildTo(this);

    this.sprite.setPosition(this.gridX.center(), this.gridY.center());
    this.sprite.alpha = 0;

    this.sprite.tweener
      .clear()
      .to({alpha:1}, 500, 'easeOutCubic')
      .wait(1000)
      .to({alpha:0}, 500, 'easeOutCubic')
      .wait(250)
      .call(function() {
        this.exit();
      }, this)
      ;
  }

}

/** @type {SplashSceneOptions} */
SplashScene.defaults = {
  imageURL: 'http://cdn.rawgit.com/phi-jp/phina.js/develop/logo.png',
};
