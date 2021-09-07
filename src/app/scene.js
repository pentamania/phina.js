import {Element as PhinaElement} from "./element"

/**
 * @typedef {string|number} SceneLabel
 */

/**
 * exitメソッド用パラメータ
 * @typedef {{
 *   nextLabel?: SceneLabel
 *   [key: string]: any,
 * }} NextArgumentsForExit
 */

/**
 * SceneのAppクラス参照として最低限のインタフェースを備えた型
 * @typedef {{
 *   popScene: typeof import("./baseapp").BaseApp.prototype.popScene
 *   [key: string]: any,
 * }} SceneAppAppliable
 */

/**
 * @class phina.app.Scene
 * _extends phina.app.Element
 */
export class Scene extends PhinaElement {

  constructor() {
    super();

    /**
     * Appクラス参照
     * @type {SceneAppAppliable?}
     */
    this.app;

    /**
     * 次のシーンを表すラベル
     * @type {SceneLabel}
     */
    this.nextLabel;

    /**
     * 次のシーンに渡される引数を保持
     * ManagerSceneクラスで使用
     * @type {any}
     */
    this.nextArguments;
  }

  /**
   * 現在のシーンを抜ける
   * 
   * @example
   * const scene = new Scene();
   * scene.exit("nextscenelabel", {score: 128})
   * // or
   * scene.exit({nextLabel:"nextscenelabel", score: 128})
   * 
   * @param {SceneLabel | NextArgumentsForExit} [nextLabelOrArguments]
   * 次シーンのラベル、もしくはラベル込みの引数オブジェクト
   * 
   * @param {any} [nextArguments]
   * 引数オブジェクト
   * 第一引数をラベル文字列で指定した場合に設定
   * 
   * @returns {this | void}
   * 自身を返す。ただしapp参照が存在せず、処理できなかった場合は何も返さない
   */
  exit(nextLabelOrArguments, nextArguments) {
    if (!this.app) return ;

    if (nextLabelOrArguments != null) {
      if (typeof nextLabelOrArguments === 'object') {
        nextArguments = nextLabelOrArguments;
        this.nextLabel = nextLabelOrArguments.nextLabel || this.nextLabel;
      } else {
        this.nextLabel = nextLabelOrArguments;
      }
    }
    if (nextArguments) this.nextArguments = nextArguments;

    this.app.popScene();

    return this;
  }

}