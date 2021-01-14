/**
 * @class global.Object
 * Objectの拡張
 */

import { format } from "./string";

/**
 * 関数を追加
 * 
 * @param   {String} name name
 * @param   {Function} fn
 */
export function $method(name, fn) {
  Object.defineProperty(this, name, {
    value: fn,
    enumerable: false,
    writable: true
  });
}

/**
 * @method setter
 * セッターを定義する
 * 
 * @param {string | number | symbol} name
 * @param {any} fn
 */
// Object.prototype.$method("setter", function(name, fn){
export function setter(name, fn) {
  Object.defineProperty(this, name, {
    set: fn,
    enumerable: false,
    configurable: true,
  });
}

/**
 * @method getter
 * ゲッターを定義する
 * 
 * @this {Object}
 * @param {string | number | symbol} name
 * @param {any} fn
 */
// Object.prototype.$method("getter", function(name, fn){
export function getter(name, fn) {
  Object.defineProperty(this, name, {
    get: fn,
    enumerable: false,
    configurable: true,
  });
}

/**
 * @method accessor
 * アクセッサ(セッター/ゲッター)を定義する
 * 
 * @this Object
 * @param {string | number | symbol} name
 * @param {AccessorExtendObject} param
 */
// Object.prototype.$method("accessor", function(name, param) {
export function accessor(name, param) {
  Object.defineProperty(this, name, {
    set: param["set"],
    get: param["get"],
    enumerable: false,
    configurable: true,
  });
}

/**
 * @method forIn
 * オブジェクト用ループ処理
 * 
 * @param {Function} fn
 * @param {any} self
 */
export function forIn(fn, self) {
  self = self || this;

  Object.keys(this).forEach(function(key, index) {
    var value = this[key];

    fn.call(self, key, value, index);
  }, this);

  return this;
}

/**
 * @method  $extend
 * 他のライブラリと競合しちゃうので extend -> $extend としました
 */
export function $extend() {
// Object.prototype.$method("$extend", function() {
  Array.prototype.forEach.call(arguments, function(source) {
    for (var property in source) {
      this[property] = source[property];
    }
  }, this);
  return this;
}

/**
 * @method  $safe
 * 安全拡張
 * 上書きしない
 */
export function $safe(source) {
// Object.prototype.$method("$safe", function(source) {
  Array.prototype.forEach.call(arguments, function(source) {
    for (var property in source) {
      if (this[property] === undefined) this[property] = source[property];
    }
  }, this);
  return this;
}

/**
 * @method $watch
 * 
 * @param  {string} key       [description]
 * @param  {function} callback  [description]
 * @return {void}           [description]
 */
export function $watch(key, callback) {
// Object.prototype.$method('$watch', function(key, callback) {
  var target = this;
  var descriptor = null;

  while(target) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      break;
    }
    target = Object.getPrototypeOf(target);
  }

  // すでにアクセッサーとして存在する場合
  if (descriptor) {
    // データディスクリプタの場合
    if (descriptor.value !== undefined) {
      var tempKey = '__' + key;
      var tempValue = this[key];

      this[tempKey] = tempValue;

      accessor.call(this, key, {
      // this.accessor(key, {
        get: function() {
          return this[tempKey];
        },
        set: function(v) {
          var old = this[tempKey];
          this[tempKey] = v;
          callback.call(this, v, old);
        },
      });
    }
    // アクセサディスクリプタの場合
    else {
      accessor.call(this, key, {
      // this.accessor(key, {
        get: function() {
          return descriptor.get.call(this);
        },
        set: function(v) {
          var old = descriptor.get.call(this);
          descriptor.set.call(this, v);
          callback.call(this, v, old);
        },
      });
    }
  }
  else {
    var accesskey = '__' + key;

    accessor.call(this, key, {
    // this.accessor(key, {
      get: function() {
        return this[accesskey];
      },
      set: function(v) {
        var old = this[accesskey];
        this[accesskey] = v;
        callback.call(this, v, old);
      },
    });
  }
}

// ==========
// 以下ライブラリ内では未使用
// ==========

/**
 * @method property
 * 変数を追加
 * 
 * @param   {String} name name
 * @param   {Object} val
 */
export function property(name, val) {
  Object.defineProperty(this, name, {
    value: val,
    enumerable: true,
    writable: true
  });
}

/**
 * @method $get
 * パス指定で値を取得
 * 
 * @param {string} key
 */
export function $get(key) {
// Object.prototype.$method('$get', function(key) {
  return key.split('.').reduce(function(t, v) {
    return t && t[v];
  }, this);
}

/**
 * @method $set
 * パス指定で値を設定
 * 
 * @param {string} key
 * @param {any} value
 */
export function $set(key, value) {
// Object.prototype.$method('$set', function(key, value) {
  key.split('.').reduce(function(t, v, i, arr) {
    if (i === (arr.length-1)) {
      t[v] = value;
    }
    else {
      if (!t[v]) t[v] = {};
      return t[v];
    }
  }, this);
}

/**
 * @method $has
 * そのプロパティを持っているかを判定する
 * 
 * @param {any} key
 */
export function $has(key) {
// Object.prototype.$method("$has", function(key) {
  return this.hasOwnProperty(key);
}

/**
 * @method  $strict
 * 厳格拡張
 * すでにあった場合は警告
 */
export function $strict(source) {
// Object.prototype.$method("$strict", function(source) {
  Array.prototype.forEach.call(arguments, function(source) {
    for (var property in source) {
      console.assert(!this[property], format.call("tm error: {0} is Already", property));
      // console.assert(!this[property], "tm error: {0} is Already".format(property));
      this[property] = source[property];
    }
  }, this);
  return this;
}

/**
 * @method  $pick
 * ピック
 */
export function $pick() {
// Object.prototype.$method("$pick", function() {
  var temp = {};

  Array.prototype.forEach.call(arguments, function(key) {
    if (key in this) temp[key] = this[key];
  }, this);

  return temp;
}

/**
 * @method  $omit
 * オミット
 */
export function $omit() {
// Object.prototype.$method("$omit", function() {
  var temp = {};

  for (var key in this) {
    if (Array.prototype.indexOf.call(arguments, key) == -1) {
      temp[key] = this[key];
    }
  }

  return temp;
}

/**
 * @method  $toArray
 * 配列化
 */
export function $toArray() {
// Object.prototype.$method("$toArray", function() {
  return Array.prototype.slice.call(this);
}

/**
 * [observe description]
 * @param  {any}   obj      [description]
 * @param  {Function} callback [description]
 * @return {void}            [description]
 */
export function observe(obj, callback) {
// Object.$method('observe', function(obj, callback) {
  if (Object['observe']) return Object['observe'].call(obj, callback); // add
  var keys = Object.keys(obj);
  keys.forEach(function(key) {
    var tempKey = '__' + key;
    var tempValue = obj[key];
    obj[tempKey] = tempValue;
    
    accessor.call(obj, key, {
    // obj.accessor(key, {
      get: function() {
        return this[tempKey];
      },
      set: function(v) {
        this[tempKey] = v;
        callback();
      },
    });
  });
}

/**
 * [unobserve description]
 * @param  {any}   obj      [description]
 * @param  {Function} callback [description]
 * @return {void}            [description]
 */
export function unobserve(obj, callback) {
// Object.$method('unobserve', function(obj, callback) {
  if (Object['unobserve']) return Object['unobserve'].call(obj, callback); // add
  console.assert(false);
}
