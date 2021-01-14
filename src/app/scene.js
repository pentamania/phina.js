import {Element as PhinaElement} from "./element"

/**
 * @typedef {string|number} SceneLabel
 */

/**
 * @class phina.app.Scene
 * _extends phina.app.Element
 */
export class Scene extends PhinaElement {

  constructor() {
    super();

    /** @type {AppUnion|undefined} */
    this.app = undefined
    
    /**
     * 次のシーンを表すラベル
     * @type {SceneLabel}
     */
    this.nextLabel;

    /**
     * 次のシーンに渡される引数
     * @type {any}
     */
    this.nextArguments;
  }

  /**
   * @param {SceneLabel} [nextLabel] 次シーンのラベル
   * @param {any} [nextArguments]
   * @returns {this}
   */
  exit(nextLabel, nextArguments) {
    if (!this.app) return ;

    if (arguments.length > 0) {
      if (typeof arguments[0] === 'object') {
        nextLabel = arguments[0].nextLabel || this.nextLabel;
        nextArguments = arguments[0];
      }

      this.nextLabel = nextLabel;
      this.nextArguments = nextArguments;
    }

    this.app.popScene();

    return this;
  }

}