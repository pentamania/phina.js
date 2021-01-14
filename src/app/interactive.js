import phina from "../phina";
import {erase, clear} from "../core/array"

/**
 * Interactiveクラスのappとして必要なプロパティ
 * @typedef {{
 *   on: (type: string, listener: function) => any
 *   domElement?: HTMLCanvasElement
 *   pointer?: import('../display/domapp').Pointer
 *   pointers?: import('../display/domapp').Pointer[]
 * }} InteractableApp
 */

/**
 * @class phina.app.Interactive
 */
export class Interactive {

  /**
   * @param {InteractableApp} app 
   */
  constructor(app) {
    this.app = app;
    this._enable = true;
    this.multiTouch = true;
    this.cursor = {
      normal: '',
      hover: 'pointer',
    };

    /** @type {import('./object2d').Object2D[]} */
    this._holds = [];
    this.app.on('changescene', function() {
      clear.call(this._holds);
      // this._holds.clear();
    }.bind(this));
  }

  /**
   * @returns {this}
   */
  enable() {
    this._enable = true;
    return this;
  }

  /**
   * @returns {this}
   */
  disable() {
    this._enable = false;
    return this;
  }

  /**
   * 指定要素のインタラクションチェック開始  
   * @param {import('./element').Element | import('./object2d').Object2D} root Sceneクラスに渡されるため
   */
  check(root) {
    // カーソルのスタイルを反映
    if (this.app.domElement) {
      if (this._holds.length > 0) {
        this.app.domElement.style.cursor = this.cursor.hover;
      }
      else {
        this.app.domElement.style.cursor = this.cursor.normal;
      }
    }

    if (!this._enable || !this.app.pointers) return ;
    this._checkElement(root);
  }

  /**
   * 指定要素のインタラクションチェック  
   * 子供がいれば再帰処理
   * @private
   * @param {import('./element').Element | import('./object2d').Object2D} element 
   */
  _checkElement(element) {
    var app = this.app;

    // 更新するかを判定
    if (element.awake === false) return ;

    // 子供を更新
    var len = element.children.length;
    if (element.children.length > 0) {
      var tempChildren = element.children.slice();
      for (var i=0; i<len; ++i) {
        this._checkElement(tempChildren[i]);
      }
    }

    // タッチ判定
    this._checkPoint(element);
  }

  /**
   * タッチ判定を行う
   * @private
   * @param {import('./element').Element | import('./object2d').Object2D} obj 
   */
  _checkPoint(obj) {
    var _obj = /** @type {import('./object2d').Object2D} */(obj);
    if (this.multiTouch) {
      this.app.pointers.forEach(function(p) {
        if (p.id !== null) {
          this.__checkPoint(_obj, p);
        }
      }, this);
    }
    else {
      this.__checkPoint(_obj, this.app.pointer);
    }
  }

  /**
   * @private
   * @param {import('./object2d').Object2D} obj
   * @param {import('../display/domapp').Pointer} p
   */
  __checkPoint(obj, p) {
    if (!obj.interactive) return ;

    var prevOverFlag = obj._overFlags[p.id];
    var overFlag = obj.hitTest(p.x, p.y);
    obj._overFlags[p.id] = overFlag;

    var e = {
      pointer: p,
      interactive: this,
      over: overFlag,
    };

    if (!prevOverFlag && overFlag) {
      obj.flare('pointover', e);

      if (obj.boundingType && obj.boundingType !== 'none') {
        this._holds.push(obj);
      }
    }
    if (prevOverFlag && !overFlag) {
      obj.flare('pointout', e);
      // this._holds.erase(obj);
      erase.call(this._holds, obj);
    }

    if (overFlag) {
      if (p.getPointingStart()) {
        obj._touchFlags[p.id] = true;
        obj.flare('pointstart', e);
        // クリックフラグを立てる
        obj._clicked = true;
      }
    }

    if (obj._touchFlags[p.id]) {
      obj.flare('pointstay', e);
      if (p._moveFlag) {
        obj.flare('pointmove', e);
      }
    }

    if (obj._touchFlags[p.id]===true && p.getPointingEnd()) {
      obj._touchFlags[p.id] = false;
      obj.flare('pointend', e);

      if (phina.isMobile() && obj._overFlags[p.id]) {
        obj._overFlags[p.id] = false;
        obj.flare('pointout', e);
        // this._holds.erase(obj);
        erase.call(this._holds, obj);
      }
    }
  }

}