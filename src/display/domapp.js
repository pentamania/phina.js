import phina from "../phina";
import {Mouse} from "../input/mouse";
import {Keyboard} from "../input/keyboard";
import {Touch, TouchList} from "../input/touch";
// import {Acclerometer} from "../input/accelerometer"; // TODO later
import {BaseApp} from "../app/baseapp";

/**
 * @class phina.display.DomApp
 * @extends phina.app.BaseApp
 */
export class DomApp extends BaseApp {

  // domElement: null,

  /**
   * @constructor
   */
  constructor(options) {
    super(options);

    if (options.domElement) {
      this.domElement = options.domElement;
    }
    else {
      if (options.query) {
        this.domElement = document.querySelector(options.query);
      }
      else {
        console.assert('error');
      }
    }

    if (options.fps !== undefined) {
      this.fps = options.fps;
    }
    
    if(typeof options.runner === 'function') {
      this.ticker.runner = options.runner;
    }

    this.mouse = new Mouse(this.domElement);
    this.touch = new Touch(this.domElement);
    this.touchList = new TouchList(this.domElement, 5);
    this.keyboard = new Keyboard(document);
    // // 加速度センサーを生成
    // this.accelerometer = phina.input.Accelerometer();

    // ポインタをセット(PC では Mouse, Mobile では Touch)
    this.pointer = this.touch;
    this.pointers = this.touchList.touches;

    this.domElement.addEventListener("touchstart", function () {
      this.pointer = this.touch;
      this.pointers = this.touchList.touches;
    }.bind(this));
    this.domElement.addEventListener("mouseover", function () {
      this.pointer = this.mouse;
      this.pointers = [this.mouse];
    }.bind(this));

    // keyboard event
    this.keyboard.on('keydown', function(e) {
      this.currentScene && this.currentScene.flare('keydown', {
        keyCode: e.keyCode,
      });
    }.bind(this));
    this.keyboard.on('keyup', function(e) {
      this.currentScene && this.currentScene.flare('keyup', {
        keyCode: e.keyCode,
      });
    }.bind(this));
    this.keyboard.on('keypress', function(e) {
      this.currentScene && this.currentScene.flare('keypress', {
        keyCode: e.keyCode,
      });
    }.bind(this));

    // click 対応
    var eventName = phina.isMobile() ? 'touchend' : 'mouseup';
    this.domElement.addEventListener(eventName, this._checkClick.bind(this));

    // 決定時の処理をオフにする(iPhone 時のちらつき対策)
    this.domElement.addEventListener("touchstart", function(e) { e.stop(); });
    this.domElement.addEventListener("touchmove", function(e) { e.stop(); });

    // ウィンドウフォーカス時イベントリスナを登録
    phina.global.addEventListener('focus', function() {
      this.flare('focus');
      this.currentScene.flare('focus');
    }.bind(this), false);
    // ウィンドウブラー時イベントリスナを登録
    phina.global.addEventListener('blur', function() {
      this.flare('blur');
      this.currentScene.flare('blur');
    }.bind(this), false);

    // 更新関数を登録
    this.on('enterframe', function() {
      this.mouse.update();
      this.touch.update();
      this.touchList.update();
      this.keyboard.update();
    });
  }

  _checkClick(e) {
    var _check = function(element) {
      if (element.children.length > 0) {
        element.children.forEach(function(child) {
          _check(child);
        });
      }
      if (element._clicked && element.has('click')) {
        element.flare('click');
      }
      element._clicked = false;
    };

    _check(this.currentScene);
  }

}