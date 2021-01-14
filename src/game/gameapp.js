import phina from "../phina";
import { $safe, $extend, forIn } from "../core/object";
import { each } from "../core/array";
import { CanvasApp } from "../display/canvasapp";
import { DisplayScene } from "../display/displayscene";
import { ManagerScene } from "./managerscene";
import { LoadingScene } from "./loadingscene";
import { SplashScene } from "./splashscene";
import { TitleScene } from "./titlescene";
import { PauseScene } from "./pausescene";
import { ResultScene } from "./resultscene";

/**
 * @typedef {{
 *   assets?: import("../asset/assetloader").AssetLoaderLoadParam
 *   scenes?: import("./managerscene").SceneData[]
 *   startLabel?: import("../app/scene").SceneLabel
 *   autoPause?: boolean
 *   debug?: boolean
 *   loadingScene?: typeof DisplayScene
 *   pauseScene?: typeof DisplayScene
 * } & import("../display/canvasapp").CanvasAppOptions } GameAppOptions
 */

/**
 * デフォルトのmain class
 */
class DefaultMainScene extends DisplayScene {
  constructor(options) {
    super(options);
    console.log('This is MainScene');
  }
};

/**
 * クラスがphina.defineによって定義（グローバルに定義）されているかどうかをチェック
 * @param {string} className クラス名。phina.game[className]で定義されているかも調べる
 * @returns {boolean}
 */
function isGameClassDefined(className) {
  if (
    typeof phina.using(className) === 'function'
    || typeof phina.using('phina.game.' + className) === 'function'
  ) {
    return true
  }
  return false;
}

/**
 * @class phina.game.GameApp
 * _extends phina.display.CanvasApp
 */
export class GameApp extends CanvasApp {

  /**
   * @param {GameAppOptions} options
   */
  constructor(options) {
    options = $safe.call(options || {}, {
    // options = (options || {}).$safe({
      startLabel: 'title',
    });
    super(options);

    /** @type {any} dat.GUIインスタンス */
    this.gui = undefined

    var startLabel = options.startLabel || 'title';

    var scenes = options.scenes || [
      {
        className: isGameClassDefined("SplashScene") ? "SplashScene" : SplashScene,
        label: 'splash',
        nextLabel: 'title',
      },
      {
        className: isGameClassDefined("TitleScene") ? "TitleScene" : TitleScene,
        label: 'title',
        nextLabel: 'main',
      },
      {
        className: isGameClassDefined("MainScene") ? "MainScene" : DefaultMainScene,
        label: 'main',
        nextLabel: 'result',
      },
      {
        className: isGameClassDefined("ResultScene") ? "ResultScene" : ResultScene,
        label: 'result',
        nextLabel: 'title',
      },
    ];

    scenes = each.call(scenes, function(s) {
      s.arguments = s.arguments || options;
    });

    var scene = new ManagerScene({
      startLabel: startLabel,
      scenes: scenes,
    });

    if (options.assets) {
      // ローディング：esm版では独自のLoadingSceneはオプションで渡せるようにする

      var loadingOptions = $extend.call({}, options, {
      // var loadingOptions = ({}).$extend(options, {
        exitType: '',
      });
      // グローバル定義のLoadingSceneを探す（従来）
      // -> なければオプションをチェック 
      // -> これもなければデフォルトのLoadingSceneを使う
      var definedLoadingClass = phina.using("LoadingScene") || phina.using("phina.game.LoadingScene");
      var loading = (typeof definedLoadingClass === 'function') 
        ? definedLoadingClass(loadingOptions)
        : (options.loadingScene != null)
          ? new options.loadingScene(loadingOptions) 
          : new LoadingScene(loadingOptions)
      ;
      this.replaceScene(loading);

      loading.onloaded = function() {
        this.replaceScene(scene);
        if (options.debug) {
          this._enableDebugger();
        }
      }.bind(this);
    }
    else {
      this.replaceScene(scene);
      if (options.debug) {
        this._enableDebugger();
      }
    }

    // 自動でポーズする
    // esm版では独自のポーズシーンはオプションで渡す
    // 引数が渡せないのは元から
    if (options.autoPause) {
      this.on('blur', function() {
        var definedPauseScene = phina.using("phina.game.PauseScene");
        var pauseScene = (typeof definedPauseScene === 'function') 
          ? definedPauseScene() 
          : (options.pauseScene) 
            ? new options.pauseScene(options) 
            : new PauseScene()
        this.pushScene(pauseScene);
      });
    }
  }

  /**
   * @private
   */
  _enableDebugger() {
    if (this.gui) return ;

    this.enableDatGUI(
    /**
     * @this {GameApp}
     * @param {{ addFolder: (arg0: string) => any; }} gui Dat.guiインスタンス
     */
    function(gui) {
      var f = gui.addFolder('scenes');
      var funcs = {};
      each.call(/** @type {ManagerScene} */(this.rootScene).scenes, function(scene) {
      // this.rootScene.scenes.each(function(scene) {
        funcs[scene.label] = function() {
          this.rootScene.replaceScene(scene.label);
          console.log(this._scenes.length);
        }.bind(this);
        return scene;
      }, this);

      forIn.call(funcs, function(key, value) {
      // funcs.forIn(function(key, value) {
        f.add(funcs, key);
      });
      f.open();

      this.gui = gui;
    }.bind(this));
  }
}
