import phina from "../phina";
import { contains, erase, clear, range } from "../core/array";
import { EventDispatcher } from "../util/eventdispatcher"
import { Vector2 } from "../geom/vector2"

/**
 * Gamepad API指定インターフェイス：https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
 * 混同回避のためのエイリアス
 * @typedef {Gamepad} RawGamepad
 */

/**
 * @class phina.input.GamepadManager
 * ゲームパッドマネージャー.
 * ゲームパッド接続状況の監視、個々のゲームパッドの入力状態の更新を行う.
 * _extends phina.util.EventDispatcher
 */
export class GamepadManager extends EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * 作成済みphina.input.Gamepadオブジェクトのリスト
     *
     * @type {Object.<number, PhinaGamepad>}
     */
    this.gamepads = {};

    /**
     * 作成済みゲームパッドのindexのリスト
     * @type {number[]}
     * @private
     */
    this._created = [];

    /**
     * ラップ前Gamepadのリスト
     * @type {RawGamepad[]}
     * @private
     */
    this._rawgamepads = [];

    /**
     * RawGamepadのtimestampとの比較用
     * number[]と一緒？
     * @type {{[i:number]: number}}
     */
    this._prevTimestamps = {};

    /** @type {Function} */
    this._getGamepads = null;

    var global = phina.global
    var navigator = global.navigator;
    if (navigator && navigator.getGamepads) {
      this._getGamepads = navigator.getGamepads.bind(navigator);
    } else if (navigator && navigator['webkitGetGamepads']) {
      this._getGamepads = navigator['webkitGetGamepads'].bind(navigator);
    } else {
      this._getGamepads = function() {};
    }

    global.addEventListener('gamepadconnected', 
    /** @this GamepadManager */
    function(e) {
      var gamepad = this.get(e.gamepad.index);
      gamepad.connected = true;
      this.flare('connected', {
        gamepad: gamepad,
      });
    }.bind(this));

    global.addEventListener('gamepaddisconnected',
    /** @this GamepadManager */
    function(e) {
      var gamepad = this.get(e.gamepad.index);
      gamepad.connected = false;
      this.flare('disconnected', {
        gamepad: gamepad,
      });
    }.bind(this));
  }

  /**
   * 情報更新処理
   * マイフレーム呼んで下さい.
   */
  update() {
    this._poll();

    for (var i = 0, end = this._created.length; i < end; i++) {
      var index = this._created[i];
      var rawgamepad = this._rawgamepads[index];

      if (!rawgamepad) {
        continue;
      }

      if (rawgamepad.timestamp && (rawgamepad.timestamp === this._prevTimestamps[i])) {
        this.gamepads[index]._updateStateEmpty();
        continue;
      }

      this._prevTimestamps[i] = rawgamepad.timestamp;
      this.gamepads[index]._updateState(rawgamepad);
    }
  }

  /**
   * 指定されたindexのGamepadオブジェクトを返す.
   * 未作成の場合は作成して返す.
   * @param {number} [index=0]
   * @returns {PhinaGamepad}
   */
  get(index) {
    index = index || 0;

    if (!this.gamepads[index]) {
      this._created.push(index);
      this.gamepads[index] = new PhinaGamepad(index);
    }

    return this.gamepads[index];
  }

  /**
   * 指定されたindexのGamepadオブジェクトを破棄する.
   * 破棄されたGamepadオブジェクトは以降更新されない.
   * @param {number} index
   * @returns {void}
   */
  dispose(index) {
    if (contains.call(this._created, index)) {
    // if (this._created.contains(index)) {
      var gamepad = this.get(index);
      delete this.gamepads[index];
      erase.call(this._created, index);
      // this._created.erase(index);

      gamepad.connected = false;
    }
  }

  /**
   * 指定されたindexのゲームパッドが接続中かどうかを返す.
   * Gamepadオブジェクトが未作成の場合でも動作する.
   * @param {number} [index=0]
   * @returns {boolean}
   */
  isConnected(index) {
    index = index || 0;

    return this._rawgamepads[index] && this._rawgamepads[index].connected;
  }

  /**
   * @private
   * @returns {void}
   */
  _poll() {
    var rawGamepads = this._getGamepads();
    if (rawGamepads) {
      clear.call(this._rawgamepads);
      // this._rawgamepads.clear();

      for (var i = 0, end = rawGamepads.length; i < end; i++) {
        if (rawGamepads[i]) {
          this._rawgamepads.push(rawGamepads[i]);
        }
      }
    }
  }

  // _static: {
  //   /** ブラウザがGamepad APIに対応しているか. */
  //   isAvailable: (function() {
  //     var nav = phina.global.navigator;
  //     if (!nav) return false;

  //     return (!!nav.getGamepads) || (!!nav.webkitGetGamepads);
  //   })(),
  // }

}

// static props
/** ブラウザがGamepad APIに対応しているか. */
GamepadManager.isAvailable = (function() {
  var nav = phina.global.navigator;
  if (!nav) return false;

  return (!!nav.getGamepads) || (!!nav['webkitGetGamepads']);
})();


/**
 * @typedef {Object} PhinaGamepadButtonState gamepadボタンパラメータ
 * @property {number} value ボタンの状態を表すdouble型の数値 参考：https://developer.mozilla.org/en-US/docs/Web/API/GamepadButton/value
 * @property {*} pressed 0 | 1 (false | true)
 * @property {*} last 0 | 1 (false | true)
 * @property {*} down 0 | 1 (false | true)
 * @property {*} up 0 | 1 (false | true)
 */

/**
 * @class phina.input.Gamepad
 * ゲームパッド
 *
 * 直接インスタンス化せず、phina.input.GamepadManagerオブジェクトから取得して使用する.
 * ※"Gamepad"という名前のインターフェイスがすでに存在するため（https://developer.mozilla.org/en-US/docs/Web/API/Gamepad）、混同回避のためクラス名を変更
 */
class PhinaGamepad {

  /**
   * @param {number} [index=0]
   */
  constructor(index) {
    this.index = index || 0;

    /** @type {PhinaGamepadButtonState[]} */
    // this.buttons = Array.range(0, 16).map(function() {
    this.buttons = range.call([], 0, 16).map(function() {
      return {
        value: 0,
        pressed: false,
        last: false,
        down: false,
        up: false,
      };
    });

    /**
     * アナログスティック傾き管理用
     * @type {Vector2[]}
     */
    this.sticks = range.call([], 0, 2).map(function() {
    // this.sticks = Array.range(0, 2).map(function() {
      return new Vector2(0, 0);
    });
    this.id = null;
    this.connected = false;
    this.mapping = null;
    this.timestamp = null;
  }

  /**
   * ボタンが押されているか.
   * @param {number|string} button ボタンコード数値、あるいはラベル文字列
   * @returns {boolean}
   */
  getKey(button) {
    if (typeof(button) === 'string') {
      button = /** @type {number} */ (PhinaGamepad.BUTTON_CODE[button]);
    }
    if (this.buttons[button]) {
      return this.buttons[button].pressed;
    } else {
      return false;
    }
  }

  /**
   * ボタンを押した.
   * @param {number|string} button ボタンコード数値、あるいはラベル文字列
   * @returns {boolean}
   */
  getKeyDown(button) {
    if (typeof(button) === 'string') {
      button = PhinaGamepad.BUTTON_CODE[button];
    }
    if (this.buttons[button]) {
      return this.buttons[button].down;
    } else {
      return false;
    }
  }

  /**
   * ボタンを離した.
   * @param {number|string} button ボタンコード数値、あるいはラベル文字列
   * @returns {boolean}
   */
  getKeyUp(button) {
    if (typeof(button) === 'string') {
      button = PhinaGamepad.BUTTON_CODE[button];
    }
    if (this.buttons[button]) {
      return this.buttons[button].up;
    } else {
      return false;
    }
  }

  /**
   * 十字キーの入力されている方向を度数単位で返す。
   * @returns {number | null} どの方向にも当てはまらない時はnull
   */
  getKeyAngle() {
    var angle = null;
    var arrowBit =
      (this.getKey('left') ? 1 : 0 << 3) | // 1000
      (this.getKey('up') ? 1 : 0 << 2) | // 0100
      (this.getKey('right') ? 1 : 0 << 1) | // 0010
      (this.getKey('down') ? 1 : 0); // 0001

    if (arrowBit !== 0 && ARROW_BIT_TO_ANGLE_TABLE.hasOwnProperty(arrowBit)) {
      angle = ARROW_BIT_TO_ANGLE_TABLE[arrowBit];
    }

    return angle;
  }

  /**
   * 十字キーの入力されている方向をベクトルで.
   * 正規化されている.
   * @returns {Vector2}
   */
  getKeyDirection() {
    var direction = new Vector2(0, 0);

    if (this.getKey('left')) {
      direction.x = -1;
    } else if (this.getKey('right')) {
      direction.x = 1;
    }
    if (this.getKey('up')) {
      direction.y = -1;
    } else if (this.getKey('down')) {
      direction.y = 1;
    }

    if (direction.x && direction.y) {
      direction.div(Math.SQRT2);
    }

    return direction;
  }

  /**
   * スティックの入力されている方向.
   * @param {number} [stickId=0]
   * @returns {number | null} 該当するstickオブジェクトがない場合はnull
   */
  getStickAngle(stickId) {
    stickId = stickId || 0;
    var stick = this.sticks[stickId];
    return stick ? Math.atan2(-stick.y, stick.x) : null;
  }

  /**
   * スティックの入力されている方向をベクトルで.
   * @param {number} [stickId=0]
   * @returns {Vector2}
   */
  getStickDirection(stickId) {
    stickId = stickId || 0;
    return this.sticks ? this.sticks[stickId].clone() : new Vector2(0, 0);
  }

  /**
   * @param {RawGamepad} gamepad
   */
  _updateState(gamepad) {
    this.id = gamepad.id;
    this.connected = gamepad.connected;
    this.mapping = gamepad.mapping;
    this.timestamp = gamepad.timestamp;

    for (var i = 0, iend = gamepad.buttons.length; i < iend; i++) {
      this._updateButton(gamepad.buttons[i], i);
    }

    for (var j = 0, jend = gamepad.axes.length; j < jend; j += 2) {
      this._updateStick(gamepad.axes[j + 0], j / 2, 'x');
      this._updateStick(gamepad.axes[j + 1], j / 2, 'y');
    }
  }

  /**
   * ボタンの入力状態をリセット
   */
  _updateStateEmpty() {
    for (var i = 0, iend = this.buttons.length; i < iend; i++) {
      this.buttons[i].down = false;
      this.buttons[i].up = false;
    }
  }

   /**
   * @private
   * @param {number | GamepadButton} value
   * @param {number} buttonId
   */
   _updateButton(value, buttonId) {
    if (this.buttons[buttonId] === undefined) {
      this.buttons[buttonId] = {
        value: 0,
        pressed: false,
        last: false,
        down: false,
        up: false,
      };
    }
    
    var button = this.buttons[buttonId];

    button.last = button.pressed;

    if (typeof value === 'object') {
      button.value = value.value;
      button.pressed = value.pressed;
    } else {
      button.value = value;
      button.pressed = value > PhinaGamepad.ANALOGUE_BUTTON_THRESHOLD;
    }

    button.down = (button.pressed ^ button.last) & button.pressed;
    button.up = (button.pressed ^ button.last) & button.last;
  }

  /**
   * @private
   * @param {number} value
   * @param {number} stickId
   * @param {string} axisName
   */
  _updateStick(value, stickId, axisName) {
    if (this.sticks[stickId] === undefined) {
      this.sticks[stickId] = new Vector2(0, 0);
    }
    this.sticks[stickId][axisName] = value;
  }

}

/** ブラウザがGamepad APIに対応しているか. */
PhinaGamepad.isAvailable = (function() {
  var nav = phina.global.navigator;
  if (!nav) return false;

  return (!!nav.getGamepads) || (!!nav['webkitGetGamepads']);
})();

/** アナログ入力対応のボタンの場合、どの程度まで押し込むとonになるかを表すしきい値. */
PhinaGamepad.ANALOGUE_BUTTON_THRESHOLD = 0.5;

/** ボタン名とボタンIDのマップ. */
PhinaGamepad.BUTTON_CODE = {
  'a': 0,
  'b': 1,
  'x': 2,
  'y': 3,

  'l1': 4,
  'r1': 5,
  'l2': 6,
  'r2': 7,

  'select': 8,
  'start': 9,

  'l3': 10,
  'r3': 11,

  'up': 12,
  'down': 13,
  'left': 14,
  'right': 15,

  'special': 16,

  'A': 0,
  'B': 1,
  'X': 2,
  'Y': 3,

  'L1': 4,
  'R1': 5,
  'L2': 6,
  'R2': 7,

  'SELECT': 8,
  'START': 9,

  'L3': 10,
  'R3': 11,

  'UP': 12,
  'DOWN': 13,
  'LEFT': 14,
  'RIGHT': 15,

  'SPECIAL': 16,
}

var ARROW_BIT_TO_ANGLE_TABLE = {
  0x00: null,

  /* @property 下 */
  0x01: 270,
  /* @property 右 */
  0x02: 0,
  /* @property 上 */
  0x04: 90,
  /* @property 左 */
  0x08: 180,

  /* @property 右上 */
  0x06: 45,
  /* @property 右下 */
  0x03: 315,
  /* @property 左上 */
  0x0c: 135,
  /* @property 左下 */
  0x09: 225,

  // 三方向同時押し対応
  // 想定外の操作だが対応しといたほうが無難
  /* @property 右上左 */
  0x0e: 90,
  /* @property 上左下 */
  0x0d: 180,
  /* @property 左下右 */
  0x0b: 270,
  /* @property 下右上 */
  0x07: 0,
};