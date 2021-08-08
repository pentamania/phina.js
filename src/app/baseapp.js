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
 * _extends phina.util.EventDispatcher
 * 
 * アプリケーションクラスの基底クラス
 */
export class BaseApp extends EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * シーンのスタック
     * @protected
     * @type {SceneTypeUnion[]}
     */
    this._scenes = [new Scene()];

    /**
     * シーンのインデックス値
     * アクティブ中のシーン管理に使用
     * @protected
     * @type {number}
     */
    this._sceneIndex = 0;

    /**
     * 更新処理が有効な状態かどうか
     * @type {boolean}
     */
    this.awake = true;

    /** @type {Updater} */
    this.updater = new Updater(this);

    /** @type {Interactive} */
    this.interactive = new Interactive(this);

    /** @type {Ticker} */
    this.ticker = new Ticker();
    
    /**
     * tickerによって毎フレーム実行されるアプリ内部処理
     * @private
     * @type {import("../util/eventdispatcher").PhinaEventHandler | null}
     */
    this._loopCaller;
  }

  /**
   * アプリケーションを開始
   * 
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
   * 
   * @returns {this}
   */
  kill() {
    this.ticker.stop();
    if (this._loopCaller) this.ticker.untick(this._loopCaller);
    return this;
  }

  /**
   * 指定したシーンに切り替える
   * 
   * @param {SceneTypeUnion} scene
   * @returns {this}
   */
  replaceScene(scene) {
    this.flare('replace');
    this.flare('changescene');

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
   * 指定したsceneに遷移する
   * 
   * replaceSceneとは違い、遷移前のシーンは停止して保持し続ける。
   * そのため、ポーズやオブション画面などの一時的なシーンでの使用に最適
   * 
   * 具体的にはシーンスタックにシーンを追加しつつ、
   * インデックス値を進めることでシーン遷移する
   * 
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
   * 現在のシーンを抜け、直前のシーンに戻る
   * ポーズやオブション画面など、一時的なシーンを抜ける際に使用
   * 
   * pushScene同様、シーンスタックの操作によって
   * アクティブなシーンを切り替える
   * 
   * @returns {Scene | void} 抜けたSceneオブジェクト、処理できなかった場合は何も返さない
   */
  popScene() {
    this.flare('pop');
    this.flare('changescene');

    // Keep rootScene
    if (this._scenes.length <= 1) return;

    var scene = /** @type {Scene} */(this._scenes.pop());
    --this._sceneIndex;

    scene.flare('exit', {
      app: this,
    });
    scene.app = null;

    this.flare('poped');

    this.currentScene.flare('resume', {
      app: this,
      prevScene: scene,
    });

    return scene;
  }

  /**
   * アプリケーションの再開
   * 更新処理の実行を再開する
   * 
   * @returns {this}
   */
  start() {
    this.awake = true;

    return this;
  }

  /**
   * アプリケーションの一時停止
   * 更新処理を実行しないようにする
   * 
   * @returns {this}
   */
  stop() {
    this.awake = false;

    return this;
  }

  /**
   * stats.js( https://github.com/mrdoob/stats.js/ )を実行し、
   * パフォーマンスモニターを表示する
   * 
   * stats.jsがグローバルで読み込まれていない場合、
   * cdnjsからr14版スクリプトを読み込む
   * 
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
   * dat.GUI( https://github.com/dataarts/dat.gui )を初期化し、
   * そのインスタンスをコールバック関数に渡して実行
   * 
   * dat.GUIがグローバルで読み込まれていない場合、
   * cdnjsからv0.5.1版スクリプトを読み込む
   * 
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
   * @protected
   * ループ処理関数
   * 
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
   * @protected
   * 更新処理関数
   * 
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
   * 
   * @virtual
   * @returns {any}
   */
  update() {}

  /**
   * 描画用仮想関数
   * 
   * @virtual
   * @returns {any}
   */
  _draw() {}

  /**
   * 現在アクティブ中のシーン
   */
  get currentScene()   { return this._scenes[this._sceneIndex]; }
  set currentScene(v)  { this._scenes[this._sceneIndex] = v; }

  /**
   * 根本シーン。インスタンス化の際に自動的に設定
   */
  get rootScene()   { return this._scenes[0]; }
  set rootScene(v)  { this._scenes[0] = v; }

  /**
   * 経過フレーム数
   */
  get frame() { return this.ticker.frame; }
  set frame(v) { this.ticker.frame = v; }

  /**
   * Frame per second  
   * 秒間の更新および描画処理回数
   */
  get fps() { return this.ticker.fps; }
  set fps(v) { this.ticker.fps = v; }

  /**
   * 前フレームでの処理にかかった時間
   */
  get deltaTime() { return this.ticker.deltaTime; }

  /**
   * アプリケーション開始からの経過時間
   */
  get elapsedTime() { return this.ticker.elapsedTime; }

  /**
   * 現在の時間（最後の更新時のUNIXタイムスタンプ）
   */
  get currentTime() { return this.ticker.currentTime; }

  /**
   * アプリケーション開始時間（UNIXタイムスタンプ）
   */
  get startTime() { return this.ticker.startTime; }
}