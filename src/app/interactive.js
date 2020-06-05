import phina from "../phina";
import {erase, clear} from "../core/array"

/**
 * @class phina.app.Interactive
 */
export class Interactive {

  constructor(app) {
    this.app = app;
    this._enable = true;
    this.multiTouch = true;
    this.cursor = {
      normal: '',
      hover: 'pointer',
    };

    this._holds = [];
    this.app.on('changescene', function() {
      clear.call(this._holds);
      // this._holds.clear();
    }.bind(this));
  }

  enable() {
    this._enable = true;
    return this;
  }

  disable() {
    this._enable = false;
    return this;
  }

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

  _checkPoint(obj) {
    if (this.multiTouch) {
      this.app.pointers.forEach(function(p) {
        if (p.id !== null) {
          this.__checkPoint(obj, p);
        }
      }, this);
    }
    else {
      this.__checkPoint(obj, this.app.pointer);
    }
  }

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