import phina from "../phina";
import {EventDispatcher} from "../util/eventdispatcher";
import {Scene} from "./scene";
import {Updater} from "./updater";
import {Interactive} from "./interactive";
import {Ticker} from "../util/ticker";

/**
 * @typedef {(
 *   Scene |
 *   import("../display/displayscene").DisplayScene |
 *   import("../game/managerscene.js").ManagerScene
 * )} SceneTypeUnion
 */

/**
 * @class phina.app.BaseApp
 * ベースとなるアプリケーションクラス
 * _extends phina.util.EventDispatcher
 */
export class BaseApp extends EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    /** @type {SceneTypeUnion[]} */
    this._scenes = [new Scene()];
    this._sceneIndex = 0;

    this.updater = new Updater(this);
    this.interactive = new Interactive(this);
    
    /**
     * 有効状態かどうか
     * @type {boolean}
     */
    this.awake = true;
    this.ticker = new Ticker();
  }

  /**
   * @returns {this}
   */
  run() {
    var self = this;
    this._loopCaller = function() {
      self._loop();
    };
    this.ticker.tick(this._loopCaller);

    this.ticker.start();

    return this;
  }

  /**
   * アプリケーションを完全停止
   * @returns {this}
   */
  kill() {
    this.ticker.stop();
    this.ticker.untick(this._loopCaller);
    return this;
  }

  /**
   * @param {SceneTypeUnion} scene
   * @returns {this}
   */
  replaceScene(scene) {
    this.flare('replace');
    this.flare('changescene');

    var e = null;
    if (this.currentScene) {
      this.currentScene.app = null;
    }
    this.currentScene = scene;
    this.currentScene.app = this;
    this.currentScene.flare('enter', {
      app: this,
    });

    return this;
  }

  /**
   * @param {Scene} scene
   * @returns {this}
   */
  pushScene(scene) {
    this.flare('push');
    this.flare('changescene');

    this.currentScene.flare('pause', {
      app: this,
    });

    this._scenes.push(scene);
    ++this._sceneIndex;

    this.flare('pushed');

    scene.app = this;
    scene.flare('enter', {
      app: this,
    });

    return this;
  }

  /**
   * シーンをポップする(ポーズやオブション画面などで使用)
   * @returns {Scene}
   */
  popScene() {
    this.flare('pop');
    this.flare('changescene');

    var scene = this._scenes.pop();
    --this._sceneIndex;

    scene.flare('exit', {
      app: this,
    });
    scene.app = null;

    this.flare('poped');

    //
    this.currentScene.flare('resume', {
      app: this,
      prevScene: scene,
    });

    return scene;
  }

  /**
   * シーンのupdateを実行するようにする
   * @returns {this}
   */
  start() {
    this.awake = true;

    return this;
  }

  /**
   * シーンのupdateを実行しないようにする
   * @returns {this}
   */
  stop() {
    this.awake = false;

    return this;
  }

  /**
   * stats.js( https://github.com/mrdoob/stats.js/ )を実行し、パフォーマンスモニターを表示する  
   * stats.jsがまだ読み込まれていない場合、cdnjsからr14版スクリプトを読み込む
   * @returns {this}
   */
  enableStats() {
    if (phina.global['Stats']) {
      this.stats = new phina.global['Stats']();
      document.body.appendChild(this.stats.domElement);
    }
    else {
      // console.warn("not defined stats.");
      var STATS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r14/Stats.js';
      var script = document.createElement('script');
      script.src = STATS_URL;
      document.body.appendChild(script);
      script.onload = function() {
        this.enableStats();
      }.bind(this);
    }
    return this;
  }

  /**
   * dat.GUI( https://github.com/dataarts/dat.gui )を初期化し、そのインスタンスをコールバック関数に渡して実行  
   * dat.GUIがまだ読み込まれていない場合、cdnjsからv0.5.1版スクリプトを読み込む
   * @param {(datGUIObject?: any) => any} callback
   * @returns {this}
   */
  enableDatGUI(callback) {
    if (phina.global['dat']) {
      var gui = new phina.global['dat'].GUI();
      callback(gui);
    }
    else {
      // console.warn("not defined dat.GUI.");
      var URL = 'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.5.1/dat.gui.js';
      var script = document.createElement('script');
      script.src = URL;
      document.body.appendChild(script);
      script.onload = function() {
        var gui = new phina.global['dat'].GUI();
        callback(gui);
      }.bind(this);
    }
    return this;
  }

  /**
   * @private
   * ループ処理関数
   * @returns {void}
   */
  _loop() {
    this._update();
    this.interactive.check(this.currentScene);
    this._draw();

    // stats update
    if (this.stats) this.stats.update();
  }

  /**
   * @private
   * 更新処理関数
   * @returns {void}
   */
  _update() {
    if (this.awake) {
      // エンターフレームイベント
      if (this.has('enterframe')) {
        this.flare('enterframe');
      }

      this.update && this.update();
      this.updater.update(this.currentScene);
    }
  }

  /**
   * 更新用仮想関数
   * @virtual
   * @returns {any}
   */
  update() {}

  /**
   * 描画用仮想関数
   * @virtual
   * @returns {any}
   */
  _draw() {}

  /**
   * 現在描画しているシーン
   */
  get currentScene()   { return this._scenes[this._sceneIndex]; }
  set currentScene(v)  { this._scenes[this._sceneIndex] = v; }

  /**
   * 根本シーン。インスタンス化の際に自動的に設定
   */
  get rootScene()   { return this._scenes[0]; }
  set rootScene(v)  { this._scenes[0] = v; }

  /**
   * 経過フレームを取得（設定も可能）
   */
  get frame() { return this.ticker.frame; }
  set frame(v) { this.ticker.frame = v; }

  /**
   * Frame per second  
   * 秒間の更新処理数
   */
  get fps() { return this.ticker.fps; }
  set fps(v) { this.ticker.fps = v; }

  /**
   * 前フレームでの処理にかかった時間
   * @readonly
   */
  get deltaTime() { return this.ticker.deltaTime; }

  /**
   * 開始処理からの経過時間
   * @readonly
   */
  get elapsedTime() { return this.ticker.elapsedTime; }

  /**
   * 現在の時間（最後の更新処理時のUNIXタイムスタンプ）
   * @readonly
   */
  get currentTime() { return this.ticker.currentTime; }

  /**
   * アプリ開始時間（開始処理時のUNIXタイムスタンプ）
   * @readonly
   */
  get startTime() { return this.ticker.startTime; }

}