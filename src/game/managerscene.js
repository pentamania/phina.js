import phina from "../phina";
import { $extend } from "../core/object";
import { format } from "../core/string";
import { Scene } from "../app/scene";

/**
 * @typedef {{
 *   className: string | Constructable
 *   label: import("../app/scene").SceneLabel
 *   arguments?: any
 *   nextLabel?: import("../app/scene").SceneLabel
 *   nextArguments?: any
 * }} SceneData
 */

/**
 * @typedef {{
 *   startLabel: import("../app/scene").SceneLabel
 *   scenes: SceneData[]
 * }} ManagerSceneParams
 */

/**
 * @class phina.game.ManagerScene
 * _extends phina.app.Scene
 */
export class ManagerScene extends Scene {

  /**
   * @constructor
   * @param {ManagerSceneParams} params
   */
  constructor(params) {
    super();

    /** @type SceneData[] */
    this.scenes
    /** @type number */
    this.sceneIndex

    this.setScenes(params.scenes);

    this.on("enter", function() {
      this.gotoScene(params.startLabel || 0);
    }.bind(this));

    this.on("resume", this.onnext.bind(this));

    this.commonArguments = {};
  }

  /**
   * scenes をセット
   * @param {SceneData[]} scenes
   * @returns {this}
   */
  setScenes(scenes) {
    this.scenes = scenes;
    this.sceneIndex = 0;

    return this;
  }

  /**
   * Sceneクラスをインスタンス化して返す
   * @private
   * @param {SceneData} data
   * @param {any} args
   * @returns {Scene}
   */
  _instantiateScene(data, args) {
    // Scene初期化引数
    var initArguments = $extend.call({}, data.arguments, args);
    // var initArguments = {}.$extend(data.arguments, args);

    /** @type {Scene} */
    var scene;

    /** @type {Constructable} */
    var SceneConstructor;
    if (typeof data.className === 'string') {
      // 文字列型の場合：phina.define、あるいはグローバルスコープ（window）に直接定義されたクラスの文字列
      SceneConstructor = phina.using(data.className);
      if (typeof SceneConstructor !== 'function') {
        SceneConstructor = phina.using('phina.game.' + data.className);
      }
    } else if (typeof data.className === 'function') {
      // 関数型の場合：純粋なclassと見なす
      SceneConstructor = data.className;
    } else {
      // それ以外：エラーを出す？
    }
    scene = new SceneConstructor(initArguments);

    // 次シーンパラメータが無い場合の処理
    if (!scene.nextLabel) {
      scene.nextLabel = data.nextLabel;
    }
    if (!scene.nextArguments) {
      scene.nextArguments = data.nextArguments;
    }

    return scene
  }

  /**
   * Sceneクラスをインスタンス化してappにreplaceSceneさせる  
   * ライブラリ内では使われていない
   * @param  {import("../app/scene").SceneLabel} label シーンの対応ラベル
   * @param  {any} [args] Sceneにわたす引数がある場合に指定
   * @returns {this}
   */
  replaceScene(label, args) {
    var index = (typeof label == 'string') ? this.labelToIndex(label) : label||0;
    if (!this.scenes[index]) {
      console.error(format.call('phina.js error: `{0}` に対応するシーンがありません.', label));
    }
    var scene = this._instantiateScene(this.scenes[index], args)
    this.app.replaceScene(scene);
    this.sceneIndex = index;

    return this;
  }

  /**
   * index(or label) のシーンへ飛ぶ
   * replaceSceneとの違いはapp.replaceSceneではなく、app.pushSceneを実行する点
   * @param {import("../app/scene").SceneLabel} label
   * @param {any} args
   * @returns {this}
   */
  gotoScene(label, args) {
    var index = (typeof label == 'string') ? this.labelToIndex(label) : label||0;
    if (!this.scenes[index]) {
      console.error(format.call('phina.js error: `{0}` に対応するシーンがありません.', label));
    }
    var scene = this._instantiateScene(this.scenes[index], args)
    this.app.pushScene(scene);
    this.sceneIndex = index;

    return this;
  }

  /**
   * 次のシーンへ飛ぶ
   * @param {any} args
   * @returns {this}
   */
  gotoNext(args) {
    var data = this.scenes[this.sceneIndex];
    var nextIndex = null;

    // 次のラベルが設定されていた場合
    if (data.nextLabel) {
        nextIndex = this.labelToIndex(data.nextLabel);
    }
    // 次のシーンに遷移
    else if (this.sceneIndex+1 < this.scenes.length) {
        nextIndex = this.sceneIndex+1;
    }

    if (nextIndex !== null) {
        this.gotoScene(nextIndex, args);
    }
    else {
        this.flare("finish");
    }

    return this;
  }

  /**
   * シーンインデックスを取得
   * @returns {number}
   */
  getCurrentIndex() {
    return this.sceneIndex;
  }

  /**
   * シーンラベルを取得
   * @returns {import("../app/scene").SceneLabel} label
   */
  getCurrentLabel() {
    return this.scenes[this.sceneIndex].label;
  }

  /**
   * ラベルからインデックスに変換
   * @param {import("../app/scene").SceneLabel} label
   */
  labelToIndex(label) {
    var data = this.scenes.filter(function(data) {
      return data.label == label;
    })[0];

    return this.scenes.indexOf(data);
  }

  /**
   * インデックスからラベルに変換
   * @param {number} index
   * @returns {import("../app/scene").SceneLabel} label
   */
  indexToLabel(index) {
    return this.scenes[index].label;
  }

  /**
   * {@link BaseApp#popScene}の際にresumeイベント経由で実行され、対応する次のシーンに移行する
   * @param {{ prevScene: { nextLabel: import("../app/scene").SceneLabel; nextArguments: any; }; }} e
   * @returns {void}
   */
  onnext(e) {
    var nextLabel = e.prevScene.nextLabel;
    var nextArguments = e.prevScene.nextArguments;
    if (nextLabel) {
      this.gotoScene(nextLabel, nextArguments);
    }
    else {
      this.gotoNext(nextArguments);
    }
  }

}
