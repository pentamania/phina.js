import { EventDispatcher } from "../util/eventdispatcher"

/**
 * @class phina.util.Ticker
 * tick management class
 * _extends phina.util.EventDispatcher
 */
export class Ticker extends EventDispatcher {

  // /** 経過フレーム数 */
  // frame = null

  // /** 1フレームの経過時間 */
  // deltaTime = null
  
  // /** 全体の経過時間 */
  // elapsedTime = null

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @private
     * @type {number}
     */
    this._fps

    this.fps = 30;
    this.frame = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.runner = Ticker.runner;
  }

  /**
   * ティック処理毎に実行されるイベントハンドラを設定
   * @param {import("./eventdispatcher").PhinaEventListener} func 
   */
  tick(func) {
    this.on('tick', func);
  }

  /**
   * イベントハンドラを解除
   * @param {import("./eventdispatcher").PhinaEventListener} func 
   */
  untick(func) {
    this.off('tick', func);
  }

  /**
   * 経過時間を計測・記録しながらティック処理（アプリ更新処理）を行う
   * @returns {number} 次の更新処理までの待ち時間
   */
  run() {
    var now = (new Date()).getTime();
    // 1フレームに掛かった時間
    this.deltaTime = now - this.currentTime;
    // 全体の経過時間
    this.elapsedTime = now - this.startTime;

    var start = this.currentTime = now;
    this.flare('tick');
    var end = (new Date()).getTime();

    // フレームを更新
    this.frame += 1;

    // calculate elapsed time
    var elapsed = end-start;

    // calculate next waiting time
    var delay = Math.max(this.frameTime-elapsed, 0);

    return delay;
  }

  start() {
    var self = this;
    this.isPlaying = true;
    this.startTime = this.currentTime = (new Date()).getTime();
    var fn = function() {
      if (self.isPlaying) {
        var delay = self.run();
        self.runner(fn, delay);
      }
    };
    fn();

    return this;
  }

  resume() {
    // TODO: 
  }

  stop() {
    this.isPlaying = false;
    return this;
  }

  rewind() {
    // TODO: 
  }

  get fps() { return this._fps; }
  set fps(v) {
    this._fps = v;
    this.frameTime = 1000/this._fps;
  }

  /**
   * @param {TimerHandler} run
   * @param {number} delay
   */
  static runner(run, delay) {
    setTimeout(run, delay);
  }
  
}