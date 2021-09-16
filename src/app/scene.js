import {Element as PhinaElement} from "./element"

/**
 * Sceneを表すラベル。
 * ManagerSceneクラスを介したGameAppサイクルで使用
 * @typedef {string|number} SceneLabel
 */

/**
 * Scene.exitメソッド用パラメータ
 * @typedef {{
 *   nextLabel?: SceneLabel
 *   [key: string]: any,
 * }} NextArgumentsForExit
 */

/**
 * Sceneのappクラス参照として最低限のインタフェースを備えた型
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
     * Appクラス参照。
     * シーンがアクティブになった際にセットされる
     * 
     * @type {SceneAppAppliable?}
     */
    this.app;

    /**
     * 次のシーンを表すラベル。
     * GameAppクラスによるシーン管理処理に使用
     * 
     * @type {SceneLabel}
     */
    this.nextLabel;

    /**
     * 次のシーンに渡される引数。
     * GameAppクラスによるシーン管理処理に使用
     * 
     * @type {any}
     */
    this.nextArguments;
  }

  /**
   * 現在のシーンを抜ける
   * 
   * また必要に応じて次シーンのラベル及びコンストラクタ用引数をセット可能。
   * これらはGameAppクラスによるシーン管理処理に使用される。
   * 
   * @example
   * const scene = new Scene();
   * scene.exit("nextscenelabel", {score: 128})
   * // or
   * scene.exit({nextLabel:"nextscenelabel", score: 128})
   * 
   * @caveats
   * - 内部でBaseApp.popSceneを使うため、
   * {@link Scene.app}参照の無い状態では使用不可
   * 
   * 
   * @param {SceneLabel | NextArgumentsForExit} [nextLabelOrArguments]
   * 次シーンを示すラベル文字列、もしくは次シーンコンストラクタ用引数オブジェクト。
   * オブジェクト型の場合、nextLabelプロパティでラベルを指定することも可能
   * 
   * @param {any} [nextArguments]
   * 次シーンに渡したいコンストラクタ用引数オブジェクト。
   * 第一引数に引数オブジェクトを指定した場合は無効
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