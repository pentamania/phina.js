import phina from "../phina";
import { $extend } from "../core/object";
import { format } from "../core/string";
import { Scene } from "../app/scene";

/**
 * @class phina.game.ManagerScene
 * @extends phina.app.Scene
 */
export class ManagerScene extends Scene {

  /**
   * @constructor
   */
  constructor(params) {
    super();

    this.setScenes(params.scenes);

    this.on("enter", function() {
      this.gotoScene(params.startLabel || 0);
    }.bind(this));

    this.on("resume", this.onnext.bind(this));

    this.commonArguments = {};
  }

  /**
   * scenes をセット
   */
  setScenes(scenes) {
    this.scenes = scenes;
    this.sceneIndex = 0;

    return this;
  }

  /**
   * Sceneクラスをインスタンス化して返す
   * 
   * @param  {[type]} data  [description]
   * @return {[type]}       [description]
   */
  _instantiateScene(data, args) {
    // Scene初期化引数
    var initArguments = $extend.call({}, data.arguments, args);
    // var initArguments = {}.$extend(data.arguments, args);

    var scene, klass;
    if (typeof data.className === 'string') {
      // phina.define、あるいはglobal(window)に直接定義されたクラスの文字列
      klass = phina.using(data.className);
      if (typeof klass !== 'function') {
        klass = phina.using('phina.game.' + data.className);
      }
      // scene = klass.call(null, initArguments);
    } else if (typeof data.className === 'function') {
      // 関数の場合、純粋なclassと見なす
      klass = data.className;
    }
    scene = new klass(initArguments);

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
   * 
   * @param  {string|number} label シーンの対応ラベル
   * @param  {any} [args] Sceneにわたす引数がある場合に指定
   * @return {this}
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
   */
  getCurrentIndex() {
    return this.sceneIndex;
  }

  /**
   * シーンラベルを取得
   */
  getCurrentLabel() {
    return this.scenes[this.sceneIndex].label;
  }

  /**
   * ラベルからインデックスに変換
   */
  labelToIndex(label) {
    var data = this.scenes.filter(function(data) {
      return data.label == label;
    })[0];

    return this.scenes.indexOf(data);
  }

  /**
   * インデックスからラベルに変換
   */
  indexToLabel(index) {
    return this.scenes[index].label;
  }

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
