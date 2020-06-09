/*!
 * phina.js v0.2.3
 * Released under the MIT license
 *
 * Copyright (C) phi
 */
/**
 * @class global.Object
 * Objectの拡張
 */

/**
 * 関数を追加
 * @param   {String} key name
 * @param   {Function} function
 */
function $method(name, fn) {
  Object.defineProperty(this, name, {
    value: fn,
    enumerable: false,
    writable: true
  });
}

/**
 * @method accessor
 * アクセッサ(セッター/ゲッター)を定義する
 */
// Object.prototype.$method("accessor", function(name, param) {
function accessor(name, param) {
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
 */
function forIn(fn, self) {
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
function $extend() {
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
function $safe(source) {
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
 * @param  {string} key       [description]
 * @param  {function} callback  [description]
 * @return {[type]}           [description]
 */
function $watch(key, callback) {
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

/*
 * array.js
 */

/**
 * @property {Object} first
 * 最初の要素
 *
 * ### Example
 *     arr = [6, 5, 2, 3, 1, 4];
 *     arr.first; // => 6
 */
const first = {
// Array.prototype.accessor("first", {
  "get": function()   { return this[0]; },
  "set": function(v)  { this[0] = v; }
};

/**
 * @property {Object} last
 * 最後の要素
 *
 * ### Example
 *     arr = [6, 5, 2, 3, 1, 4];
 *     arr.last; // => 4
 */
const last = {
// Array.prototype.accessor("last", {
  "get": function()   { return this[this.length-1]; },
  "set": function(v)  { this[this.length-1] = v; }
};


/**
 * @method at
 * 指定したインデックスの要素を返します（ループ・負数の指定可）。
 *
 * 添字が負数の場合は末尾からのオフセットとみなします。末尾の要素が -1 番目になります。  
 * 添字の絶対値が Array.length 以上の場合はループします。
 *
 * ### Example
 *     arr = ['a', 'b', 'c', 'd', 'e', 'f'];
 *     arr.at(0);  // => 'a'
 *     arr.at(6);  // => 'a'
 *     arr.at(13); // => 'b'
 *     arr.at(-1); // => 'f'
 *     arr.at(-8); // => 'e'
 *
 * @param {Number} index 添字
 * @return {Object} 添字で指定された要素
 */
function at(i) {
// Array.prototype.$method("at", function(i) {
  i%=this.length;
  i+=this.length;
  i%=this.length;
  return this[i];
}

/**
 * @method erase
 * @chainable
 * 指定したオブジェクトと一致した最初の要素を削除します。
 *
 * ### Example
 *     arr1 = ['a', 'b', 'b', 'c'];
 *     arr2 = arr1.erase('b'); // => ['a', 'b', 'c']
 *     arr1 === arr2;          // => true
 *
 * @param {Object} elm 削除したいオブジェクト
 */
function erase(elm) {
// Array.prototype.$method("erase", function(elm) {
  var index  = this.indexOf(elm);
  if (index >= 0) {
    this.splice(index, 1);
  }
  return this;
}


/**
 * @method clear
 * @chainable
 * 自身を空の配列にします。
 *
 * ### Example
 *     arr = [1, 2, [3, 4]];
 *     arr.clear(); // => []
 */
function clear(deep) {
// Array.prototype.$method("clear", function() {
  this.length = 0;
  return this;
}

/**
 * @method contains
 * 指定した要素が配列に含まれているかをチェックします。
 *
 * 比較には厳密な同値（三重イコール演算子 === で使われるのと同じ方法）を用います。
 *
 * ### Example
 *     arr = [6, 5, 2, 3, 1, 4];
 *     arr.contains(3);     // => true
 *     arr.contains(3, 4);  // => false
 *     arr.contains(3, -4); // => true
 *     arr.contains("6");   // => false
 *
 * @param {Object} item チェックするオブジェクト
 * @param {Number} [fromIndex=0] 検索を始める位置。負数を指定した場合は末尾からのオフセットと見なします。
 * @return {Boolean} チェックの結果
 */
function contains(item, fromIndex) {
// Array.prototype.$method("contains", function(item, fromIndex) {
  return this.indexOf(item, fromIndex) != -1;
}

/**
 * @method clone
 * 自身のコピーを生成して返します。
 *
 * ### Example
 *     arr1 = [1, 2, [3, 4]];
 *     arr2 = arr1.clone();      // => [1, 2, [3, 4]]
 *     arr1[2] === arr2[2];      // => true
 *     arr1[2][0] = 9;
 *     arr2;                     // => [1, 2, [9, 4]]
 *     arr1 = [1, 2, [3, 4]];
 *     arr2 = arr1.clone(true);  // => [1, 2, [3, 4]]
 *     arr1[2] === arr2[2];      // => false
 *     arr1[2][0] = 9;
 *     arr2;                     // => [1, 2, [3, 4]]
 *
 * @param {Boolean} [deep=false] 配列のネストをたどって複製するかどうか
 * @return {Object} 新しい配列
 */
function clone(deep) {
// Array.prototype.$method("clone", function(deep) {
  if (deep === true) ;
  else {
    return Array.prototype.slice.apply(this);
  }
}

/**
 * @method range
 * @chainable
 * 自身を等差数列（一定間隔の整数値の列）とします。
 *
 * - 引数が1つの場合、0～end（end含まず）の整数の配列です。  
 * - 引数が2つの場合、start～end（end含まず）の整数の配列です。  
 * - 引数が3つの場合、start～end（end含まず）かつ start + n * step (nは整数)を満たす整数の配列です。
 *
 * ### Example
 *     arr = [];
 *     arr.range(4);        // => [0, 1, 2, 3]
 *     arr.range(2, 5);     // => [2, 3, 4]
 *     arr.range(2, 14, 5); // => [2, 7, 12]
 *     arr.range(2, -3);    // => [2, 1, 0, -1, -2]
 *
 * @param {Number} start 最初の値（デフォルトは 0）
 * @param {Number} end 最後の値（省略不可）
 * @param {Number} [step=1または-1] 間隔
 */
function range(start, end, step) {
// Array.prototype.$method("range", function(start, end, step) {
  clear.call(this);
  // this.clear();
  
  if (arguments.length == 1) {
    for (var i=0; i<start; ++i) this[i] = i;
  }
  else if (start < end) {
    step = step || 1;
    if (step > 0) {
      for (var i=start, index=0; i<end; i+=step, ++index) {
        this[index] = i;
      }
    }
  }
  else {
    step = step || -1;
    if (step < 0) {
      for (var i=start, index=0; i>end; i+=step, ++index) {
        this[index] = i;
      }
    }
  }
  
  return this;
}


// ==========
// 以下はes2015以降に存在するため、保留
// ==========


// /**
//  * @method find
//  * 各要素を引数にして関数を実行し、その値が真となる（＝条件にマッチする）最初の要素を返します。
//  *
//  * どの要素もマッチしなければ undefined を返します。
//  *
//  * ### Example
//  *     arr = ['foo', 'bar', 'hoge', 'fuga'];
//  *     arr.find( function(elm) {
//  *       return elm.indexOf('a') >= 0;
//  *     });
//  *     // => 'bar'
//  *
//  * @param {Function} callback 各要素に対して実行するコールバック関数
//  * @param {Object} [self=this] callback 内で this として参照される値。デフォルトは呼び出し時の this。
//  * @return {Object} 条件にマッチした最初の要素、または undefined
//  */
// Array.prototype.$method("find", function(fn, self) {
//   var target = null;

//   this.some(function(elm, i) {
//     if (fn.call(self, elm, i, this)) {
//       target = elm;
//       return true;
//     }
//   });

//   return target;
// });

// /**
//  * @method findIndex
//  * 各要素を引数にして関数を実行し、その値が真となる（＝条件にマッチする）最初のインデックスを返します。
//  *
//  * どの要素もマッチしなければ -1 を返します。
//  *
//  * ### Example
//  *     arr = ['foo', 'bar', 'hoge', 'fuga'];
//  *     arr.findIndex( function(elm) {
//  *       return elm.indexOf('a') >= 0;
//  *     });
//  *     // => 1
//  *
//  * @param {Function} callback 各要素に対して実行するコールバック関数
//  * @param {Object} [self=this] callback 内で this として参照される値。デフォルトは呼び出し時の this。
//  * @return {Object} 条件にマッチした最初のインデックス、または -1
//  */
// Array.prototype.$method("findIndex", function(fn, self) {
//   var target = -1;

//   this.some(function(elm, i) {
//     if (fn.call(self, elm, i, this)) {
//       target = i;
//       return true;
//     }
//   });

//   return target;
// });

/**
 * @method of
 * @static
 * ES6 準拠の of 関数です。可変長引数をとって Array オブジェクトにして返します。
 *
 * ### Example
 *     Array.of();        // => []
 *     Array.of(1, 2, 3); // => [1, 2, 3]
 *
 * @param {Object} elementN 生成する配列の要素
 * @return {Array} 生成した配列
 */
// Array.$method("of", function() {
//   return Array.prototype.slice.call(arguments);
// });

/**
 * @method from
 * @static
 * ES6 準拠の from 関数です。array-like オブジェクトかiterable オブジェクトから新しい配列を生成します。
 *
 * array-like オブジェクトとは、length プロパティを持ち、数字の添字でアクセス可能なオブジェクトのことです。
 * 通常の配列のほか、String、arguments、NodeList なども array-like オブジェクトです。
 *
 * iterable オブジェクトとは、Symbol.iterator プロパティを持つオブジェクトのことです。
 * 通常の配列のほか、String、arguments、NodeList なども iterable オブジェクトです。
 *
 * ### Example
 *     Array.from([1, 2, 3], function(elm){ return elm * elm} ); // => [1, 4, 9]
 *     Array.from("foo");                                        // => ["f", "o", "o"]
 *     Array.from( document.querySelectorAll("span"))            // => [Element, Element, Element,...]
 *
 * @param {Object} arrayLike 配列に変換する array-like オブジェクト
 * @param {Function} [callback] arrayLike のすべての要素に対して実行するマップ関数
 * @param {Object} [context] callback 内で this として参照される値
 * @return {Array} 生成した配列
 */
// Array.$method("from", function(arrayLike, callback, context) {
//   if (!Object(arrayLike).length) return [];

//   var result = [];
//   if (Symbol && Symbol.iterator && arrayLike[Symbol.iterator]) {
//       var iterator = arrayLike[Symbol.iterator]();
//       while (true) {
//           var iteratorResult = iterator.next();
//           if (iteratorResult.done) break;

//           var value = typeof callback === 'function' ? callback.bind(context || this)(iteratorResult.value) : iteratorResult.value;
//           result.push(value);
//       }
//       return result;
//   }

//   for (var i = 0, len = arrayLike.length; i < len; i++) {
//       result.push(arrayLike[i]);
//   }
//   return result.map(typeof callback == 'function' ? callback : function(item) {
//     return item;
//   }, context);
// });

/*
 * phina.js namespace
 */
var phina$1 = phina$1 || {};

// 一旦拡張
// $method.call(phina, "hoge", ...)としても良いが、書き換えが大変なため
phina$1.$method = function(...args) {
// phina.prototype.$method = function(...args) { // ng
  return $method.call(this, ...args)
};

// ;(function() {

/**
 * @class phina
 * # phina.js namespace
 * phina.js のネームスペースです。phina.js の提供する機能は（コア拡張以外）全てこのオブジェクトに入っています。
 *
 * ## phina.js のクラス定義について
 *
 * phina.js では独自のクラスシステムを実装しています。
 * phina.js のクラスの特徴としては new 構文を使用しないため、メソッドチェーンがしやすいことや、文字列でクラスを定義したり親クラスを指定したりできる点が挙げられます。
 * 文字列を使用できることで、クラスを定義する段階で親クラスが指定されていなくても、クラスを呼び出す段階で親クラスが定義されていればいいというメリットがあります。
 *
 * クラスの定義には {@link #createClass}, {@link #define} を使用します。詳しい使い方はそれぞれの関数の項を参照してください。
 *
 * ## クラスについての補足
 *
 * phina.js のクラスでは superClass を指定すると以下のメソッドが自動で追加されます。
 *
 * - superInit(): 親クラスのコンストラクタを呼び出す（初期化）
 * - superMethod(): 親クラスのメソッドを呼び出す
 *
 * superInit は引数を変えることで親クラスのコンストラクタを呼ぶときの引数を変えられます。
 * superMethod は一つ目の引数に呼び出したい親クラスのメソッド名を文字列で、二つ目以降に呼び出したいメソッドの引数を渡します。
 *
 * また phina.js のクラスでは以下の特別な役割をもったプロパティ、メソッドが存在します。
 *
 * - _accessor: アクセッサー（ゲッターとセッター）を定義するためのプロパティ
 * - _static: static メンバを定義するためのプロパティ
 * - _defined(): クラスが定義されたときに呼ばれるメソッド
 *
 * ### _accessor の使用例
 *     var Class = phina.createClass({
 *       init: function() {
 *         ...
 *       },
 *
 *       _accessor: function() {
 *         value: {
 *           get: function() {
 *             return this._value;
 *           },
 *
 *           set: function(v) {
 *             this._value = v;
 *             console.log('valueがセットされました！');
 *           }
 *         }
 *       }
 *     });
 *
 * ### _static の使用例
 *     var Class = phina.createClass({
 *       init: function() {
 *         ...
 *       },
 *
 *       _static: {
 *
 *         staticProperty1: 1,
 *         staticProperty2: 2,
 *
 *         staticMethod1: function(){},
 *         staticMethod2: function(){}
 *
 *       }
 *     });
 *
 *     console.log(Class.staticProperty1); // => 1
 *
 * ### _defined の使用例
 *     var Class = phina.createClass({
 *       init: function() {
 *       },
 *
 *       _defined: function() {
 *         console.log('defined!');
 *       }
 *     }); // => defined!
 */

/**
 * @property {String} [VERSION = <%= version %>]
 * phina.js のバージョンです。
 *
 * @member phina
 * @static
 */
phina$1.VERSION = "0.2.3";

/**
 * @method isNode
 * Node.js の module かどうかをチェックします。
 *
 * @member phina
 * @static
 */
phina$1.$method('isNode', function() {
  return (typeof module !== 'undefined');
});

/**
 * @method namespace
 * 引数は関数で、その関数内での this は phina になります。
 *
 * @param {Function} fn 関数
 * @member phina
 * @static
 */
phina$1.$method('namespace', function(fn) {
  fn.call(this);
});

var ns = phina$1.isNode() ? global : window;

/**
 * @property {Object} global
 * Node.js なら global ブラウザなら window を返します。
 * ゲッターのみ定義されています。
 *
 * @member phina
 * @readonly
 * @static
 */
// phina.accessor('global', {
accessor.call(phina$1, 'global', {
  get: function() {
    return ns;
  },
});


/**
 * @method testUA
 * 引数の RegExp オブジェクトとユーザーエージェントを比較して返します。
 *
 * @param {RegExp}
 * @return {Boolean}
 * @member phina
 * @static
 */
phina$1.$method('testUA', function(regExp) {
  if (!phina$1.global.navigator) return false;
  var ua = phina$1.global.navigator.userAgent;
  return regExp.test(ua);
});

/**
 * @method isAndroid
 * Android かどうかを返します。
 *
 * @return {Boolean} Android かどうか
 * @member phina
 * @static
 */
phina$1.$method('isAndroid', function() {
  return phina$1.testUA(/Android/);
});

/**
 * @method isIPhone
 * iPhone かどうかを返します。
 *
 * @return {Boolean} iPhone かどうか
 * @member phina
 * @static
 */
phina$1.$method('isIPhone', function() {
  return phina$1.testUA(/iPhone/);
});

/**
 * @method isIPad
 * iPad かどうかを返します。
 *
 * @return {Boolean} iPad かどうか
 * @member phina
 * @static
 */
phina$1.$method('isIPad', function() {
  return phina$1.testUA(/iPad/);
});

/**
 * @method isIOS
 * iOS かどうかを返します。
 *
 * @return {Boolean} iOS かどうか
 * @member phina
 * @static
 */
phina$1.$method('isIOS', function() {
  return phina$1.testUA(/iPhone|iPad/);
});

/**
 * @method isMobile
 * モバイルかどうかを返します。具体的には Android, iPhone, iPad のいずれかだと true になります。
 *
 * @return {Boolean} モバイルかどうか
 * @member phina
 * @static
 */
phina$1.$method('isMobile', function() {
  return phina$1.testUA(/iPhone|iPad|Android/);
});

// // support node.js
// if (phina.isNode()) {
//   module.exports = phina;
// }

// ns.phina = phina;

// })(this);


phina$1.namespace(function() {

  /**
   * @method createClass
   * クラスを作成する関数です。
   * 親クラスの指定は文字列でも可能です。
   * 何も継承しない場合 superClass の指定は不要です。また、親クラスを継承している場合、コンストラクタ内で this.superInit() を実行して親クラスを初期化することが必須です。
   *
   * ### Example
   *     var Class = phina.createClass({
   * 　　  superClass: 'namespace.Super',//親クラス継承
   *
   * 　　  //メンバ変数
   * 　　  member1: 100,
   * 　　  member2: 'test',
   * 　　  member3: null,
   *
   *
   * 　　  //コンストラクタ
   * 　　  //Class()を呼び出したとき実行される
   * 　　  init: function(a, b){
   * 　　    //スーパークラス(継承したクラス)のinit
   * 　　    this.superInit(a, b);
   * 　　    this.a = a;
   * 　　    this.b = b;
   * 　　  },
   * 　　
   * 　　  //メソッド
   * 　　  method1: function(){},
   * 　　  method2: function(){},
   * 　　
   * 　　});
   *
   * @param {Object}
   * @return {Function} クラス
   * @member phina
   * @static
   */
  phina$1.$method('createClass', function(params) {

    var _class = function() {
      var instance = new _class.prototype._creator();
      _class.prototype.init.apply(instance, arguments);
      return instance;
    };

    if (params.superClass) {
      _class.prototype = Object.create(params.superClass.prototype);
      params.init.owner = _class;
      _class.prototype.superInit = function() {
        this.__counter = this.__counter || 0;

        var superClass = this._hierarchies[this.__counter++];
        var superInit = superClass.prototype.init;
        superInit.apply(this, arguments);

        this.__counter = 0;
      };
      _class.prototype.superMethod = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var name = args.shift();
        this.__counters = this.__counters || {};
        this.__counters[name] = this.__counters[name] || 0;

        var superClass = this._hierarchies[ this.__counters[name]++ ];
        var superMethod = superClass.prototype[name];
        var rst = superMethod.apply(this, args);

        this.__counters[name] = 0;

        return rst;
      };
      _class.prototype.constructor = _class;
    }


    // //
    // params.forIn(function(key, value) {
    //   if (typeof value === 'function') {
    //     _class.$method(key, value);
    //   }
    //   else {
    //     _class.prototype[key] = value;
    //   }
    // });
    // 継承
    $extend.call(_class.prototype, params);
    // _class.prototype.$extend(params);

    // 継承用
    _class.prototype._hierarchies = [];
    var _super = _class.prototype.superClass;
    while(_super) {
      _class.prototype._hierarchies.push(_super);
      _super = _super.prototype.superClass;
    }

    // accessor
    if (params._accessor) {
      forIn.call(params._accessor, function(key, value) {
      // params._accessor.forIn(function(key, value) {
        accessor.call(_class.prototype, key, value);
        // _class.prototype.accessor(key, value);
      });
      // _class.prototype = Object.create(_class.prototype, params._accessor);
    }

    _class.prototype._creator = function() { return this; };
    _class.prototype._creator.prototype = _class.prototype;

    // static property/method
    if (params._static) {
      $extend.call(_class, params._static);
      // _class.$extend(params._static);
    }

    if (params._defined) {
      params._defined.call(_class, _class);
    }

    return _class;
  });

  /**
   * @method using
   * 文字列で定義したパスを使ってオブジェクトを取り出します。パスは , . / \ :: で区切ることができます。
   * {@link #phina.register} で登録したオブジェクトを取り出すときなどに使うと便利な関数です。
   *
   * ### Example
   *     hoge = {
   *       foo: {
   *         bar: {
   *           num: 100
   *         }
   *       }
   *     };
   *     var bar = phina.using('hoge.foo.bar');
   *     console.log(bar.num); // => 100
   *
   * @param {String} path オブジェクトへのパス
   * @return {Object} 取り出したオブジェクト
   * @member phina
   * @static
   */
  phina$1.$method('using', function(path) {
    if (!path) {
      return phina$1.global;
    }

    var pathes = path.split(/[,.\/ ]|::/);
    var current = phina$1.global;

    pathes.forEach(function(p) {
      current = current[p] || (current[p]={});
    });

    return current;
  });

  /**
   * @method register
   * パス指定でオブジェクトを登録する関数です。パスは , . / \ :: で区切ることができます。
   *
   * ### Example
   *     phina.register('hoge.foo.bar', {
   *       num: 100,
   *     });
   *     console.log(hoge.foo.bar.num); // => 100
   *
   * @param {String} path 登録するオブジェクトのパス
   * @param {Object} _class 登録するオブジェクト
   * @return {Object} 登録したオブジェクト
   * @member phina
   * @static
   */
  phina$1.$method('register', function(path, _class) {
    var pathes = path.split(/[,.\/ ]|::/);
    // var className = pathes.last;
    var className = last.get.call(pathes);
    var parentPath = path.substring(0, path.lastIndexOf('.')); // ここを直さないとピリオド区切り以外は無効？
    var parent = phina$1.using(parentPath);

    parent[className] = _class;

    return _class;
  });

  var _classDefinedCallback = {};

  /**
   * @method define
   * クラスを定義する関数です。使い方は {@link #createClass} とほとんど同じです。
   * ただし、引数は2つあり、第一引数は定義するクラスのパスを文字列で渡します。第二引数のオブジェクトは {@link #createClass} の引数と同じようにします。
   * {@link #createClass} と違い、変数に代入する必用がなく、パス指定でクラスを定義できます。
   * 内部的には {@link #register}, {@link #using} を使用しているため、パスは , . / \ :: で区切ることができます。
   *
   * ### Example
   *     phina.define('namespace.Class', {
   *       superClass: 'namespace.Super',//親クラス継承
   *
   *       //メンバ変数
   *       member1: 100,
   *       member2: 'test',
   *       member3: null,
   *
   *
   *       //コンストラクタ
   *       //Class()を呼び出したとき実行される
   *       init: function(a, b){
   *         //スーパークラス(継承したクラス)のinit
   *         this.superInit(a, b);
   *         this.a = a;
   *         this.b = b;
   *       },
   *
   *       //メソッド
   *       method1: function(){},
   *       method2: function(){},
   *
   *     });
   *
   * @param {String} path パス
   * @param {Object} params オブジェクト
   * @return {Function} 定義したクラス
   * @member phina
   * @static
   */
  phina$1.$method('define', function(path, params) {
    if (params.superClass) {
      if (typeof params.superClass === 'string') {
        var _superClass = phina$1.using(params.superClass);
        if (typeof _superClass != 'function') {
          if (!_classDefinedCallback[params.superClass]) {
            _classDefinedCallback[params.superClass] = [];
          }
          _classDefinedCallback[params.superClass].push(function() {
            phina$1.define(path, params);
          });

          return ;
        }
        else {
          params.superClass = _superClass;
        }
      }
      else {
        params.superClass = params.superClass;
      }
    }

    var _class = phina$1.createClass(params);
    accessor.call(_class.prototype, 'className', {
    // _class.prototype.accessor('className', {
      get: function() {
        return path;
      },
    });

    phina$1.register(path, _class);

    if (_classDefinedCallback[path]) {
      _classDefinedCallback[path].forEach(function(callback) {
        callback();
      });
      _classDefinedCallback[path] = null;
    }

    return _class;
  });

  /**
   * @method globalize
   * phina.js が用意している全てのクラスをグローバルに展開します。（具体的には phina が持つオブジェクトが一通りグローバルに展開されます。）
   * この関数を実行することで、いちいち global からたどっていかなくても phina.js の用意しているクラスをクラス名だけで呼び出すことができます。
   *
   * ### Example
   *     phina.globalize();
   *
   * @member phina
   * @static
   */
  phina$1.$method('globalize', function() {
    forIn.call(phina$1, function(key, value) {

      if (typeof value !== 'object') return ;

      forIn.call(value, function(key, value) {
      // value.forIn(function(key, value) {
        // if (phina.global[key]) {
        //   console.log(ns, key);
        //   phina.global['_' + key] = value;
        // }
        // else {
        //   phina.global[key] = value;
        // }
        phina$1.global[key] = value;
      });
    });
  });

  phina$1._mainListeners = [];
  phina$1._mainLoaded = false;

  /**
   * @method main
   * phina.js でプログラミングする際、メインの処理を記述するための関数です。基本的に phina.js でのプログラミングではこの中にプログラムを書いていくことになります。
   *
   * ### Example
   *     phina.main(function() {
   *       //ここにメインの処理を書く
   *     });
   *
   * @param {Function} func メインの処理
   * @member phina
   * @static
   */
  phina$1.$method('main', function(func) {
    if (phina$1._mainLoaded) {
      func();
    }
    else {
      phina$1._mainListeners.push(func);
    }
  });

  var doc = phina$1.global.document;
  if (phina$1.global.addEventListener && doc && doc.readyState !== 'complete') {
    phina$1.global.addEventListener('load', function() {
      var run = function() {
        var listeners = clone.call(phina$1._mainListeners);
        // var listeners = phina._mainListeners.clone();
        clear.call(phina$1._mainListeners);
        // phina._mainListeners.clear();
        listeners.forEach(function(func) {
        // listeners.each(function(func) {
          func();
        });

        // main 内で main を追加している場合があるのでそのチェック
        if (phina$1._mainListeners.length > 0) {
          run();
        }
        else {
          phina$1._mainLoaded = true;
        }
      };
      // ちょっと遅延させる(画面サイズ問題)
      setTimeout(run);
    });
  }
  else {
    phina$1._mainLoaded = true;
  }
});

/**
 * @class phina.util.EventDispatcher
 * # イベントを扱うためのクラス
 * イベントを扱うためのメソッドやプロパティを定義しているクラスです。
 * phina.js が提供するクラスの多くはこの EventDispatcher クラスの子孫となっているため、
 * ほとんどのオブジェクトで容易にイベントを扱うことができます。
 *
 * # 少し説明
 * this.onxxx = function(){}; でもイベントリスナを設定できるが、あまり推奨しない。
 * 呼び出される順序は、まず this.onxxxx が呼び出され、あとは on() で登録した順番。
 * @memberof phina
 */
class EventDispatcher {

  constructor() {
    this._listeners = {};
  }

  /**
   * @method on
   * @chainable
   * イベントリスナを登録します。
   *
   * １つのイベントに対するイベントリスナはいくつでも登録することができます。
   *
   * 標準のイベントを検知するには、オブジェクトの {@link Object2D#interactive} プロパティが true である必要があります。
   * {@link Object2D#interactive} プロパティを設定するには {@link Object2D#setInteractive} メソッドを呼び出してください。
   *
   * また、{@link #flare} や {@link #fire} によって定義したカスタムイベントに対するイベントリスナも登録することが
   * できます。カスタムイベントのイベントリスナは {@link Object2D#interactive} プロパティによらず呼び出されます。
   * なおカスタムイベントのオブジェクトは Event オブジェクトとは異なります。
   *
   * ###Reference
   * 標準のイベントの種類は以下を参照してください。
   * - [Event reference | MDN]( https://developer.mozilla.org/en-US/docs/Web/Events )
   *
   * ### Example
   *     var shape = CircleShape().addChildTo(this).setInteractive(true).setPosition(50, 50);
   *     shape.on("touchstart", function(e){
   *       this.color = "blue";
   *     });
   *
   * @param {String} type イベントの種類
   * @param {Function} listener イベントリスナとなる関数
   * @param {Object} listener.event Event オブジェクト、またはカスタムイベントのオブジェクト
   */
  on(type, listener) {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
    return this;
  }

  /**
   * @method off
   * @chainable
   * イベントリスナを削除します。
   *
   * ある種類のイベントに対するイベントリスナをすべて削除するには {@link #clear} を使用してください。
   *
   * @param {String} type イベントの種類
   * @param {Function} listener イベントリスナ関数
   */
  off(type, listener) {
    var listeners = this._listeners[type];
    var index = listeners.indexOf(listener);
    if (index != -1) {
      listeners.splice(index,1);
    }
    return this;
  }

  /**
   * @method fire
   * @chainable
   * カスタムイベントを表すオブジェクトを指定してカスタムイベントを発火します。
   *
   * @param {Object} event カスタムイベントを表すオブジェクト
   * @param {String} event.type カスタムイベントの名前
   */
   fire(e) {
    e.target = this;
    var oldEventName = 'on' + e.type;
    if (this[oldEventName]) this[oldEventName](e);

    var listeners = this._listeners[e.type];
    if (listeners) {
      // var temp = listeners.clone();
      var temp = listeners.slice(0);
      for (var i=0,len=temp.length; i<len; ++i) {
          temp[i].call(this, e);
      }
    }

    return this;
  }

  /**
   * @method flare
   * @chainable
   * イベント名を指定してカスタムイベントを発火します。
   *
   * param 引数を指定することによりカスタムイベントに任意のプロパティを設定することができます。
   * これにより、呼び出し元がイベントリスナに任意の値を渡すことができます。
   * （ただし target プロパティには必ず自分自身が格納されます。）
   *
   * ### Example
   *     //
   *
   * @param {String} type カスタムイベントの名前
   * @param {Object} [param] カスタムイベントにプロパティを設定するためのオブジェクト
  */
  flare(type, param) {
    var e = {type:type};
    if (param) {
      forIn.call(param, function(key, val) {
      // param.forIn(function(key, val) {
        e[key] = val;
      });
    }
    this.fire(e);

    return this;
  }

  /**
   * @method one
   * @chainable
   * 一度だけ実行されるイベントリスナを登録します。
   *
   * 指定したイベントリスナが一度実行されると、そのイベントリスナは削除されます。それ以外の挙動は {@link #on} と同じです。
   *
   * @param {String} type イベントの種類
   * @param {Function} listener イベントリスナとなる関数
   * @param {Object} listener.event Event オブジェクト、またはカスタムイベントのオブジェクト
   */
  one(type, listener) {
    var self = this;

    var func = function() {
      var result = listener.apply(self, arguments);
      self.off(type, func);
      return result;
    };

    this.on(type, func);

    return this;
  }

  /**
   * @method has
   * イベントリスナが登録されているかどうかを調べます。
   *
   * 指定したイベントの種類に対するイベントリスナが登録されている場合は true、そうでない場合は false を返します。
   *
   * @param {String} type イベントの種類
   * @return {Boolean} 指定したイベントのイベントリスナが登録されているかどうか
   */
  has(type) {
    return (this._listeners[type] !== undefined && this._listeners[type].length !== 0) || !!this['on' + type];
  }

  /**
   * @method clear
   * @chainable
   * ある種類のイベントに対するイベントリスナをすべて削除します。
   *
   * 特定のイベントリスナのみを削除するには {@link #off} を使用してください。
   *
   * @param {String} type イベントの種類
   */
  clear(type) {
    var oldEventName = 'on' + type;
    if (this[oldEventName]) delete this[oldEventName];
    this._listeners[type] = [];
    return this;
  }
}

/**
 * @method addEventListener
 * {@link #on} のエイリアスです。
 */
/**
 * @method removeEventListener
 * {@link #off} のエイリアスです。
 */
/**
 * @method clearEventListener
 * {@link #clear} のエイリアスです。
 */
/**
 * @method hasEventListener
 * {@link #has} のエイリアスです。
 */
/**
 * @method dispatchEvent
 * {@link #fire} のエイリアスです。
 */
/**
 * @method dispatchEventByType
 * {@link #flare} のエイリアスです。
 */
const methodMap = {
  addEventListener: 'on',
  removeEventListener: 'off',
  clearEventListener: 'clear',
  hasEventListener: 'has',
  dispatchEvent: 'fire',
  dispatchEventByType: 'flare',
};
// methodMap.forIn(function(old, name) {
forIn.call(methodMap, function(old, name) {
  // EventDispatcher.prototype.$method(old, phina.util.EventDispatcher.prototype[name]);
  $method.call(EventDispatcher.prototype, old, EventDispatcher.prototype[name]);
});

/**
 * @class phina.util.Flow
 * tick management class
 * @extends phina.util.EventDispatcher
 */
class Flow extends EventDispatcher {

  /**
   * @constructor
   */
  constructor(func, wait) {
    super();

    this.status = 'pending';
    this.resultValue = null;
    this._queue = [];
    this.func = func;

    if (wait !== true) {
      var self = this;
      var resolve = function() {
        self.resolve.apply(self, arguments);
        self.status = 'resolved';
      };
      var reject = function() {
        self.reject.apply(self, arguments);
        self.status = 'rejected';
      };

      this.func(resolve, reject);
    }
  }

  /*
   * 成功
   */
  resolve(arg) {
    this.resultValue = arg;

    // キューに積まれた関数を実行
    this._queue.forEach(function(func) {
      func(this.resultValue);
    }, this);
    // this._queue.clear();
    clear.call(this._queue);
  }

  /*
   * 失敗
   */
  reject() {

  }

  /*
   * 非同期終了時の処理を登録
   */
  then(func) {
    // 成功ステータスだった場合は即実行
    if (this.status === 'resolved') {
      var value = func(this.resultValue);
      return Flow.resolve(value);
    }
    else {
      var flow = new Flow(function(resolve) {
        resolve();
      }, true);

      this._queue.push(function(arg) {
        var resultValue = func(arg);

        if (resultValue instanceof Flow) {
          resultValue.then(function(value) {
            flow.resolve(value);
          });
        }
        else {
          flow.resolve(resultValue);
        }
      });

      return flow;
    }
  }

  static resolve(value) {
    if (value instanceof Flow) {
      return value;
    }
    else {
      var flow = new Flow(function(resolve) {
        resolve(value);
      });
      return flow;
    }
  }

  static all(flows) {
    return new Flow(function(resolve) {
      var count = 0;

      var args = [];

      flows.forEach(function(flow) {
        flow.then(function(d) {
          ++count;
          args.push(d);

          if (count >= flows.length) {
            resolve(args);
          }
        });
      });
    });
  }

}

/**
 * @class phina.util.Ticker
 * tick management class
 * @extends phina.util.EventDispatcher
 */
class Ticker extends EventDispatcher {

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

    this.fps = 30;
    this.frame = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.runner = Ticker.runner;
  }

  tick(func) {
    this.on('tick', func);
  }

  untick(func) {
    this.off('tick', func);
  }

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

  static runner(run, delay) {
    setTimeout(run, delay);
  }
  
}

/**
 * @class phina.util.Random
 * # 乱数を扱うためのクラス
 * 乱数を扱うためのメソッドやプロパティを定義しているクラスです。
 */
class Random {

  /**
   * @property {Number} [seed = 1]
   * 乱数のシードです。
   */
  // seed = 1

  /**
   * @constructor
   * コンストラクタです。引数で {@link #seed} を設定できます。
   * 
   * @param {Number} [seed = (Date.now()) || 1] シード
   */
  constructor(seed) {
    this.seed = seed || (Date.now()) || 1;
  }

  /**
   * @method random
   * 0~1の乱数を返します。実行すると {@link #seed} は変わってしまいます。
   * 
   * @return {Number} 0~1 の乱数
   */
  random() {
    var seed = this.seed;
    seed = seed ^ (seed << 13);
    seed = seed ^ (seed >>> 17);
    seed = (seed ^ (seed << 5));

    this.seed = seed;

    return (seed >>> 0) / phina.util.Random.MAX;
  }

  /**
   * @method randint
   * 指定された範囲内でランダムな整数値を返します。実行すると {@link #seed} は変わってしまいます。
   * 
   * @param {Number} min 範囲の最小値
   * @param {Number} max 範囲の最大値
   * @return {Number} ランダムな整数値
   */
  randint(min, max) {
    return Math.floor( this.random()*(max-min+1) ) + min;
  }

  /**
   * @method randfloat
   * 指定された範囲内でランダムな数値を返します。実行すると {@link #seed} は変わってしまいます。
   * 
   * @param {Number} min 範囲の最小値
   * @param {Number} max 範囲の最大値
   * @return {Number} ランダムな数値
   */
  randfloat(min, max) {
    return this.random()*(max-min)+min;
  }

  /**
   * @method randbool
   * ランダムな真偽値を返します。引数で百分率を指定できます。実行すると {@link #seed} は変わってしまいます。
   * 
   * @param {Number} [perecent = 50] 真になる百分率
   * @return {Boolean} ランダムな真偽値
   */
  randbool(percent) {
    return this.random() < (percent === undefined ? 50 : percent) / 100;
  }

  /**
   * @method randarray
   * 任意の範囲でランダムな整数値を格納した任意の長さの配列を返します。実行すると {@link #seed} は変わってしまいます。
   * 
   * @param {Number} [len = 100] 配列の長さ
   * @param {Number} [min = 0] 範囲の最小値
   * @param {Number} [max = 100] 範囲の最大値
   * @return {Number} ランダムな整数値の入った配列
   */
  randarray(len, min, max) {
    len = len || 100;
    min = min || 0;
    max = max || 100;

    return (len).map(function() {
      return this.randint(min, max);
    }, this);
  }

  get seed() { return this._seed; }
  set seed(v) { this._seed = (v >>> 0) || 1; }

  /**
   * @method getSeed 
   * {@link #seed} の値を取得します。
   * 
   * @return {Number} シード
   * @static
   */
  static getSeed() {
    return this.seed;
  }

  /**
   * @method setSeed
   * {@link #seed} の値をセットします。
   * 
   * @param {Number} [seed = 1] シード
   * @static
   * @chainable
   */
  static setSeed(seed) {
    this.seed = (seed >>> 0) || 1;
    return this;
  }

  /**
   * @method random
   * 0~1の乱数を返します。実行すると {@link #seed} は変わってしまいます。
   * インスタンスメソッドの {@link #random} と同じです。
   * 
   * @return {Number} 0~1 の乱数
   * @static
   */
  static random() {
    this.seed = this.xor32(this.seed);
    return (this.seed >>> 0) / phina.util.Random.MAX;
  }

  /**
   * @method randint
   * 指定された範囲内でランダムな整数値を返します。実行すると {@link #seed} は変わってしまいます。
   * インスタンスメソッドの {@link #randint} と同じです。
   * 
   * @param {Number} min 範囲の最小値
   * @param {Number} max 範囲の最大値
   * @return {Number} ランダムな整数値
   * @static
   */
  static randint(min, max) {
    return phina.global.Math.floor( this.random()*(max-min+1) ) + min;
  }

  /**
   * @method randfloat
   * 指定された範囲内でランダムな数値を返します。実行すると {@link #seed} は変わってしまいます。
   * インスタンスメソッドの {@link #randfloat} と同じです。
   * 
   * @param {Number} min 範囲の最小値
   * @param {Number} max 範囲の最大値
   * @return {Number} ランダムな数値
   * @static
   */
  static randfloat(min, max) {
    return this.random()*(max-min)+min;
  }

  /**
   * @method randbool
   * ランダムな真偽値を返します。引数で百分率を指定できます。実行すると {@link #seed} は変わってしまいます。
   * インスタンスメソッドの {@link #randbool} と同じです。
   * 
   * @param {Number} [perecent = 50] 真になる百分率
   * @return {Number} ランダムな真偽値
   * @static
   */
  static randbool(perecent) {
    return this.randint(0, 99) < (perecent || 50);
  }

  /**
   * @method randarray
   * 任意の範囲でランダムな整数値を格納した任意の長さの配列を返します。実行すると {@link #seed} は変わってしまいます。
   * インスタンスメソッドの {@link #randarray} と同じです。
   * 
   * @param {Number} [len = 100] 配列の長さ
   * @param {Number} [min = 0] 範囲の最小値
   * @param {Number} [max = 100] 範囲の最大値
   * @return {Number} ランダムな整数値の入った配列
   * @static
   */
  static randarray(len, min, max) {
    len = len || 100;
    min = min || 0;
    max = max || 100;

    return (len).map(function() {
      return this.randint(min, max);
    }, this);
  }


  /**
   * @method xor32
   * xorshift を用いて疑似乱数列を生成します。
   * 
   * @param {Number} seed
   * @return {Number} 疑似乱数列
   * @static
   */
  static xor32(seed) {
    seed = seed ^ (seed << 13);
    seed = seed ^ (seed >>> 17);
    seed = (seed ^ (seed << 5));

    return seed;
  }

  /**
   * @method uuid
   * uuid を生成して返します。
   * 
   * @return {String} uuid
   * @static
   */
  //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  static uuid() {
    var d = new Date().getTime();
    if(phina.global.performance && typeof phina.global.performance.now === 'function'){
      d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

}

/**
 * @property {Number} MAX
 * 内部的に使用される定数です。
 * 
 * @static
 */
Random.MAX = 4294967295;

/**
 * @property {Number} [seed = (Date.now())] シード
 * static メソッドの乱数のシードです。
 * 
 * @static
 */
Random.seed = (Date.now());


// prototype拡張はしない
// Math.$method("randint", function(min, max) {
//   return phina.util.Random.randint(min, max);
// });

// Math.$method("randfloat", function(min, max) {
//   return phina.util.Random.randfloat(min, max);
// });

/**
 * @class phina.util.Support
 * 
 */
class Support {}Support.canvas = !!phina$1.global.CanvasRenderingContext2D;
Support.webGL = (function() {
  return !!phina$1.global.CanvasRenderingContext2D && !!document.createElement('canvas').getContext('webgl');
})();
Support.webAudio = !!phina$1.global.AudioContext || !!phina$1.global.webkitAudioContext || !!phina$1.global.mozAudioContext;

/**
 * @class phina.util.Grid
 */
class Grid {

  // /** 幅 */
  // width: 640,
  // /** 列数 */
  // columns: 12,
  // /** ループ */
  // loop: false,
  // /** オフセット値 */
  // offset: 0,

  /**
   * @constructor
   */
  constructor() {
    if (typeof arguments[0] === 'object') {
      var param = arguments[0];
      var width = param.width || 640;
      var columns = param.columns || 12;
      var loop = param.loop || false;
      var offset = param.offset || 0;
    }
    else {
      var width   = arguments[0] || 640;
      var columns = arguments[1] || 12;
      var loop    = arguments[2] || false;
      var offset = arguments[3] || 0;
    }

    this.width = width;
    this.columns = columns;
    this.loop = loop;
    this.offset = offset;
    this.unitWidth = this.width/this.columns;
  }

  // スパン指定で値を取得(負数もok)
  span(index) {
    if (this.loop) {
      index += this.columns;
      index %= this.columns;
    }
    return this.unitWidth * index + this.offset;
  }

  //
  unit() {
    return this.unitWidth;
  }

  center(offset) {
    var index = offset || 0;
    return (this.width/2) + (this.unitWidth * index);
  }

}

/**
 * @class global.Math
 * # 拡張した Math クラス
 * 数学的な処理を扱う Math クラスを拡張しています。
 * 
 * 全てstaticメンバーです。
 */

/**
 * @static
 * @method clamp
 * 指定した値を指定した範囲に収めた結果を返します。
 *
 * ### Example
 *     Math.clamp(120, 0, 640); // => 120
 *     Math.clamp(980, 0, 640); // => 640
 *     Math.clamp(-80, 0, 640); // => 0
 *
 * @param {Number} value 値
 * @param {Number} min  範囲の下限
 * @param {Number} max  範囲の上限
 * @return {Number} 丸めた結果の値
 */
function clamp(value, min, max) {
  return (value < min) ? min : ( (value > max) ? max : value );
}

/**
 * @property DEG_TO_RAD
 * 度をラジアンに変換するための定数です。
 */
var DEG_TO_RAD = Math.PI/180;

/**
 * @class phina.util.Tween
 * @extends phina.util.EventDispatcher
 * 
 */
class Tween extends EventDispatcher {

  /**
   * @constructor
   */
  constructor(target) {
    super();

    this.time = 0;
  }

  fromTo(target, beginProps, finishProps, duration, easing) {
    this.target = target;
    this.beginProps = beginProps;
    this.finishProps = finishProps;
    this.duration = duration || 1000;
    this.easing = easing;

    // setup
    this.changeProps = {};
    for (var key in beginProps) {
        this.changeProps[key] = finishProps[key] - beginProps[key];
    }

    return this;
  }

  to(target, finishProps, duration, easing) {
    var beginProps = {};

    for (var key in finishProps) {
      beginProps[key] = target[key];
    }

    this.fromTo(target, beginProps, finishProps, duration, easing);

    return this;
  }

  from(target, beginProps, duration, easing) {
      var finishProps = {};

      for (var key in beginProps) {
        finishProps[key] = target[key];
        target[key] = beginProps[key];
      }

      this.fromTo(target, beginProps, finishProps, duration, easing);

      return this;
  }

  by(target, props, duration, easing) {
    var beginProps = {};
    var finishProps = {};

    for (var key in props) {
      beginProps[key] = target[key];
      finishProps[key] = target[key] + props[key];
    }

    this.fromTo(target, beginProps, finishProps, duration, easing);

    return this;
  }

  yoyo() {
    var temp = this.beginProps;
    this.beginProps = this.finishProps;
    this.finishProps = temp;
    // this.changeProps.forIn(function(key, value, index) {
    forIn.call(this.changeProps, function(key, value, index) {
      this.changeProps[key] = -value;
      this.target[key] = this.beginProps[key];
    }, this);
    // TODO: easing も反転させる
    // this.easing = easing;
    return this;
  }

  gain(time) {
    this.seek(this.time + time);
  }

  forward(time) {
    this.seek(this.time + time);
  }

  backward(time) {
    this.seek(this.time - time);
  }

  seek(time) {
    // this.time = Math.clamp(time, 0, this.duration);
    this.time = clamp(time, 0, this.duration);

    // this.beginProps.forIn(function(key, value) {
    forIn.call(this.beginProps, function(key, value) {
      var v = this.easing(this.time, value, this.changeProps[key], this.duration);
      this.target[key] = v;
    }, this);

    return this;
  }

  get easing() { return this._easing; }
  set easing(v) {
    this._easing = Tween.EASING[v] || Tween.EASING.default;
  }

}

/**
 * @static
 * イージング
 * ### Reference
 * - <http://coderepos.org/share/wiki/JSTweener>
 * - <http://coderepos.org/share/browser/lang/javascript/jstweener/trunk/src/JSTweener.js>
 * - <http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js>
 * - <http://hosted.zeh.com.br/tweener/docs/en-us/misc/transitions.html>
 */
Tween.EASING = {

  /** default */
  "default": function(t, b, c, d) {
    return c*t/d + b;
  },
  /** linear */
  linear: function(t, b, c, d) {
    return c*t/d + b;
  },
  /** swing */
  swing: function(t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  /** easeInQuad */
  easeInQuad: function(t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  /** easeOutQuad */
  easeOutQuad: function(t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  /** easeInOutQuad */
  easeInOutQuad: function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 *((--t)*(t-2) - 1) + b;
  },
  /** defeInCubic */
  easeInCubic: function(t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  /** easeOutCubic */
  easeOutCubic: function(t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  /** easeInOutCubic */
  easeInOutCubic: function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  /** easeOutInCubic */
  easeOutInCubic: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutCubic(t*2, b, c/2, d);
    return Tween.EASING.easeInCubic((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInQuart */
  easeInQuart: function(t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  /** easeOutQuart */
  easeOutQuart: function(t, b, c, d) {
    return -c *((t=t/d-1)*t*t*t - 1) + b;
  },
  /** easeInOutQuart */
  easeInOutQuart: function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 *((t-=2)*t*t*t - 2) + b;
  },
  /** easeOutInQuart */
  easeOutInQuart: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutQuart(t*2, b, c/2, d);
    return Tween.EASING.easeInQuart((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInQuint */
  easeInQuint: function(t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  /** easeOutQuint */
  easeOutQuint: function(t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  /** easeInOutQuint */
  easeInOutQuint: function(t, b, c, d) {
    if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  /** easeOutInQuint */
  easeOutInQuint: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutQuint(t*2, b, c/2, d);
    return Tween.EASING.easeInQuint((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInSine */
  easeInSine: function(t, b, c, d) {
    return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
  },
  /** easeOutSine */
  easeOutSine: function(t, b, c, d) {
    return c * Math.sin(t/d *(Math.PI/2)) + b;
  },
  /** easeInOutSine */
  easeInOutSine: function(t, b, c, d) {
    return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
  },
  /** easeOutInSine */
  easeOutInSine: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutSine(t*2, b, c/2, d);
    return Tween.EASING.easeInSine((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInExpo */
  easeInExpo: function(t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
  },
  /** easeOutExpo */
  easeOutExpo: function(t, b, c, d) {
    return (t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
  },
  /** easeInOutExpo */
  easeInOutExpo: function(t, b, c, d) {
    if(t==0) return b;
    if(t==d) return b+c;
    if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
    return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
  },
  /** easeOutInExpo */
  easeOutInExpo: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutExpo(t*2, b, c/2, d);
    return Tween.EASING.easeInExpo((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInCirc */
  easeInCirc: function(t, b, c, d) {
    return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
  },
  /** easeOutCirc */
  easeOutCirc: function(t, b, c, d) {
    return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
  },
  /** easeInOutCirc */
  easeInOutCirc: function(t, b, c, d) {
    if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
    return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
  },
  /** easeOutInCirc */
  easeOutInCirc: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutCirc(t*2, b, c/2, d);
    return Tween.EASING.easeInCirc((t*2)-d, b+c/2, c/2, d);
  },
  /** easeInElastic */
  easeInElastic: function(t, b, c, d, a, p) {
    var s;
    if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
    if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
  },
  /** easeOutElastic */
  easeOutElastic: function(t, b, c, d, a, p) {
    var s;
    if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
    if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
    return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
  },
  /** easeInOutElastic */
  easeInOutElastic: function(t, b, c, d, a, p) {
    var s;
    if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
    if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
    if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  /** easeOutInElastic */
  easeOutInElastic: function(t, b, c, d, a, p) {
    if(t < d/2) return Tween.EASING.easeOutElastic(t*2, b, c/2, d, a, p);
    return Tween.EASING.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
  },
  /** easeInBack */
  easeInBack: function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  /** easeOutBack */
  easeOutBack: function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  /** easeInOutBack */
  easeInOutBack: function(t, b, c, d, s) {
    if(s == undefined) s = 1.70158;
    if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  /** easeOutInBack */
  easeOutInBack: function(t, b, c, d, s) {
    if(t < d/2) return Tween.EASING.easeOutBack(t*2, b, c/2, d, s);
    return Tween.EASING.easeInBack((t*2)-d, b+c/2, c/2, d, s);
  },
  /** easeInBounce */
  easeInBounce: function(t, b, c, d) {
    return c - Tween.EASING.easeOutBounce(d-t, 0, c, d) + b;
  },
  /** easeOutBounce */
  easeOutBounce: function(t, b, c, d) {
    if((t/=d) <(1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if(t <(2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if(t <(2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  /** easeInOutBounce */
  easeInOutBounce: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeInBounce(t*2, 0, c, d) * .5 + b;
    else return Tween.EASING.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
  },
  /** easeOutInBounce */
  easeOutInBounce: function(t, b, c, d) {
    if(t < d/2) return Tween.EASING.easeOutBounce(t*2, b, c/2, d);
    return Tween.EASING.easeInBounce((t*2)-d, b+c/2, c/2, d);
  }

};

/**
 * @class phina.util.QueryString
 * 
 */
class QueryString {

  static parse(text, sep, eq, isDecode) {
    text = text || location.search.substr(1);
    sep = sep || '&';
    eq = eq || '=';
    var decode = (isDecode) ? decodeURIComponent : function(a) { return a; };
    return text.split(sep).reduce(function(obj, v) {
      var pair = v.split(eq);
      obj[pair[0]] = decode(pair[1]);
      return obj;
    }, {});
  }

  static stringify(value, sep, eq, isEncode) {
    sep = sep || '&';
    eq = eq || '=';
    var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
    return Object.keys(value).map(function(key) {
      return key + eq + encode(value[key]);
    }).join(sep);
  }
  
}

/**
 * @class global.String
 * # 拡張した String クラス
 */

/**
 * @method format
 * フォーマットに引数を適用した文字列を返します。
 *
 * 引数がオブジェクトの場合、"{プロパティ名}" がオブジェクトのプロパティの値に置き換わります。
 * 指定したプロパティがオブジェクトにない場合は空文字列になります。
 *
 * 第1引数がオブジェクトでなかった場合、"{整数}" が各引数に置き換わります。
 * 指定した値の引数がなかった場合は空文字列になります。
 *
 * ### Example
 *     obj = {r: 128, g: 0, b: 255};
 *     "color: rgb({r}, {g}, {b});".format(obj); // => "color: rgb(128, 0, 255);"
 *
 *     "{0} + {1} = {2}".format(5, 8, (5+8)); // => "5 + 8 = 13"
 *
 * @param {Object} obj パラメータとなるオブジェクト
 * @return {String} 生成した文字列
 */
function format(arg) {
// String.prototype.$method("format", function(arg) {
  // 置換ファンク
  var rep_fn = undefined;
  
  // オブジェクトの場合
  if (typeof arg == "object") {
    /** @ignore */
    rep_fn = function(m, k) {
      if (arg[k] === undefined) {
        return '';
      }
      else {
        return arg[k];
      }
    };
  }
  // 複数引数だった場合
  else {
    var args = arguments;
    /** @ignore */
    rep_fn = function(m, k) {
      var v = args[ parseInt(k) ];
      if (v !== undefined && v !== null) {
        return v;
      }
      else {
        return '';
      }
    };
  }
  
  return this.replace( /\{(\w+)\}/g, rep_fn );
}


/**
 * @method each
 * 各文字を順番に渡しながら関数を繰り返し実行します。
 *
 * ### Example
 *     str = 'abc';
 *     str.each(function(ch) {
 *       console.log(ch);
 *     });
 *     // => 'a'
 *     //    'b'
 *     //    'c'
 *
 * @param {Function} callback 各要素に対して実行するコールバック関数
 * @param {Object} [self=this] callback 内で this として参照される値
 */
function each() {
// String.prototype.$method("each", function() {
  Array.prototype.forEach.apply(this, arguments);
  return this;
}

/**
 * @class phina.util.Color
 * カラークラス
 */
class Color {

  // /** R値 */
  // r: 255,
  // /** G値 */
  // g: 255,
  // /** B値 */
  // b: 255,
  // /** A値 */
  // a: 1.0,

  /**
   * 初期化
   */
  constructor(r, g, b, a) {
    this.r = 255;
    this.g = 255;
    this.b = 255;
    this.a = 1.0;
    this.set.apply(this, arguments);
  }

  /**
   * セッター.
   */
  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = (a !== undefined) ? a : 1.0;
    return this;
  }

  /**
   * 数値によるセッター.
   */
  setFromNumber(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = (a !== undefined) ? a : 1.0;
    return this;
  }

  /**
   * 配列によるセッター
   */
  setFromArray(arr) {
    return this.set.apply(this, arr);
  }

  /**
   * オブジェクトによるセッター
   */
  setFromObject(obj) {
    return this.set(obj.r, obj.g, obj.b, obj.a);
  }

  /**
   * 文字列によるセッター
   */
  setFromString(str) {
    var color = Color.stringToNumber(str);
    return this.set(color[0], color[1], color[2], color[3]);
  }

  /**
   * 賢いセッター
   */
  setSmart() {
    var arg = arguments[0];
    if (arguments.length >= 3) {
      this.set(arguments.r, arguments.g, arguments.b, arguments.a);
    } else if (arg instanceof Array) {
      this.setFromArray(arg);
    } else if (arg instanceof Object) {
      this.setFromObject(arg);
    } else if (typeof(arg) == "string") {
      this.setFromString(arg);
    }
    return this;
  }

  /**
   * CSS 用 16進数文字列に変換
   */
  toStyleAsHex() {
    return format.call("#{0}{1}{2}",
    // return "#{0}{1}{2}".format(
      this.r.toString(16).padding(2, '0'),
      this.g.toString(16).padding(2, '0'),
      this.b.toString(16).padding(2, '0')
    );
  }

  /**
   * CSS 用 RGB文字列に変換
   */
  toStyleAsRGB() {
    return format.call("rgb({r},{g},{b})", {
    // return "rgb({r},{g},{b})".format({
      r: ~~this.r,
      g: ~~this.g,
      b: ~~this.b
    });
  }


  /**
   * CSS 用 RGBA文字列に変換
   */
  toStyleAsRGBA() {
    return format.call("rgba({r},{g},{b},{a})", {
    // return "rgba({r},{g},{b},{a})".format({
      r: ~~this.r,
      g: ~~this.g,
      b: ~~this.b,
      a: this.a
    });
  }

  /**
   * CSS 用 RGBA 文字列に変換
   */
  toStyle() {
    return format.call("rgba({r},{g},{b},{a})", {
    // return "rgba({r},{g},{b},{a})".format({
      r: ~~this.r,
      g: ~~this.g,
      b: ~~this.b,
      a: this.a
    });
  }

  /**
   * @static
   * @member phina.util.Color
   * @method strToNum
   */
  static strToNum(str) {
    return this.stringToNumber(str);
  }

  static stringToNumber(str) {
    var value = null;
    var type = null;

    if (str[0] === '#') {
      type = (str.length == 4) ? "hex111" : "hex222";
    } else if (str[0] === 'r' && str[1] === 'g' && str[2] === 'b') {
      type = (str[3] == 'a') ? "rgba" : "rgb";
    } else if (str[0] === 'h' && str[1] === 's' && str[2] === 'l') {
      type = (str[3] == 'a') ? "hsla" : "hsl";
    }

    if (type) {
      var match_set = MATCH_SET_LIST[type];
      var m = str.match(match_set.reg);
      value = match_set.exec(m);
    } else if (Color.COLOR_LIST[str]) {
      value = Color.COLOR_LIST[str];
    }

    return value;
  }

  /**
   * @static
   * @method
   * hsl を rgb に変換
   */
  static HSLtoRGB(h, s, l) {
    var r, g, b;

    h %= 360;
    h += 360;
    h %= 360;
    s *= 0.01;
    l *= 0.01;

    if (s === 0) {
      var l = Math.round(l * 255);
      return [l, l, l];
    }
    var m2 = (l < 0.5) ? l * (1 + s) : l + s - l * s;
    var m1 = l * 2 - m2;

    // red
    var temp = (h + 120) % 360;
    if (temp < 60) {
      r = m1 + (m2 - m1) * temp / 60;
    } else if (temp < 180) {
      r = m2;
    } else {
      r = m1;
    }

    // green
    temp = h;
    if (temp < 60) {
      g = m1 + (m2 - m1) * temp / 60;
    } else if (temp < 180) {
      g = m2;
    } else if (temp < 240) {
      g = m1 + (m2 - m1) * (240 - temp) / 60;
    } else {
      g = m1;
    }

    // blue
    temp = ((h - 120) + 360) % 360;
    if (temp < 60) {
      b = m1 + (m2 - m1) * temp / 60;
    } else if (temp < 180) {
      b = m2;
    } else if (temp < 240) {
      b = m1 + (m2 - m1) * (240 - temp) / 60;
    } else {
      b = m1;
    }

    return [
      parseInt(r * 255),
      parseInt(g * 255),
      parseInt(b * 255)
    ];
  }

  /**
   * @static
   * @method
   * hsla を rgba に変換
   */
  static HSLAtoRGBA(h, s, l, a) {
    var temp = Color.HSLtoRGB(h, s, l);
    temp[3] = a;
    return temp;
  }

  /**
   * @static
   * @method
   * rgb 値を作成
   */
  static createStyleRGB(r, g, b) {
    return "rgba(" + r + "," + g + "," + b + ")";
  }

  /**
   * @static
   * @method
   * rgba 値を作成
   */
  static createStyleRGBA(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  /**
   * @static
   * @method
   * hsl 値を作成
   */
  static createStyleHSL(h, s, l) {
    return "hsl(" + h + "," + s + "%," + l + "%)";
  }

  /**
   * @static
   * @method
   * hsla 値を作成
   */
  static createStyleHSLA(h, s, l, a) {
    return "hsla(" + h + "," + s + "%," + l + "%," + a + ")";
  }

}

// static props
/**
 * @static
 * カラーリスト
 */
Color.COLOR_LIST = {
  /** @property black */
  "black": [0x00, 0x00, 0x00],
  /** @property silver */
  "silver": [0xc0, 0xc0, 0xc0],
  /** @property gray */
  "gray": [0x80, 0x80, 0x80],
  /** @property white */
  "white": [0xff, 0xff, 0xff],
  /** @property maroon */
  "maroon": [0x80, 0x00, 0x00],
  /** @property red */
  "red": [0xff, 0x00, 0x00],
  /** @property purple */
  "purple": [0x80, 0x00, 0x80],
  /** @property fuchsia */
  "fuchsia": [0xff, 0x00, 0xff],
  /** @property green */
  "green": [0x00, 0x80, 0x00],
  /** @property lime */
  "lime": [0x00, 0xff, 0x00],
  /** @property olive */
  "olive": [0x80, 0x80, 0x00],
  /** @property yellow */
  "yellow": [0xff, 0xff, 0x00],
  /** @property navy */
  "navy": [0x00, 0x00, 0x80],
  /** @property blue */
  "blue": [0x00, 0x00, 0xff],
  /** @property teal */
  "teal": [0x00, 0x80, 0x80],
  /** @property aqua */
  "aqua": [0x00, 0xff, 0xff],
};


var MATCH_SET_LIST = {
  "hex111": {
    reg: /^#(\w{1})(\w{1})(\w{1})$/,
    exec: function(m) {
      return [
        parseInt(m[1] + m[1], 16),
        parseInt(m[2] + m[2], 16),
        parseInt(m[3] + m[3], 16)
      ];
    }
  },
  "hex222": {
    reg: /^#(\w{2})(\w{2})(\w{2})$/,
    exec: function(m) {
      return [
        parseInt(m[1], 16),
        parseInt(m[2], 16),
        parseInt(m[3], 16)
      ];
    }
  },
  "rgb": {
    reg: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
    exec: function(m) {
      return [
        parseInt(m[1]),
        parseInt(m[2]),
        parseInt(m[3])
      ];
    }
  },
  "rgba": {
    reg: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1}(\.{1}\d+)?)\)$/,
    exec: function(m) {
      return [
        parseInt(m[1]),
        parseInt(m[2]),
        parseInt(m[3]),
        parseFloat(m[4])
      ];
    }
  },
  "hsl": {
    reg: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
    exec: function(m) {
      return Color.HSLtoRGB(m[1], m[2], m[3]);
    }
  },
  "hsla": {
    reg: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1}(\.{1}\d+)?)\)$/,
    exec: function(m) {
      return Color.HSLAtoRGBA(m[1], m[2], m[3], m[4]);
    }
  }
};

// 監視オブジェクト
// register で key を登録 (デフォルト値も一緒に？)
// event dispatcher を継承
// event dispatcher って util じゃね？
// register で登録した値を変更したら change イベントが走る


// 名前候補
//  middleman(仲立人)


/**
 * @class phina.util.ChangeDispatcher
 * @extends phina.util.EventDispatcher
 */
class ChangeDispatcher extends EventDispatcher {

  constructor() {
    super();

    this._observe = true;
  }

  register(key, defaultValue) {
    if (arguments.length === 1) {
      var obj = arguments[0];
      forIn.call(obj, function(key, value) {
      // obj.forIn(function(key, value) {
        this.register(key, value);
      }, this);
    }
    else {
      var tempKey = '__' + key;
      this[tempKey] = defaultValue;
      accessor.call(this, key, {
      // this.accessor(key, {
        get: function() {
          return this[tempKey];
        },
        set: function(v) {
          this[tempKey] = v;
          if (this._observe) {
            this.flare('change');
          }
        },
      });
    }
    return this;
  }

  observe() {
    this._observe = true;
  }
  unobserve() {
    this._observe = false;
  }
}

/**
 * @class phina.util.Ajax
 * 
 */
class Ajax {

  static request(options) {
    var data = $safe.call({}, options, Ajax.defaults);
    // var data = ({}).$safe(options, this.defaults);

    var xhr = new XMLHttpRequest();
    var flow = new Flow(function(resolve) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if ([200, 201, 0].indexOf(xhr.status) !== -1) {
            resolve(xhr.response);
          }
        }
      };

      xhr.open(data.type, data.url);
      xhr.responseType = data.responseType;
      xhr.send(null);
    });

    return flow;
  }
  static get(url) {
    return Ajax.request({
      type: 'GET',
      url: url,
    });
  }
  static post(url) {
    return Ajax.request({
      type: 'POST',
      url: url,
    });
  }
  static put(url) {
    return Ajax.request({
      type: 'PUT',
      url: url,
    });
  }
  static del(url) {
    return Ajax.request({
      type: 'DELETE',
      url: url,
    });
  }

}

/** 
 * @static
 * @memberof Ajax
 * @type {Object}
 */
Ajax.defaults = {
  type: 'GET',
  contentType: 'application/x-www-form-urlencoded',
  responseType: 'json',
  data: null,
  url: '',
};

/**
 * @class global.Number
 * # 拡張した Number クラス
 * 数値を扱う Number クラスを拡張しています。
 */

/**
 * @method times
 * 0 から自分自身の数-1まで、カウンタをインクリメントしながら関数を繰り返し実行します。
 *
 * ### Example
 *     arr = [];
 *     (5).times(function(i){
 *       arr.push(i);
 *     }); // => [0, 1, 2, 3, 4]
 *
 * @param {Function} fn コールバック関数
 * @param {Object} [self=this] 関数内で this として参照される値。デフォルトは自分自身。
 */
function times(fn, self) {
// Number.prototype.$method("times",  function(fn, self) {
  self = self || this;
  for (var i=0; i<this; ++i) {
    fn.call(self, i, this);
  }
  return this;
}

/**
 * @method step
 * 自分自身の値から指定した数まで、カウンタを増分させながら関数を繰り返し実行します。
 *
 * 上限値や増分値は float 型を指定することができます。
 *
 * ### Example
 *     var arr = [];
 *     (2.4).step(5.3, 0.8, function(n) {
 *       arr.push(n);
 *      }); // => [2.4, 3.2, 4.0, 4.8]
 *
 * @param {Number} limit カウンタの上限値
 * @param {Number} step カウンタを増分する量
 * @param {Function} fn コールバック関数。引数にカウンタが渡される。
 * @param {Object} [self=this] 関数内で this として参照される値。デフォルトは自分自身。
 */
function step(limit, step, fn, self) {
// Number.prototype.$method("step",  function(limit, step, fn, self) {
  self = self || this;
  for (var i=+this; i<=limit; i+=step) {
    fn.call(self, i, this);
  }
  return this;
}
// Number.prototype.$method("toDegree", function() { return (this*Math.RAD_TO_DEG); });

/**
 * @method toRadian
 * 度をラジアンに変換します。
 *
 * ### Example
 *     (180).toRadian(); // => 3.141592653589793
 *
 * @return {Number} ラジアン
 */
function toRadian() { return this * DEG_TO_RAD; }
// Number.prototype.$method("toRadian", function() { return this*Math.DEG_TO_RAD; });

/**
 * @class phina.geom.Vector2
 * # 2次元ベクトルクラス
 * 2次元のベクトルや座標を表すクラスです。
 */
class Vector2 {

  // /**
  //  * x座標
  //  * @type {Number}
  //  */
  // x = 0

  // /**
  //  * y座標
  //  * @type {Number}
  //  */
  // y = 0

  /**
   * 2次元ベクトルのコンストラクタです。
   *
   * ### Example
   *     v = phina.geom.Vector2(3, 4);
   *
   * @param {Number} [x=0] ベクトルの x 座標
   * @param {Number} [y=0] ベクトルの y 座標
   * @return {phina.geom.Vector2} 2次元ベクトルオブジェクト
   */
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }

  /**
   * @method clone
   * this のコピーを生成して返します。
   *
   * ### Example
   *     v = phina.geom.Vector2(3, 4);
   *     v2 = v.clone();
   *     v2.x == v.x; // => true
   *
   * @return {Object} 生成したベクトル
   */
  clone() {
    return new Vector2(this.x, this.y);
  }

  /**
   * @method equals
   * this の各要素がすべて other と等しいかどうかを返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(5, 6);
   *     v1.equals(v2); // => false
   *
   * @param {phina.geom.Vector2} other 比較する対象のベクトル
   * @return {Boolean} 等しいかどうか
   */
  equals(v) {
    return (this.x === v.x && this.y === v.y);
  }

  /**
   * @method set
   * @chainable
   * this の各要素の値を再設定します。
   *
   * ### Example
   *     v = phina.geom.Vector2(3, 4);
   *     v.set(5, 6);
   *
   * @param {Number} x ベクトルの x 座標
   * @param {Number} y ベクトルの y 座標
   * @return {phina.geom.Vector2} 再設定後のベクトル
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * @method add
   * @chainable
   * this に other を加えます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(5, 6);
   *     v1.add(v2); // => phina.geom.Vector(8, 10)
   *
   * @param {phina.geom.Vector2} other ベクトル
   * @return {phina.geom.Vector2} 加算した結果のベクトル
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * @method sub
   * @chainable
   * this から other を減じます。
   *
   * ベクトルが座標を表す場合は、指定した座標から自分自身へと向かうベクトルが得られます。
   * 
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(1, 5);
   *     v1.sub(v2); // => phina.geom.Vector(2, -1)
   *
   * @param {phina.geom.Vector2} other ベクトル
   * @return {phina.geom.Vector2} 減算した結果のベクトル
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * @method mul
   * @chainable
   * this の各要素に数値 n を乗じます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.mul(3) // => phina.geom.Vector(9, 12)
   *
   * @param {Number} n 乗じる値
   * @return {phina.geom.Vector2} 乗算した結果のベクトル
   */
  mul(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  /**
   * @method div
   * @chainable
   * this の各要素を数値 n で割ります。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(8, 16);
   *     v1.div(2) // => phina.geom.Vector(4, 8)
   *
   * @param {Number} n 割る値
   * @return {phina.geom.Vector2} 除算した結果のベクトル
   */
  div(n) {
    //console.assert(n != 0, "0 division!!");
    n = n || 0.01;
    this.x /= n;
    this.y /= n;
    return this;
  }
  /**
   * @method negate
   * @chainable
   * this の各要素の正負を反転します。
   *
   * this と同じ大きさで方向が逆のベクトルが得られます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, -4);
   *     v1.negate() // => phina.geom.Vector(-3, 4)
   *
   * @return {phina.geom.Vector2} 反転後のベクトル
   */
  negate() {
    this.x = -this.x;
    this.y = -this.y;
    
    return this;
  }

  /**
   * @method dot
   * other との内積を返します。
   *
   * 投影ベクトルを求めたり、類似度の計算に利用することができます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(-2, 2);
   *     v1.dot(v2) // => 2
   *
   * @param {phina.geom.Vector2} other ベクトル
   * @return {Number} 内積
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * @method cross
   * other との外積（クロス積）を返します。
   *
   * 2次元ベクトルでの外積はベクトルでなく数値を返すことに注意してください。
   * other より this 時計回りにあるときは正の値になり、反時計回りにあるときは負の値になります。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(3, 1);
   *     v1.cross(v2) // => -8
   *
   * @param {phina.geom.Vector2} other ベクトル
   * @return {Number} 外積
   */
  cross(v) {
    return (this.x*v.y) - (this.y*v.x);
  }

  /**
   * @method length
   * this の大きさを返します。
   *
   * (memo) magnitude って名前の方が良いかも. 検討中.
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.length(); // => 5
   *
   * @return {Number} ベクトルの大きさ
   */
  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
  
  /**
   * @method lengthSquared
   * this の大きさの自乗を返します。
   *
   * C# の名前を引用（or lengthSquare or lengthSqrt）
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.lengthSquared(); // => 25
   *
   * @return {Number} ベクトルの大きさの自乗
   */
  lengthSquared() {
    return this.x*this.x + this.y*this.y;
  }
  
  /**
   * @method distance
   * this と other を座標とみなしたときの2点間の距離を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     v1.distance(v2); // => 5
   *
   * @param {phina.geom.Vector2} other 座標を表すベクトル
   * @return {Number} 2点間の距離
   */
  distance(v) {
    return Math.sqrt( Math.pow(this.x-v.x, 2) + Math.pow(this.y-v.y, 2) );
  }
  
  /**
   * @method distanceSquared
   * this と other を座標とみなしたときの2点間の距離の自乗を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     v1.distanceSquared(v2); // => 25
   *
   * @param {phina.geom.Vector2} other 座標を表すベクトル
   * @return {Number} 2点間の距離の自乗
   */
  distanceSquared(v) {
    return Math.pow(this.x-v.x, 2) + Math.pow(this.y-v.y, 2);
  }

  /**
   * @method random
   * @chainable
   * 角度が min から max の範囲（度単位）で大きさが len のランダムなベクトルを返します。
   *
   * ### Example
   *     phina.geom.Vector2().random(90, 180, 1); // => phina.geom.Vector2(-0.5, 0.866) など
   *
   * @param {Number} [min=0] 角度（度単位）の下限値
   * @param {Number} [max=360] 角度（度単位）の上限値
   * @param {Number} [len=1] 大きさ
   * @return {phina.geom.Vector2} ランダム化したベクトル
   */
  random(min, max, len) {
    var degree = Random.randfloat(min || 0, max || 360);
    var rad = degree*Math.DEG_TO_RAD;
    var len = len || 1;

    this.x = Math.cos(rad)*len;
    this.y = Math.sin(rad)*len;

    return this;
  }
  
  /**
   * @method normalize
   * @chainable
   * this を正規化します。すなわち、this と同じ方向で大きさが1のベクトルを返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.normalize(); // => phina.geom.Vector2(0.6, 0.8)
   *
   * @return {phina.geom.Vector2} 正規化したベクトル
   */
  normalize() {
    this.div(this.length());
    return this;
  }

  /**
   * @method toString
   * this を JSON 形式で表現した文字列を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.toString(); // => "{x:3, y:4}"
   *
   * @return {String} JSON 文字列
   */
  toString() {
    return "{x:{x}, y:{y}}".format(this);
  }

  /**
   * @method getDirection
   * this のおおよその方向を示した文字列を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v1.getDirection(); // => "up"
   *
   * @return {String} 方向を表す文字列（"up", "right", "down", "left"）
   */
  getDirection() {
    var angle = this.toDegree();
    if (angle < 45) {
      return "right";
    } else if (angle < 135) {
      return "down";
    } else if (angle < 225) {
      return "left"
    } else if (angle < 315) {
      return "up";
    } else {
      return "right";
    }
  }

  /**
   * @method toAngle
   * this と x 軸との角度（ラジアン単位）を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(-2, 0);
   *     v1.toAngle(); // => 3.14159
   *
   * @return {Number} ベクトルの角度（ラジアン単位）
   */
  toAngle() {
    var rad = Math.atan2(this.y, this.x);
    return (rad + Math.PI*2)%(Math.PI*2);
  }
  
  /**
   * @method fromAngle
   * @chainable
   * 角度（ラジアン単位）と大きさを指定してベクトルを設定します。
   *
   * ### Example
   *     phina.geom.Vector2().fromAngle(Math.PI/4, 2); // => phina.geom.Vector2(1.4142, 1.4142)
   *
   * @param {Number} rad 角度（ラジアン単位）
   * @param {Number} [len=1] 大きさ
   * @return {phina.geom.Vector2} ベクトル
   */
  fromAngle(rad, len) {
    len = len || 1;
    this.x = Math.cos(rad)*len;
    this.y = Math.sin(rad)*len;
    
    return this;
  }

  /**
   * @method toDegree
   * this と x 軸との角度（度単位）を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(-2, 2);
   *     v1.toAngle(); // => 135
   *
   * @return {Number} ベクトルの角度（度単位）
   */
  toDegree() {
    return this.toAngle().toDegree();
  }
  
  /**
   * @method fromDegree
   * @chainable
   * 角度（度単位）と大きさを指定してベクトルを設定します。
   *
   * ### Example
   *     phina.geom.Vector2().fromDegree(60, 2); // => phina.geom.Vector2(1, 1.732)
   *
   * @param {Number} deg 角度（度単位）
   * @param {Number} [len=1] 大きさ
   * @return {phina.geom.Vector2} ベクトル
   */
  fromDegree(deg, len) {
    // return this.fromAngle(deg.toRadian(), len);
    return this.fromAngle(toRadian.call(deg), len);
  }

  /**
   * @method rotate
   * @chainable
   * this を回転します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     v1.rotate(Math.PI/2); // => phina.geom.Vector2(-1, 3);
   *
   * @param {Number} rad 角度（ラジアン単位）
   * @param {Number} [center=(0, 0)] 回転の中心座標
   * @return {Number} 回転後のベクトル
   */
  rotate(rad, center) {
    center = center || new Vector2(0, 0);

    var x1 = this.x - center.x;
    var y1 = this.y - center.y;
    var x2 = x1 * Math.cos(rad) - y1 * Math.sin(rad);
    var y2 = x1 * Math.sin(rad) + y1 * Math.cos(rad);
    this.set( center.x + x2, center.y + y2 );

    return this;
  }

  /**
   * @method min
   * @static
   * v1 と v2 の各要素に対し、より小さい方を要素とする新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     v2 = phina.geom.Vector2(-3, 2);
   *     phina.geom.Vector2.min(v1, v2); // phina.geom.Vector2(-3, 1);
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {phina.geom.Vector2} 生成したベクトル
   */
  static min(a, b) {
    return new Vector2(
      (a.x < b.x) ? a.x : b.x,
      (a.y < b.y) ? a.y : b.y
    );
  }

  /**
   * @method max
   * @static
   * 2次元ベクトル v1 と v2 の各要素に対し、より大きい方を要素とする新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     v2 = phina.geom.Vector2(-3, 2);
   *     phina.geom.Vector2.max(v1, v2); // phina.geom.Vector2(3, 2);
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {phina.geom.Vector2} 生成したベクトル
   */
  static max(a, b) {
    return new Vector2(
      (a.x > b.x) ? a.x : b.x,
      (a.y > b.y) ? a.y : b.y
    );
  }

  /**
   * @method add
   * @static
   * v1 に v2 を加算した新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     v2 = phina.geom.Vector2(-3, 2);
   *     phina.geom.Vector2.add(v1, v2); // phina.geom.Vector2(0, 3);
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {phina.geom.Vector2} 加算した結果
   */
  static add(lhs, rhs) {
    return new Vector2(lhs.x+rhs.x, lhs.y+rhs.y);
  }
  
  /**
   * @method sub
   * @static
   * 2次元ベクトル v1 から v2 を減じた新しいベクトルを生成して返します。
   *
   * ベクトルが座標を表す場合、2つ目の座標から1つ目の座標へと向かうベクトルが得られます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     v2 = phina.geom.Vector2(-3, 2);
   *     phina.geom.Vector2.sub(v1, v2); // phina.geom.Vector2(6, -1);
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {phina.geom.Vector2} 減算した結果
   */
  static sub(lhs, rhs) {
    return new Vector2(lhs.x-rhs.x, lhs.y-rhs.y);
  }
  
  /**
   * @method mul
   * @static
   * 2次元ベクトル v の各要素に n を乗じた新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     phina.geom.Vector2.mul(v1, 2); // phina.geom.Vector2(6, 2)
   *
   * @param {phina.geom.Vector2} v ベクトル
   * @param {phina.geom.Vector2} n 乗じる値
   * @return {phina.geom.Vector2} 乗算した結果
   */
  static mul(v, n) {
    return new Vector2(v.x*n, v.y*n);
  }
  
  /**
   * @method div
   * @static
   * 2次元ベクトル v の各要素を n で割った新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     phina.geom.Vector2.div(v1, 2); // phina.geom.Vector2(1.5, 0.5)
   *
   * @param {phina.geom.Vector2} v ベクトル
   * @param {phina.geom.Vector2} n 割る値
   * @return {phina.geom.Vector2} 除算した結果
   */
  static div(v, n) {
    return new Vector2(v.x/n, v.y/n);
  }
  
  /**
   * @method negate
   * @static
   * 2次元ベクトル v を反転した新しいベクトルを生成して返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 1);
   *     phina.geom.Vector2.negate(); // phina.geom.Vector2(-3, -1)
   *
   * @param {phina.geom.Vector2} v ベクトル
   * @return {phina.geom.Vector2} 反転したベクトル
   */
  static negate(v) {
    return new Vector2(-v.x, -v.y);
  }
  
  /**
   * @method dot
   * @static
   * 2次元ベクトル v1 と v2 の内積を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(-2, 2);
   *     phina.geom.Vector2.dot(v1, v2) // => 2
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {phina.geom.Vector2} 内積
   */
  static dot(lhs, rhs) {
    return lhs.x * rhs.x + lhs.y * rhs.y;
  }
  
  /**
   * @method cross
   * @static
   * 2次元ベクトル v1 と v2 の外積（クロス積）を返します。
   *
   * 2次元ベクトルでの外積はベクトルでなく数値を返すことに注意してください。
   * 1つ目のベクトルが2つ目のベクトルより時計回りにあるときは正の値になり、反時計回りにあるときは負の値になります。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(3, 4);
   *     v2 = phina.geom.Vector2(3, 1);
   *     phina.geom.Vector2.cross(v1, v2); // => -8
   *
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @return {Number} 外積
   */
  static cross(lhs, rhs) {
    return (lhs.x*rhs.y) - (lhs.y*rhs.x);
  }
  
  /**
   * @method distance
   * @static
   * v1 と v2 を座標とみなしたときの2点間の距離を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     phina.geom.Vector2.distance(v1, v2); // => 5
   *
   * @param {phina.geom.Vector2} v1 座標を表すベクトル
   * @param {phina.geom.Vector2} v2 座標を表すベクトル
   * @return {Number} 2点間の距離
   */
  static distance(lhs, rhs) {
    return Math.sqrt( Math.pow(lhs.x-rhs.x, 2) + Math.pow(lhs.y-rhs.y, 2) );
  }

  /**
   * @method distanceSquared
   * @static
   * v1 と v2 を座標とみなしたときの2点間の距離の自乗を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     phina.geom.Vector2.distanceSquared(v1, v2); // => 25
   *
   * @param {phina.geom.Vector2} v1 座標を表すベクトル
   * @param {phina.geom.Vector2} v2 座標を表すベクトル
   * @return {Number} 2点間の距離の自乗
   */
  static distanceSquared(lhs, rhs) {
    return Math.pow(lhs.x-rhs.x, 2) + Math.pow(lhs.y-rhs.y, 2);
  }

  /**
   * @method manhattanDistance
   * @static
   * v1 と v2 を座標とみなしたときの2点間のマンハッタン距離（軸に平行に進むときの最短距離）を返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     phina.geom.Vector2.manhattanDistance(v1, v2); // => 7
   *
   * @param {phina.geom.Vector2} v1 座標を表すベクトル
   * @param {phina.geom.Vector2} v2 座標を表すベクトル
   * @return {Number} 2点間のマンハッタン距離
   */
  static manhattanDistance(lhs, rhs) {
    return Math.abs(lhs.x-rhs.x) + Math.abs(lhs.y-rhs.y);
  }
  
  /**
   * @method normal
   * @static
   * v1 と v2 を座標とみなしたときの、v2 から v1 に向かうベクトルに対する法線ベクトルを返します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     phina.geom.Vector2.normal(v1, v2); // => phina.geom.Vector2(4, -3)
   *
   * @param {phina.geom.Vector2} v1 座標を表すベクトル
   * @param {phina.geom.Vector2} v2 座標を表すベクトル
   * @return {phina.geom.Vector2} 法線ベクトル
   */
  static normal(a, b) {
    var temp = Vector2.sub(a, b);

    return new Vector2(-temp.y, temp.x);
  }

  /**
   * @method reflect
   * @static
   * 2次元ベクトル v を壁への入射ベクトルとして、壁に反射した際のベクトル（反射ベクトル）を返します。
   *
   * 壁の向きは法線ベクトル normal によって表します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(4, 3);
   *     normal = phina.geom.Vector2(-1, 1);
   *     phina.geom.Vector2.reflect(v1, normal); // => phina.geom.Vector2(2, 5)
   *
   * @param {phina.geom.Vector2} v 入射ベクトル
   * @param {phina.geom.Vector2} normal 壁の法線ベクトル
   * @return {phina.geom.Vector2} 反射ベクトル
   */
  static reflect(v, normal) {
    var len = Vector2.dot(v, normal);
    var temp= Vector2.mul(normal, 2*len);
    
    return Vector2.sub(v, temp);
  }
  
  /**
   * @method wall
   * @static
   * 2次元ベクトル v を壁への入射ベクトルとして、壁に沿ったベクトル（壁ずりクトル）を返します。
   *
   * 壁の向きは法線ベクトル normal によって表します。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(4, 3);
   *     normal = phina.geom.Vector2(-1, 1);
   *     phina.geom.Vector2.wall(v1, normal); // => phina.geom.Vector2(3, 4)
   *
   * @param {phina.geom.Vector2} v 入射ベクトル
   * @param {phina.geom.Vector2} normal 壁の法線ベクトル
   * @return {phina.geom.Vector2} 壁ずりベクトル
   */
  static wall(v, normal) {
    var len = Vector2.dot(v, normal);
    var temp= Vector2.mul(normal, len);
    
    return Vector2.sub(v, temp);
  }
  
  /**
   * @method lerp
   * @static
   * v1 と v2 を媒介変数 t で線形補間します。
   * t=0.5 で v1 と v2 の中間ベクトルを求めることができます。
   *
   * ### Example
   *     v1 = phina.geom.Vector2(1, 2);
   *     v2 = phina.geom.Vector2(4, 6);
   *     phina.geom.Vector2.lerp(v1, v2, 0.5); // => (2.5, 4)
   *     phina.geom.Vector2.lerp(v1, v2, 0); // => (1, 2)
   *     phina.geom.Vector2.lerp(v1, v2, 1); // => (4, 6)
   * 
   * @param {phina.geom.Vector2} v1 ベクトル
   * @param {phina.geom.Vector2} v2 ベクトル
   * @param {Number} t 媒介変数
   * @return {phina.geom.Vector2} 線形補間の結果
   */
  static lerp(a, b, t) {
    return new Vector2(
      a.x + (b.x-a.x)*t,
      a.y + (b.y-a.y)*t
    );
  }
  
  /**
   * @method slerp
   * @static
   * 補間（未実装）
   */
  static slerp(lhs, rhs, t) {
      // TODO:
      // cos...
  }

  /**
   * @method random
   * @static
   * 角度が min から max の範囲（度単位）で大きさが len のランダムなベクトルを生成して返します。
   *
   * ### Example
   *     phina.geom.Vector2.random(90, 180, 1); // => phina.geom.Vector2(-0.5, 0.866) など
   *
   * @param {Number} [min=0] 角度（度単位）の下限値
   * @param {Number} [max=360] 角度（度単位）の上限値
   * @param {Number} [len=1] 大きさ
   * @return {phina.geom.Vector2} 生成したベクトル
   */
 static random(min, max, len) {
    return new Vector2().random(min, max).mul(len||1);
  }

}

/**
 * @property {Vector2} ZERO ゼロベクトル
 * @readonly
 */
Vector2.ZERO = new Vector2(0, 0);
/**
 * @property {Vector2} LEFT 左方向の単位ベクトル
 * @readonly
 */
Vector2.LEFT = new Vector2(-1, 0);
/**
 * @property {Vector2} RIGHT 右方向の単位ベクトル
 * @readonly
 */
Vector2.RIGHT= new Vector2(1, 0);
/**
 * @property {Vector2} UP 上方向の単位ベクトル
 * @readonly
 */
Vector2.UP   = new Vector2(0, -1);
/**
 * @property {Vector2} DOWN 下方向の単位ベクトル
 * @readonly
 */
Vector2.DOWN = new Vector2(0, 1);

// import { Rect } from "./rect";

/**
 * @class phina.geom.Circle
 * # 円領域を表すクラス
 * キャンバス上の円領域を扱うクラスです。
 * 
 */
class Circle {

  /**
   * @property {Number} x
   * 円の中心の x 座標
   */
  // x: 0,
  /**
   * @property {Number} y
   * 円の中心の y 座標
   */
  // y: 0,
  /**
   * @property {Number} radius
   * 円の半径
   */
  // radius: 32,

  /**
   * @method init
   * 円領域のコンストラクタです。
   *
   * ### Example
   *     circle = phina.geom.Circle(32, 64, 128);
   *
   * @param {Number} x 円の中心の x 座標
   * @param {Number} y 円の中心の y 座標
   * @param {Number} radius 半径
   * @return {phina.geom.Rect} 円領域オブジェクト
   */
  constructor(x, y, radius) {
    this.x = 0;
    this.y = 0;
    this.radius = 32;
    this.set(x, y, radius);
  }

  /**
   * @method set
   * @chainable
   * this の各値を再設定します。
   *
   * ### Example
   *     circle = phina.geom.Circle(32, 64, 128);
   *     circle.set(100, 200, 32);
   *
   * @param {Number} x 円を囲う矩形の左上頂点の x 座標
   * @param {Number} y 円を囲う矩形の左上頂点の x 座標
   * @param {Number} radius 半径
   * @return {phina.geom.Circle} 円領域オブジェクト
   */
  set(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    return this;
  }

  /**
   * @method moveTo
   * @chainable
   * 円領域を座標 (x, y) に移動します。(x, y) は円の中心を表します。
   *
   * ### Example
   *     circle = phina.geom.Circle(300, 300, 40);
   *     circle.left; // => 260
   *     circle.moveTo(100, 100);
   *     circle.left; // => 60
   *
   * @param {Number} x 移動先の x 座標
   * @param {Number} y 移動先の y 座標
   */
  moveTo(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * @method moveBy
   * @chainable
   * 円領域を (x, y) だけ移動します。
   *
   * ### Example
   *     circle = phina.geom.Circle(300, 300, 40);
   *     circle.left; // => 260
   *     circle.moveBy(100, 100);
   *     circle.left; // => 460
   *
   * @param {Number} x 移動量の x 座標
   * @param {Number} y 移動量の y 座標
   */
  moveBy(x, y) {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * @method contains
   * 座標 (x, y) が円領域の中に含まれるかどうかを返します。
   *
   * ### Example
   *     circle = phina.geom.Circle(300, 300, 100);
   *     circle.contains(350, 350); // =>  true
   *     circle.contains(350, 400); // => false
   *
   * @param {Number} x 判定する対象の x 座標
   * @param {Number} y 判定する対象の y 座標
   * @return {Boolean} 指定した座標が円領域の中に含まれるかどうか
   */
  contains(x, y) {
    var lenX = this.x-x;
    var lenY = this.y-y;
    var lenSquared = (lenX*lenX)+(lenY*lenY);

    return lenSquared <= this.radius*this.radius;
  }

  /**
   * @method clone
   * this のコピーを生成して返します。
   *
   * ### Example
   *     circle = phina.geom.Circle(50, 100, 40);
   *     circle2 = circle.clone();
   *     circle2.x == circle.x; // => true
   *
   * @return {Object} 生成した円領域
   */
  clone() {
    return new Circle(this.x, this.y, this.radius);
  }

  /**
   * @method toRect
   * 円に外接する正方形を表す矩形領域を生成して返します。
   *
   * ### Example
   *     circle = phina.geom.Circle(50, 100, 40);
   *     rect = circle.toRect();
   *     rect.x; // => 10
   *     rect.y; // => 60
   *     rect.width; // => 80
   *
   * @return {Object} 生成した矩形領域
   */
  toRect() {
    // 循環参照回避のため、Rect側で定義
    // var size = this.size;
    // return new Rect(this.x - this.radius, this.y - this.radius, size, size);
  }

  /**
   * @method toArray
   * this の各値を要素とする配列を生成して返します。
   *
   * ### Example
   *     circle = phina.geom.Circle(50, 100, 40);
   *     rect.toArray(); // => [50, 100, 40]
   *
   * @return {Number[]} 生成した配列
   */
  toArray() {
    return [this.x, this.y, this.radius];
  }

  /**
   * @property {Number} left
   * @readonly
   * キャンバス左端から円の左端までの距離
   *
   * 現時点では読み取り専用です。
   *
   * ### Example
   *     circle = phina.geom.Circle(200, 300, 100);
   *     circle.left; // => 100
   *     circle.top; // => 200
   *     circle.right; // => 300
   *     circle.bottom; // => 400
   */
  get left()   { return this.x - this.radius; }
  set left(v)  {
    // TODO: 
  }

  /**
   * @property {Number} top
   * @readonly
   * キャンバス上端から円の上端までの距離
   *
   * 現時点では読み取り専用です。
   */
  get top()   { return this.y - this.radius; }
  set top(v)  {
    // TODO: 
  }

  /**
   * @property {Number} right
   * @readonly
   * キャンバス右端から円の右端までの距離
   *
   * 現時点では読み取り専用です。
   */
  get right()   { return this.x + this.radius; }
  set right(v)  {
    // TODO: 
  }

  /**
   * @property {Number} bottom
   * @readonly
   * キャンバス下端から円の下端までの距離
   *
   * 現時点では読み取り専用です。
   */
  get bottom()   { return this.y + this.radius; }
  set bottom(v)  {
    // TODO: 
  }
    
  /**
   * @property {Number} size
   * @readonly
   * 円の直径
   *
   * 現時点では読み取り専用です。
   */
  get size()   { return this.radius*2; }
  set size(v)  {
    // TODO: 検討中
  }
}

/**
 * @class phina.geom.Rect
 * # 矩形領域を表すクラス
 * キャンバス上の矩形領域を扱うクラスです。
 * 
 */
class Rect {

  // /**
  //  * @property {Number} x
  //  * 矩形の左上頂点の x 座標
  //  */
  // x: 0,
  // /**
  //  * @property {Number} y
  //  * 矩形の左上頂点の y 座標
  //  */
  // y: 0,
  // /**
  //  * @property {Number} width
  //  * 矩形の幅
  //  */
  // width: 32,
  // /**
  //  * @property {Number} hight
  //  * 矩形の高さ
  //  */
  // height: 32,

  /**
   * @method init
   * 矩形領域のコンストラクタです。
   *
   * ### Example
   *     rect = phina.geom.Rect(8, 16, 32, 64);
   *
   * @param {Number} x 矩形の左上頂点の x 座標
   * @param {Number} y 矩形の左上頂点の y 座標
   * @param {Number} width 幅
   * @param {Number} height 高さ
   * @return {phina.geom.Rect} 矩形領域オブジェクト
   */
  constructor(x, y, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = 32;
    this.height = 32;
    this.set(x, y, width, height);
  }

  /**
   * @method set
   * @chainable
   * this の各値を再設定します。
   *
   * ### Example
   *     rect = phina.geom.Rect(8, 16, 32, 64);
   *     rect.set(0, 16, 32, 64);
   *
   * @param {Number} x 矩形の左上頂点の x 座標
   * @param {Number} y 矩形の左上頂点の y 座標
   * @param {Number} width 幅
   * @param {Number} height 高さ
   */
  set(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    return this;
  }

  /**
   * @method moveTo
   * @chainable
   * 矩形領域を座標 (x, y) に移動します。
   *
   * ### Example
   *     rect = phina.geom.Rect(8, 16, 32, 64);
   *     rect.centerX; // => 24
   *     rect.moveTo(0, 0);
   *     rect.centerX; // => 16
   *
   * @param {Number} x 移動先の x 座標
   * @param {Number} y 移動先の y 座標
   */
  moveTo(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * @method moveBy
   * @chainable
   * 矩形領域を (x, y) だけ移動します。
   *
   * ### Example
   *     rect = phina.geom.Rect(8, 16, 32, 64);
   *     rect.moveBy(10, -10);
   *     rect.x; // => 18
   *     rect.y; // => 6
   *
   * @param {Number} x 移動量の x 座標
   * @param {Number} y 移動量の y 座標
   */
  moveBy(x, y) {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * @method setSizse
   * @chainable
   * 矩形領域の幅と高さを変更します。
   *
   * ### Example
   *     rect = phina.geom.Rect(8, 16, 32, 64);
   *     rect.setSize(10, 20);
   *     rect.width; // => 10
   *     rect.height; // => 20
   *
   * @param {Number} width 幅
   * @param {Number} height 高さ
   */
  setSize(w, h) {
    this.width = w;
    this.height = h;
    return this;
  }

  /**
   * @method padding
   * @chainable
   * 矩形領域の中にパディング領域を設定します。
   *
   * 矩形領域自体のサイズはパディング領域の分だけ小さくなります。  
   * 幅の指定方法は CSS の padding 指定と同じように時計回りです。  
   * 引数が1つの場合は上下左右の値、引数が2つの場合は上下と左右の値、引数が３つの場合は上、左右、下の値と解釈します。
   *
   * ### Example
   *     rect = phina.geom.Rect(50, 100, 150, 200);
   *     rect.padding(10);
   *     rect.x; // => 60
   *     rect.y; // => 110
   *     rect.width; // => 130
   *     rect.height; // => 180
   *
   * @param {Number} top 上辺のパディング幅
   * @param {Number} right 右辺のパディング幅
   * @param {Number} bottom 下辺のパディング幅
   * @param {Number} left 左辺のパディング幅
   */
  padding(top, right, bottom, left) {
    // css の padding に合わせて時計回りにパラメータ調整
    switch (arguments.length) {
      case 1:
        top = right = bottom = left = arguments[0];
        break;
      case 2:
        top     = bottom = arguments[0];
        right   = left   = arguments[1];
        break;
      case 3:
        top     = arguments[0];
        right   = left = arguments[1];
        bottom  = arguments[2];
        break;
    }
    
    this.x += left;
    this.y += top;
    this.width -= left+right;
    this.height-= top +bottom;
    
    return this;
  }

  /**
   * @method contains
   * 座標 (x, y) が 矩形領域の中に含まれるかどうかを返します。
   *
   * ### Example
   *     rect = phina.geom.Rect(50, 100, 150, 200);
   *     rect.contains(35, 68); // =>  true
   *     rect.contains(200, 68); // => false
   *
   * @param {Number} x 判定する対象の x 座標
   * @param {Number} y 判定する対象の y 座標
   * @return {Boolean} 指定した座標が矩形領域の中に含まれるかどうか
   */
  contains(x, y) {
    return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom;
  }

  /**
   * @method clone
   * this のコピーを生成して返します。
   *
   * ### Example
   *     rect = phina.geom.Rect(50, 100, 150, 200);
   *     rect2 = rect.clone();
   *     rect2.x == rect.x; // => true
   *
   * @return {Object} 生成した矩形領域
   */
  clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  /**
   * @method toCircle
   * 矩形領域内に収まる最大の円領域を生成して返します。
   *
   * ### Example
   *     rect = phina.geom.Rect(32, 64, 100, 200);
   *     circle = rect.toCircle();
   *     circle.x; // => 82
   *     circle.y; // => 164
   *     circle.radius; // => 50
   *
   * @return {Object} 生成した円領域
   */
  toCircle() {
    var radius = ((this.width < this.height) ? this.width : this.height)/2;
    return new Circle(this.centerX, this.centerY, radius);
  }

  /**
   * @method toArray
   * this の各値を要素とする配列を生成して返します。
   *
   * ### Example
   *     rect = phina.geom.Rect(32, 64, 100, 200);
   *     rect.toArray(); // => [32, 64, 100, 200]
   *
   * @return {Number[]} 生成した配列
   */
  toArray() {
    return [this.x, this.y, this.width, this.height];
  }

  /**
   * @property {Number} left
   * キャンバス左端から矩形領域の左辺までの距離
   *
   * left を変更すると矩形領域の幅（width）が自動的に調整されます。
   *
   * ### Example
   *     rect = phina.geom.Rect(32, 64, 100, 200);
   *     rect.left; // => 32
   *     rect.width; // => 100
   *     rect.right; // => 132
   *     
   *     rect.left = 42;
   *     rect.width; // => 90
   */
  get left()   { return this.x; }
  set left(v)  { this.width -= v-this.x; this.x = v; }

  /**
   * @property {Number} top
   * キャンバス上端から矩形領域の上辺までの位置
   *
   * top を変更すると矩形領域の高さ（height）が自動的に調整されます。
   */
  get top()   { return this.y; }
  set top(v)  { this.height -= v-this.y; this.y = v; }

  /**
   * @property {Number} right
   * キャンバス左端から矩形領域の右辺までの距離
   *
   * right を変更すると矩形領域の幅（width）が自動的に調整されます。
   */
  get right()   { return this.x + this.width; }
  set right(v)  { this.width += v-this.right; }

  /**
   * @property {Number} bottom
   * キャンバス上端から矩形領域の下辺までの位置
   *
   * bottom を変更すると矩形領域の高さ（height）が自動的に調整されます。
   */
  get bottom()   { return this.y + this.height; }
  set bottom(v)  { this.height += v-this.bottom; }
  
  /**
   * @property {Number} centerX
   * 矩形領域の x 座標
   *
   * 現時点では読み取り専用です。
   */
  get centerX()   { return this.x + this.width/2; }
  set centerX(v)  {
    // TODO: 検討中
  }
  /**
   * @property {Number} centerY
   * 矩形領域の y 座標
   *
   * 現時点では読み取り専用です。
   */
  get centerY()   { return this.y + this.height/2; }
  set centerY(v)  {
    // TODO: 検討中
  }

}

/**
 * Circle.toRect
 * 循環参照を回避するため、ここで定義
 */
Circle.prototype.toRect = function() {
  var size = this.size;
  return new Rect(this.x - this.radius, this.y - this.radius, size, size);
};

/**
 * @class phina.geom.Matrix33
 * # 行列クラス
 * 3x3の行列を表すクラスです。
 * 
 * <pre>
 * | m00 m01 m02 |
 * | m10 m11 m12 |
 * | m20 m21 m22 |
 * </pre>
 */
class Matrix33 {

  /**
   * @method init
   * マトリックスクラスのコンストラクタです。
   *
   * 引数は m00, m01, m02, m10, m11, m12, m20, m21, m22 の順に指定します。
   * 引数が9個に満たない場合は単位行列を生成します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat2 = phina.geom.Matrix33();
   *     mat1.m00 + mat2.m00; // => 2
   *     mat1.m01 - mat2.m01; // => 2
   *
   * @param {Number...} m00, m01,... 各要素の値
   * @return {phina.geom.Matrix33} 行列オブジェクト
   */
  constructor() {
    if (arguments.length >= 9) {
      this.set.apply(this, arguments);
    }
    else {
      this.identity();
    }
  }

  /**
   * @method set
   * @chainable
   * this の各要素の値を再設定します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat2 = phina.geom.Matrix33();
   *     mat2.set(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat1.toString() == mat2.toString(); // => true
   *
   * @param {Number...} m00, m01,... 各要素の値
   * @return {phina.geom.Matrix33} 行列オブジェクト
   */
  set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    this.m00 = m00; this.m01 = m01; this.m02 = m02;
    this.m10 = m10; this.m11 = m11; this.m12 = m12;
    this.m20 = m20; this.m21 = m21; this.m22 = m22;

    return this;
  }

  /**
   * @method identity
   * @chainable
   * this を単位行列にします。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat2 = phina.geom.Matrix33();
   *     mat1.identity().toString() == mat2.toString(); // => true
   *
   * @return {phina.geom.Matrix33} 単位行列
   */
  identity() {
    this.m00 = 1; this.m01 = 0; this.m02 = 0;
    this.m10 = 0; this.m11 = 1; this.m12 = 0;
    this.m20 = 0; this.m21 = 0; this.m22 = 1;
    return this;
  }

  /**
   * @method clone
   * this のコピーを生成して返します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat2 = mat1.clone();
   *     mat1.toString() == mat2.toString(); // => true
   *     mat1 == mat2; // => false
   *
   * @return {phina.geom.Matrix33} 行列オブジェクト
   */
  clone() {
    return new Matrix33(
      this.m00, this.m01, this.m02,
      this.m10, this.m11, this.m12,
      this.m20, this.m21, this.m22
    );
  }

  /**
   * @method determinant
   * 行列式を返します
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(0, -2, 0, -1, 3, 1, 4, 2, 1);
   *     mat1.determinant(); // => -10
   *     mat1.identity().determinant(); // => 1
   *
   * @return {Number} 行列式
   */
  determinant() {
    var m00 = this.m00; var m01 = this.m01; var m02 = this.m02;
    var m10 = this.m10; var m11 = this.m11; var m12 = this.m12;
    var m20 = this.m20; var m21 = this.m21; var m22 = this.m22;
    
    return m00*m11*m22 + m10*m21*m02 + m01*m12*m20 - m02*m11*m20 - m01*m10*m22 - m12*m21*m00;
  }

  /**
   * @method transpose
   * @chainable
   * 転置行列を返します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat2 = phina.geom.Matrix33(1, 4, 7, 2, 5, 8, 3, 6, 9);
   *     mat1.transpose().toString() == mat2.toString(); // => true
   *
   * @return {phina.geom.Matrix33} 転置行列
   */
  transpose() {
    var swap = function(a, b) {
      var temp = this[a];
      this[a] = this[b];
      this[b] = temp;
    }.bind(this);

    swap('m01', 'm10');
    swap('m02', 'm20');
    swap('m12', 'm21');
    
    return this;
  }

  /**
   * @method invert
   * @chainable
   * 逆行列を返します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(0, -1, 1, -1, 4, -2, 1, 1, 1);
   *     mat2 = mat1.clone().invert();
   *     mat3 = mat1.clone().multiply(mat2);
   *     mat3.toString() == phina.geom.Matrix33.IDENTITY.toString(); // => true
   *
   * @return {phina.geom.Matrix33} 逆行列
   */
  invert() {
    var m00 = this.m00; var m01 = this.m01; var m02 = this.m02;
    var m10 = this.m10; var m11 = this.m11; var m12 = this.m12;
    var m20 = this.m20; var m21 = this.m21; var m22 = this.m22;

    var det = this.determinant();

    // |m00, m01, m02|
    // |m10, m11, m12|
    // |m20, m21, m22|
    this.m00 = (m11*m22-m12*m21)/det;
    this.m01 = (m10*m22-m12*m20)/det*-1;
    this.m02 = (m10*m21-m11*m20)/det;
    
    this.m10 = (m01*m22-m02*m21)/det*-1;
    this.m11 = (m00*m22-m02*m20)/det;
    this.m12 = (m00*m21-m01*m20)/det*-1;
    
    this.m20 = (m01*m12-m02*m11)/det;
    this.m21 = (m00*m12-m02*m10)/det*-1;
    this.m22 = (m00*m11-m01*m10)/det;
    
    this.transpose();
    
    return this;

  }

  /**
   * @method multiply
   * this に other を乗じます。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(0, -1, 1, -1, 4, -2, 1, 1, 1);
   *     mat2 = mat1.clone().invert();
   *     mat3 = mat1.clone().multiply(mat2);
   *     mat3.toString() == phina.geom.Matrix33.IDENTITY.toString(); // => true
   *
   * @param {phina.geom.Matrix33} other 乗じる行列
   * @return {phina.geom.Matrix33} 乗算結果の行列
   */
  multiply(mat) {
    var tm = this.m;
    var om = mat.m;

    var a00 = this.m00, a01 = this.m01, a02 = this.m02;
    var a10 = this.m10, a11 = this.m11, a12 = this.m12;
    var a20 = this.m20, a21 = this.m21, a22 = this.m22;
    var b00 = mat.m00, b01 = mat.m01, b02 = mat.m02;
    var b10 = mat.m10, b11 = mat.m11, b12 = mat.m12;
    var b20 = mat.m20, b21 = mat.m21, b22 = mat.m22;

    this.m00 = a00*b00 + a01*b10 + a02*b20;
    this.m01 = a00*b01 + a01*b11 + a02*b21;
    this.m02 = a00*b02 + a01*b12 + a02*b22;

    this.m10 = a10*b00 + a11*b10 + a12*b20;
    this.m11 = a10*b01 + a11*b11 + a12*b21;
    this.m12 = a10*b02 + a11*b12 + a12*b22;

    this.m20 = a20*b00 + a21*b10 + a22*b20;
    this.m21 = a20*b01 + a21*b11 + a22*b21;
    this.m22 = a20*b02 + a21*b12 + a22*b22;
    
    return this;
  }

  /**
   * @method multiplyVector2
   * this に2次元ベクトル v を乗じます。
   * 2次元ベクトルは (x, y, 1) として乗算します。
   *
   * ### Example
   *     mat = phina.geom.Matrix33(0, -1, 1, -1, 4, -2, 1, 1, 1);
   *     v = phina.geom.Vector2(2, 4)
   *     mat.multiplyVector2(v) // => {x: -3, y: 12}
   *
   * @param {phina.geom.Vector2} v 乗じるベクトル
   * @return {phina.geom.Vector2} 乗算結果のベクトル
   */
  multiplyVector2(v) {
    var vx = this.m00*v.x + this.m01*v.y + this.m02;
    var vy = this.m10*v.x + this.m11*v.y + this.m12;
    
    // return phina.geom.Vector2(vx, vy);
    return new Vector2(vx, vy);
  }

  // 行
  /**
   * @method getRow
   * row 番目の行を配列で返します。row が 0、1、2 のいずれかでなければ null を返します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat1.getRow(0); // [1, 2, 3]
   *     mat1.getRow(1); // [4, 5, 6]
   *     mat1.getRow(9); // null
   *
   * @param {0/1/2} row 行番号
   * @return {Number[]} 行を表す配列
   */
  getRow(row) {
    if ( row === 0 ) {
      return [ this.m00, this.m01, this.m02 ];
    }
    else if ( row === 1 ) {
      return [ this.m10, this.m11, this.m12 ];
    }
    else if ( row === 2 ) {
      return [ this.m20, this.m21, this.m22 ];
    }
    else {
      return null;
    }
  }

  /**
   * @method getCol
   * col 番目の列を配列で返します。col が 0、1、2 のいずれかでなければ null を返します。
   *
   * ### Example
   *     mat1 = phina.geom.Matrix33(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *     mat1.getCol(0); // [1, 4, 7]
   *     mat1.getCol(1); // [2, 5, 8]
   *     mat1.getRow(-1); // null
   *
   * @param {0/1/2} col 列番号
   * @return {Number[]} 列を表す配列
   */
  getCol(col) {
    if ( col === 0 ) {
      return [ this.m00, this.m10, this.m20 ];
    }
    else if ( col === 1 ) {
      return [ this.m01, this.m11, this.m21 ];
    }
    else if ( col === 2 ) {
      return [ this.m02, this.m12, this.m22 ];
    }
    else {
      return null;
    }
  }

  /**
   * @method toString
   * 行列を JSON 形式で表現した文字列を返します。
   *
   * ### Example
   *     v = phina.geom.Vector2(3, 4);
   *     v2 = v.clone();
   *     v2.x == v.x; // => true
   *
   * @return {String} JSON 文字列
   */
  toString() {
    return "|{m00}, {m01}, {m02}|\n|{m10}, {m11}, {m12}|\n|{m20}, {m21}, {m22}|".format(this);
  }

}

/**
 * @property {phina.geom.Matrix33} IDENTITY 単位行列
 * @readonly
 */
Matrix33.IDENTITY = new Matrix33().identity();

/**
* @class phina.geom.Collision
* # 衝突判定用クラス
* 衝突判定のためのクラスです。すべてのメソッドがスタティックメソッドです。
* 
*/
class Collision {

  /**
   * @method testCircleCircle
   * @static
   * 2つの円領域が重なっているかどうかを判定します
   *
   * ### Example
   *     circle1 = phina.geom.Circle(100, 100, 30);
   *     circle2 = phina.geom.Circle(130, 140, 30);
   * phina.geom.Collision.testCircleCircle(circle1, circle2); // => true
   *
   * @param {phina.geom.Circle} circle1 円領域オブジェクト
   * @param {phina.geom.Circle} circle2 円領域オブジェクト
   * @return {Boolean} 領域が重なっているかどうか
   */
  static testCircleCircle(circle0, circle1) {
    var distanceSquared = phina.geom.Vector2.distanceSquared(circle0, circle1);
    return distanceSquared <= Math.pow(circle0.radius + circle1.radius, 2);
  }
  /**
   * @method testRectRect
   * @static
   * 2つの矩形領域が重なっているかどうかを判定します
   *
   * ### Example
   *     rect1 = phina.geom.Rect(100, 100, 30, 40);
   *     rect2 = phina.geom.Rect(200, 200, 10, 10);
   *     phina.geom.Collision.testRectRect(rect1, rect2); // => false
   *
   * @param {phina.geom.Rect} rect1 矩形領域オブジェクト
   * @param {phina.geom.Rect} rect2 矩形領域オブジェクト
   * @return {Boolean} 領域が重なっているかどうか
   */
  static testRectRect(rect0, rect1) {
    return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
      (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
  }
  /**
   * @method testCircleRect
   * @static
   * 円領域と矩形領域が重なっているかどうかかを判定します
   *
   * ### Example
   *     circle = phina.geom.Circle(100, 100, 30);
   *     rect = phina.geom.Rect(100, 100, 30, 40);
   *     phina.geom.Collision.testCircleRect(circle, rect); // => true
   *
   * @param {phina.geom.Circle} circle 円領域オブジェクト
   * @param {phina.geom.Rect} rect 矩形領域オブジェクト
   * @return {Boolean} 領域が重なっているかどうか
   */
  static testCircleRect(circle, rect) {
    // まずは大きな矩形で判定(高速化)
    var bigRect = phina.geom.Rect(rect.left-circle.radius, rect.top-circle.radius, rect.width+circle.radius*2, rect.height+circle.radius*2);
    if (bigRect.contains(circle.x, circle.y) === false) {
      return false;
    }
    
    // 2種類の矩形と衝突判定
    var r = phina.geom.Rect(rect.left-circle.radius, rect.top, rect.width+circle.radius*2, rect.height);
    if (r.contains(circle.x, circle.y)) {
      return true;
    }
    r.set(rect.left, rect.top-circle.radius, rect.width, rect.height+circle.radius*2);
    if (r.contains(circle.x, circle.y)) {
      return true;
    }
    
    // 円と矩形の４点の判定
    var c = phina.geom.Circle(circle.x, circle.y, circle.radius);
    // left top
    if (c.contains(rect.left, rect.top)) {
      return true;
    }
    // right top
    if (c.contains(rect.right, rect.top)) {
      return true;
    }
    // right bottom
    if (c.contains(rect.right, rect.bottom)) {
      return true;
    }
    // left bottom
    if (c.contains(rect.left, rect.bottom)) {
      return true;
    }
    
    return false;
  }
  /**
   * @method testCircleLine
   * @static
   * 円領域と線分が重なっているかどうかを判定します
   *
   * ### Example
   *     circle = phina.geom.Circle(100, 100, 20);
   *     p1 = phina.geom.Vector2(0, 0);
   *     p2 = phina.geom.Vector2(300, 400);
   *     phina.geom.Collision.testCircleLine(circle, p1, p2); // => true
   *
   * @param {phina.geom.Circle} circle 円領域オブジェクト
   * @param {phina.geom.Vector2} p1 線分の端の座標
   * @param {phina.geom.Vector2} p2 線分の端の座標
   * @return {Boolean} 円領域と線分が重なっているかどうか
   */
  static testCircleLine (circle, p1, p2) {
    // 先に線分端との判定
    if (circle.contains(p1.x, p1.y) || circle.contains(p2.x, p2.y)) return true;
    // 半径の2乗
    var r2 = circle.radius * circle.radius;
    // 円の中心座標
    var p3 = phina.geom.Vector2(circle.x, circle.y);
    // 各ベクトル
    var p1p2 = phina.geom.Vector2.sub(p1, p2);
    var p1p3 = phina.geom.Vector2.sub(p1, p3);
    var p2p3 = phina.geom.Vector2.sub(p2, p3);
    // 外積
    var cross = phina.geom.Vector2.cross(p1p2, p1p3);
    // 外積の絶対値の2乗
    var cross2 = cross * cross;
    // p1p2の長さの2乗
    var length2 = p1p2.lengthSquared();
    // 円の中心から線分までの垂線の距離の2乗
    var d2 = cross2 / length2;
    // 円の半径の2乗より小さいなら重複
    if (d2 <= r2) {
      var dot1 = phina.geom.Vector2.dot(p1p3, p1p2);
      var dot2 = phina.geom.Vector2.dot(p2p3, p1p2);
      // 通常は内積の乗算
      if (dot1 * dot2 <= 0) return true;
    }
    return false;
  }
  /**
   * @method testLineLine
   * @static
   * 2つの線分が重なっているかどうかを判定します
   * 参考：http://www5d.biglobe.ne.jp/~tomoya03/shtml/algorithm/Intersection.htm
   *
   * ### Example
   *     p1 = phina.geom.Vector2(100, 100);
   *     p2 = phina.geom.Vector2(200, 200);
   *     p3 = phina.geom.Vector2(150, 240);
   *     p4 = phina.geom.Vector2(200, 100);
   * phina.geom.Collision.testLineLine(p1, p2, p3, p4); // => true
   *
   * @param {phina.geom.Vector2} p1 線分1の端の座標
   * @param {phina.geom.Vector2} p2 線分1の端の座標
   * @param {phina.geom.Vector2} p3 線分2の端の座標
   * @param {phina.geom.Vector2} p4 線分2の端の座標
   * @return {Boolean} 線分1と線分2が重なっているかどうか
   */
  static testLineLine (p1, p2, p3, p4) {
    //同一ＸＹ軸上に乗ってる場合の誤判定回避
    if (p1.x == p2.x && p1.x == p3.x && p1.x == p4.x) {
      var min = Math.min(p1.y, p2.y);
      var max = Math.max(p1.y, p2.y);
      if (min <= p3.y && p3.y <= max || min <= p4.y && p4.y <= max) return true;
      return false;
    }
    if (p1.y == p2.y && p1.y == p3.y && p1.y == p4.y) {
      var min = Math.min(p1.x, p2.x);
      var max = Math.max(p1.x, p2.x);
      if (min <= p3.x && p3.x <= max || min <= p4.x && p4.x <= max) return true;
      return false;
    }
    //通常判定
    var a = (p1.x - p2.x) * (p3.y - p1.y) + (p1.y - p2.y) * (p1.x - p3.x);
    var b = (p1.x - p2.x) * (p4.y - p1.y) + (p1.y - p2.y) * (p1.x - p4.x);
    var c = (p3.x - p4.x) * (p1.y - p3.y) + (p3.y - p4.y) * (p3.x - p1.x);
    var d = (p3.x - p4.x) * (p2.y - p3.y) + (p3.y - p4.y) * (p3.x - p2.x);
    return a * b <= 0 && c * d <= 0;
  }
  /**
   * @method testRectLine
   * @static
   * 矩形と線分が重なっているかどうかを判定します
   *
   * ### Example
   *     rect = phina.geom.Rect(120, 130, 40, 50);
   *     p1 = phina.geom.Vector2(100, 100);
   *     p2 = phina.geom.Vector2(200, 200);
   * phina.geom.Collision.testRectLine(rect, p1, p2); // => true
   *
   * @param {phina.geom.Rect} rect 矩形領域オブジェクト
   * @param {phina.geom.Vector2} p1 線分の端の座標
   * @param {phina.geom.Vector2} p2 線分の端の座標
   * @return {Boolean} 矩形と線分が重なっているかどうか
   */
  static testRectLine (rect, p1, p2) {
      //包含判定(p1が含まれてれば良いのでp2の判定はしない）
      if (rect.left <= p1.x && p1.x <= rect.right && rect.top <= p1.y && p1.y <= rect.bottom ) return true;

      //矩形の４点
      var r1 = phina.geom.Vector2(rect.left, rect.top);     //左上
      var r2 = phina.geom.Vector2(rect.right, rect.top);    //右上
      var r3 = phina.geom.Vector2(rect.right, rect.bottom); //右下
      var r4 = phina.geom.Vector2(rect.left, rect.bottom);  //左下

      //矩形の４辺をなす線分との接触判定
      if (phina.geom.Collision.testLineLine(p1, p2, r1, r2)) return true;
      if (phina.geom.Collision.testLineLine(p1, p2, r2, r3)) return true;
      if (phina.geom.Collision.testLineLine(p1, p2, r3, r4)) return true;
      if (phina.geom.Collision.testLineLine(p1, p2, r1, r4)) return true;
      return false;
  }

}

/**
 * @class phina.geom.Vector3
 * # 3次元ベクトルクラス（未実装）
 * 3次元のベクトルや座標を表すクラスです。
 */
class Vector3 {

  /** x座標 */
  // x: 0,
  /** y座標 */
  // y: 0,
  /** z座標 */
  // z: 0,

  /**
   * @constructor
   */
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

}

/**
 * @class phina.graphics.Canvas
 * キャンバス拡張クラス
 */
class Canvas {
  // domElement: null,
  // canvas: null,
  // context: null,

  /**
   * 初期化
   */
  constructor(canvas) {
    if (typeof canvas === 'string') {
      this.canvas = document.querySelector(canvas);
    } else {
      this.canvas = canvas || document.createElement('canvas');
    }

    this.domElement = this.canvas;
    this.context = this.canvas.getContext('2d');
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
  }

  /**
   * サイズをセット
   */
  setSize(width, height) {
    this.canvas.width   = width;
    this.canvas.height  = height;
    return this;
  }

  setSizeToScreen() {
    this.canvas.style.position  = "fixed";
    this.canvas.style.margin    = "0px";
    this.canvas.style.padding   = "0px";
    this.canvas.style.left      = "0px";
    this.canvas.style.top       = "0px";
    return this.setSize(window.innerWidth, window.innerHeight);
  }

  fitScreen(isEver) {
    isEver = isEver === undefined ? true : isEver;

    var _fitFunc = function() {
      var e = this.domElement;
      var s = e.style;
      
      s.position = "absolute";
      s.margin = "auto";
      s.left = "0px";
      s.top  = "0px";
      s.bottom = "0px";
      s.right = "0px";

      var rateWidth = e.width/window.innerWidth;
      var rateHeight= e.height/window.innerHeight;
      var rate = e.height/e.width;
      
      if (rateWidth > rateHeight) {
        s.width  = Math.floor(innerWidth)+"px";
        s.height = Math.floor(innerWidth*rate)+"px";
      }
      else {
        s.width  = Math.floor(innerHeight/rate)+"px";
        s.height = Math.floor(innerHeight)+"px";
      }
    }.bind(this);
    
    // 一度実行しておく
    _fitFunc();

    // リサイズ時のリスナとして登録しておく
    if (isEver) {
      phina$1.global.addEventListener("resize", _fitFunc, false);
    }
  }

  /**
   * クリア
   */
  clear(x, y, width, height) {
    x = x || 0;
    y = y || 0;
    width = width || this.width;
    height= height|| this.height;
    this.context.clearRect(x, y, width, height);
    return this;
  }

  clearColor(fillStyle, x, y, width, height) {
    x = x || 0;
    y = y || 0;
    width = width || this.width;
    height= height|| this.height;

    var context = this.context;

    context.save();
    context.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0); // 行列初期化
    context.fillStyle = fillStyle;     // 塗りつぶしスタイルセット
    context.fillRect(x, y, width, height);
    context.restore();

    return this;
  }


  /**
   * パスを開始(リセット)
   */
  beginPath() {
    this.context.beginPath();
    return this;
  }

  /**
   *  パスを閉じる
   */
  closePath() {
    this.context.closePath();
    return this;
  }


  /**
   *  新規パス生成
   */
  moveTo(x, y) {
    this.context.moveTo(x, y);
    return this;
  }

  /**
   * パスに追加
   */
  lineTo(x, y) {
    this.context.lineTo(x, y);
    return this;
  }

  quadraticCurveTo() {
    this.context.quadraticCurveTo.apply(this.context, arguments);
    return this;
  }

  bezierCurveTo() {
    this.context.bezierCurveTo.apply(this.context, arguments);
    return this;
  }

  /**
   * パス内を塗りつぶす
   */
  fill() {
    this.context.fill();
    return this;
  }

  /**
   * パス上にラインを引く
   */
  stroke() {
    this.context.stroke();
    return this;
  }

  /**
   * クリップ
   */
  clip() {
    this.context.clip();
    return this;
  }

      
  /**
   * 点描画
   */
  drawPoint(x, y) {
    return this.strokeRect(x, y, 1, 1);
  }

  /**
   * ラインパスを作成
   */
  line(x0, y0, x1, y1) {
    return this.moveTo(x0, y0).lineTo(x1, y1);
  }
  
  /**
   * ラインを描画
   */
  drawLine(x0, y0, x1, y1) {
    return this.beginPath().line(x0, y0, x1, y1).stroke();
  }

  /**
   * ダッシュラインを描画
   */
  drawDashLine(x0, y0, x1, y1, pattern) {
    var patternTable = null;
    if (typeof(pattern) == "string") {
      patternTable = pattern;
    }
    else {
      pattern = pattern || 0xf0f0;
      patternTable = pattern.toString(2);
    }
    patternTable = patternTable.padding(16, '1');
    
    var vx = x1-x0;
    var vy = y1-y0;
    var len = Math.sqrt(vx*vx + vy*vy);
    vx/=len; vy/=len;
    
    var x = x0;
    var y = y0;
    for (var i=0; i<len; ++i) {
      if (patternTable[i%16] == '1') {
        this.drawPoint(x, y);
        // this.fillRect(x, y, this.context.lineWidth, this.context.lineWidth);
      }
      x += vx;
      y += vy;
    }
    
    return this;
  }

  /**
   * v0(x0, y0), v1(x1, y1) から角度を求めて矢印を描画
   * http://hakuhin.jp/as/rotation.html
   */
  drawArrow(x0, y0, x1, y1, arrowRadius) {
    var vx = x1-x0;
    var vy = y1-y0;
    var angle = Math.atan2(vy, vx)*180/Math.PI;
    
    this.drawLine(x0, y0, x1, y1);
    this.fillPolygon(x1, y1, arrowRadius || 5, 3, angle);
    
    return this;
  }


  /**
   * lines
   */
  lines() {
    this.moveTo(arguments[0], arguments[1]);
    for (var i=1,len=arguments.length/2; i<len; ++i) {
      this.lineTo(arguments[i*2], arguments[i*2+1]);
    }
    return this;
  }

  /**
   * ラインストローク描画
   */
  strokeLines() {
    this.beginPath();
    this.lines.apply(this, arguments);
    this.stroke();
    return this;
  }

  /**
   * ライン塗りつぶし描画
   */
  fillLines() {
    this.beginPath();
    this.lines.apply(this, arguments);
    this.fill();
    return this;
  }
  
  /**
   * 四角形パスを作成する
   */
  rect(x, y, width, height) {
    this.context.rect.apply(this.context, arguments);
    return this;
  }
  
  /**
   * 四角形塗りつぶし描画
   */
  fillRect() {
    this.context.fillRect.apply(this.context, arguments);
    return this;
  }
  
  /**
   * 四角形ライン描画
   */
  strokeRect() {
    this.context.strokeRect.apply(this.context, arguments);
    return this;
  }
  
  /**
   * 角丸四角形パス
   */
  roundRect(x, y, width, height, radius) {
    var l = x + radius;
    var r = x + width - radius;
    var t = y + radius;
    var b = y + height - radius;
    
    /*
    var ctx = this.context;
    ctx.moveTo(l, y);
    ctx.lineTo(r, y);
    ctx.quadraticCurveTo(x+width, y, x+width, t);
    ctx.lineTo(x+width, b);
    ctx.quadraticCurveTo(x+width, y+height, r, y+height);
    ctx.lineTo(l, y+height);
    ctx.quadraticCurveTo(x, y+height, x, b);
    ctx.lineTo(x, t);
    ctx.quadraticCurveTo(x, y, l, y);
    /**/
    
    this.context.arc(l, t, radius,     -Math.PI, -Math.PI*0.5, false);  // 左上
    this.context.arc(r, t, radius, -Math.PI*0.5,            0, false);  // 右上
    this.context.arc(r, b, radius,            0,  Math.PI*0.5, false);  // 右下
    this.context.arc(l, b, radius,  Math.PI*0.5,      Math.PI, false);  // 左下
    this.closePath();
    
    return this;
  }

  /**
   * 角丸四角形塗りつぶし
   */
  fillRoundRect(x, y, width, height, radius) {
    return this.beginPath().roundRect(x, y, width, height, radius).fill();
  }

  /**
   * 角丸四角形ストローク描画
   */
  strokeRoundRect(x, y, width, height, radius) {
    return this.beginPath().roundRect(x, y, width, height, radius).stroke();
  }

  /**
   * 円のパスを設定
   */
  circle(x, y, radius) {
    this.context.arc(x, y, radius, 0, Math.PI*2, false);
    return this;
  }
  
  /**
   * 塗りつぶし円を描画
   */
  fillCircle(x, y, radius) {
    var c = this.context;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI*2, false);
    c.closePath();
    c.fill();
    return this;
  }
  
  /**
   * ストローク円を描画
   */
  strokeCircle(x, y, radius) {
    var c = this.context;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI*2, false);
    c.closePath();
    c.stroke();
    return this;
  }

  /**
   * 円弧のパスを設定
   */
  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    return this;
  }
  
  /**
   * 塗りつぶし円弧を描画
   */
  fillArc(x, y, radius, startAngle, endAngle, anticlockwise) {
    return this.beginPath().arc(x, y, radius, startAngle, endAngle, anticlockwise).fill();
  }
  
  /**
   * ストローク円弧を描画
   */
  strokeArc(x, y, radius, startAngle, endAngle, anticlockwise) {
    return this.beginPath().arc(x, y, radius, startAngle, endAngle, anticlockwise).stroke();
  }


  pie(x, y, radius, startAngle, endAngle, anticlockwise) {
    var context = this.context;
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    context.closePath();
    return this;
  }
  fillPie(x, y, radius, startAngle, endAngle, anticlockwise) {
    return this.beginPath().pie(x, y, radius, startAngle, endAngle, anticlockwise).fill();
  }
  strokePie(x, y, radius, startAngle, endAngle, anticlockwise) {
    return this.beginPath().pie(x, y, radius, startAngle, endAngle, anticlockwise).stroke();
  }

  
  /**
   * ポリゴンパス
   */
  polygon(x, y, size, sides, offsetAngle) {
    var radDiv = (Math.PI*2)/sides;
    var radOffset = (offsetAngle!==undefined) ? offsetAngle*Math.PI/180 : -Math.PI/2;
    
    this.moveTo(x + Math.cos(radOffset)*size, y + Math.sin(radOffset)*size);
    for (var i=1; i<sides; ++i) {
      var rad = radDiv*i+radOffset;
      this.lineTo(
        x + Math.cos(rad)*size,
        y + Math.sin(rad)*size
      );
    }
    this.closePath();
    return this;
  }
  /**
   * ポリゴン塗りつぶし
   */
  fillPolygon(x, y, radius, sides, offsetAngle) {
    return this.beginPath().polygon(x, y, radius, sides, offsetAngle).fill();
  }
  /**
   * ポリゴンストローク描画
   */
  strokePolygon(x, y, radius, sides, offsetAngle) {
    return this.beginPath().polygon(x, y, radius, sides, offsetAngle).stroke();
  }
  
  /**
   * star
   */
  star(x, y, radius, sides, sideIndent, offsetAngle) {
    var x = x || 0;
    var y = y || 0;
    var radius = radius || 64;
    var sides = sides || 5;
    var sideIndentRadius = radius * (sideIndent || 0.38);
    var radOffset = (offsetAngle) ? offsetAngle*Math.PI/180 : -Math.PI/2;
    var radDiv = (Math.PI*2)/sides/2;

    this.moveTo(
      x + Math.cos(radOffset)*radius,
      y + Math.sin(radOffset)*radius
    );
    for (var i=1; i<sides*2; ++i) {
      var rad = radDiv*i + radOffset;
      var len = (i%2) ? sideIndentRadius : radius;
      this.lineTo(
        x + Math.cos(rad)*len,
        y + Math.sin(rad)*len
      );
    }
    this.closePath();

    return this;
  }

  /**
   * 星を塗りつぶし描画
   */
  fillStar(x, y, radius, sides, sideIndent, offsetAngle) {
    this.beginPath().star(x, y, radius, sides, sideIndent, offsetAngle).fill();
    return this;
  }

  /**
   * 星をストローク描画
   */
  strokeStar(x, y, radius, sides, sideIndent, offsetAngle) {
    this.beginPath().star(x, y, radius, sides, sideIndent, offsetAngle).stroke();
    return this;
  }

  /*
   * heart
   */
  heart(x, y, radius, angle) {
    var half_radius = radius*0.5;
    var rad = (angle === undefined) ? Math.PI/4 : Math.degToRad(angle);

    // 半径 half_radius の角度 angle 上の点との接線を求める
    var p = Math.cos(rad)*half_radius;
    var q = Math.sin(rad)*half_radius;

    // 円の接線の方程式 px + qy = r^2 より y = (r^2-px)/q
    var x2 = -half_radius;
    var y2 = (half_radius*half_radius-p*x2)/q;

    // 中心位置調整
    var height = y2 + half_radius;
    var offsetY = half_radius-height/2;

    // パスをセット
    this.moveTo(0+x, y2+y+offsetY);

    this.arc(-half_radius+x, 0+y+offsetY, half_radius, Math.PI-rad, Math.PI*2);
    this.arc(half_radius+x, 0+y+offsetY, half_radius, Math.PI, rad);
    this.closePath();

    return this;
  }

  /*
   * fill heart
   */
  fillHeart(x, y, radius, angle) {
    return this.beginPath().heart(x, y, radius, angle).fill();
  }

  /*
   * stroke heart
   */
  strokeHeart(x, y, radius, angle) {
    return this.beginPath().heart(x, y, radius, angle).stroke();
  }

  /*
   * http://stackoverflow.com/questions/14169234/the-relation-of-the-bezier-curve-and-ellipse
   */
  ellipse(x, y, w, h) {
    var ctx = this.context;
    var kappa = 0.5522848;

    var ox = (w / 2) * kappa; // control point offset horizontal
    var oy = (h / 2) * kappa; // control point offset vertical
    var xe = x + w;           // x-end
    var ye = y + h;           // y-end
    var xm = x + w / 2;       // x-middle
    var ym = y + h / 2;       // y-middle

    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    // ctx.closePath();

    return this;
  }

  fillEllipse(x, y, width, height) {
    return this.beginPath().ellipse(x, y, width, height).fill();
  }
  strokeEllipse(x, y, width, height) {
    return this.beginPath().ellipse(x, y, width, height).stroke();
  }

  fillText() {
    this._context.fillText.apply(this._context, arguments);
    return this;
  }

  strokeText() {
    this._context.strokeText.apply(this._context, arguments);
    return this;
  }

  /*
   * 画像を描画
   */
  drawImage() {
    this.context.drawImage.apply(this.context, arguments);
  }

  /**
   * 行列をセット
   */
  setTransform(m11, m12, m21, m22, dx, dy) {
    this.context.setTransform(m11, m12, m21, m22, dx, dy);
    return this;
  }

  /**
   * 行列をリセット
   */
  resetTransform() {
    this.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
    return this;
  }
  /**
   * 中心に移動
   */
  transformCenter() {
    this.context.setTransform(1, 0, 0, 1, this.width/2, this.height/2);
    return this;
  }

  /**
   * 移動
   */
  translate(x, y) {
    this.context.translate(x, y);
    return this;
  }
  
  /**
   * 回転
   */
  rotate(rotation) {
    this.context.rotate(rotation);
    return this;
  }
  
  /**
   * スケール
   */
  scale(scaleX, scaleY) {
    this.context.scale(scaleX, scaleY);
    return this;
  }

  /**
   * 状態を保存
   */
  save() {
    this.context.save();
    return this;
  }

  /**
   * 状態を復元
   */
  restore() {
    this.context.restore();
    return this;
  }

  /**
   * 画像として保存
   */
  saveAsImage(mime_type) {
    mime_type = mime_type || "image/png";
    var data_url = this.canvas.toDataURL(mime_type);
    // data_url = data_url.replace(mime_type, "image/octet-stream");
    window.open(data_url, "save");
    
    // toDataURL を使えば下記のようなツールが作れるかも!!
    // TODO: プログラムで絵をかいて保存できるツール
  }

  /**
   * 幅
   */
  get width()   { return this.canvas.width; }
  set width(v)  { this.canvas.width = v; }

  /**
   * 高さ
   */
  get height()   { return this.canvas.height; }
  set height(v)  { this.canvas.height = v; }

  get fillStyle()   { return this.context.fillStyle; }
  set fillStyle(v)  { this.context.fillStyle = v; }

  get strokeStyle()   { return this.context.strokeStyle; }
  set strokeStyle(v)  { this.context.strokeStyle = v; }

  get globalAlpha()   { return this.context.globalAlpha; }
  set globalAlpha(v)  { this.context.globalAlpha = v; }

  get globalCompositeOperation()   { return this.context.globalCompositeOperation; }
  set globalCompositeOperation(v)  { this.context.globalCompositeOperation = v; }

  get shadowBlur()   { return this.context.shadowBlur; }
  set shadowBlur(v)  { this.context.shadowBlur = v; }

  get shadowColor()   { return this.context.shadowColor; }
  set shadowColor(v)  { this.context.shadowColor = v; }

  get shadowOffsetX()   { return this.context.shadowOffsetX; }
  set shadowOffsetX(v)  { this.context.shadowOffsetX = v; }

  get shadowOffsetY()   { return this.context.shadowOffsetY; }
  set shadowOffsetY(v)  { this.context.shadowOffsetY = v; }

  get lineCap()   { return this.context.lineCap; }
  set lineCap(v)  { this.context.lineCap = v; }

  get lineJoin()   { return this.context.lineJoin; }
  set lineJoin(v)  { this.context.lineJoin = v; }

  get miterLimit()   { return this.context.miterLimit; }
  set miterLimit(v)  { this.context.miterLimit = v; }

  get lineWidth()   { return this.context.lineWidth; }
  set lineWidth(v)  { this.context.lineWidth = v; }

  get font()   { return this.context.font; }
  set font(v)  { this.context.font = v; }

  get textAlign()   { return this.context.textAlign; }
  set textAlign(v)  { this.context.textAlign = v; }

  get textBaseline()   { return this.context.textBaseline; }
  set textBaseline(v)  { this.context.textBaseline = v; }

  get imageSmoothingEnabled()   { return this.context.imageSmoothingEnabled; }
  set imageSmoothingEnabled(v)  {
    this.context.imageSmoothingEnabled = v;
    this.context.webkitImageSmoothingEnabled = v;
    this.context.mozImageSmoothingEnabled = v;
  }

  static measureText(font, text) {
    this._context.font = font;
    return this._context.measureText(text);
  }

  static createLinearGradient() {
    return this._context.createLinearGradient.apply(this._context, arguments);
  }

  static createRadialGradient() {
    return this._context.createRadialGradient.apply(this._context, arguments);
  }

}

Canvas._context = (function() {
  if (Support.canvas) {
    return document.createElement('canvas').getContext('2d');
  }
  else {
    return null;
  }
})();

// import { first, last, clear } from "../core/array"

/**
 * @class phina.input.Input
 * @extends phina.util.EventDispatcher
 */
class Input extends EventDispatcher {

  // /** domElement */
  // domElement = null

  constructor(domElement) {
    super();

    this.domElement = domElement || window.document;

    this.position = new Vector2(0, 0);
    this.startPosition = new Vector2(0, 0);
    this.deltaPosition = new Vector2(0, 0);
    this.prevPosition = new Vector2(0, 0);
    this._tempPosition = new Vector2(0, 0);

    this.maxCacheNum = Input.defaults.maxCacheNum;
    this.minDistance = Input.defaults.minDistance;
    this.maxDistance = Input.defaults.maxDistance;
    this.cachePositions = [];
    this.flickVelocity = new Vector2(0, 0);

    this.flags = 0;
  }

  update() {
    this.last = this.now;
    this.now = this.flags;
    this.start = (this.now ^ this.last) & this.now;
    this.end   = (this.now ^ this.last) & this.last;

    // 変化値を更新
    this.deltaPosition.x = this._tempPosition.x - this.position.x;
    this.deltaPosition.y = this._tempPosition.y - this.position.y;

    if (this.deltaPosition.x === 0 && this.deltaPosition.y === 0) {
      this._moveFlag = false;
    }
    else {
      this._moveFlag = true;
    }

    if (this.start) {
      this.startPosition.set(this.position.x, this.position.y);
    }

    // 前回の座標を更新
    this.prevPosition.set(this.position.x, this.position.y);

    // 現在の位置を更新
    this.position.set(this._tempPosition.x, this._tempPosition.y);

    if (this.cachePositions.length > this.maxCacheNum) {
      this.cachePositions.shift();
    }
    this.cachePositions.push(this.position.clone());
  }

  _start(x, y, flag) {
    flag = (flag !== undefined) ? flag : 1;
    // console.log('start', x, y);
    this._move(x, y);

    this.flags |= flag;

    var x = this._tempPosition.x;
    var y = this._tempPosition.y;
    this.position.set(x, y);
    this.prevPosition.set(x, y);

    this.flickVelocity.set(0, 0);
    // this.cachePositions.clear();
    this.cachePositions.length = 0;
  }

  _end(flag) {
    flag = (flag !== undefined) ? flag : 1;
    this.flags &= ~(flag);

    if (this.cachePositions.length < 2) return;

    // var first = this.cachePositions.first;
    // var last = this.cachePositions.last;
    var first = this.cachePositions[0];
    var last = this.cachePositions[this.cachePositions.length-1];

    var v = Vector2.sub(last, first);

    var len = v.length();

    if (len > this.minDistance) {
      // var normalLen = len.clamp(this.minDistance, this.maxDistance);
      var normalLen = clamp(len, this.minDistance, this.maxDistance);
      v.div(len).mul(normalLen);
      this.flickVelocity.set(v.x, v.y);
    }

    // this.cachePositions.clear();
    this.cachePositions.length = 0;
  }

  // スケールを考慮
  _move(x, y) {
    this._tempPosition.x = x;
    this._tempPosition.y = y;

    // adjust scale
    var elm = this.domElement;
    var rect = elm.getBoundingClientRect();
    if (rect.width) {
      this._tempPosition.x *= elm.width / rect.width;
    }
    if (rect.height) {
      this._tempPosition.y *= elm.height / rect.height;
    }
  }

  /**
   * @property    x
   * x座標値
   */
  get x() { return this.position.x; }
  set x(v) { this.position.x = v; }

  /**
   * @property    y
   * y座標値
   */
  get y() { return this.position.y; }
  set y(v) { this.position.y = v; }

  /**
   * @property    dx
   * dx値
   */
  get dx() { return this.deltaPosition.x; }
  set dx(v) { this.deltaPosition.x = v; }

  /**
   * @property    dy
   * dy値
   */
  get dy() { return this.deltaPosition.y; }
  set dy(v) { this.deltaPosition.y = v; }

  /**
   * @property    fx
   * fx値
   */
  get fx() { return this.flickVelocity.x; }
  set fx(v) { this.flickVelocity.x = v; }

  /**
   * @property    fy
   * fy値
   */
  get fy() { return this.flickVelocity.y; }
  set fy(v) { this.flickVelocity.y = v; }

}

Input.defaults = {
  maxCacheNum: 3,
  minDistance: 10,
  maxDistance: 100,
};

/**
 * @class phina.input.Keyboard
 * @extends phina.input.Input
 */
class Keyboard extends Input {

  /**
   * @constructor
   */
  constructor(domElement) {
    super(domElement);

    this.key = {};
    this.press  = {};
    this.down   = {};
    this.up     = {};
    this.last   = {};

    this._keydown = null;
    this._keyup = null;
    this._keypress = null;

    var self = this;
    this.domElement.addEventListener('keydown', function(e) {
      self.key[e.keyCode] = true;
      self._keydown = e.keyCode;
    });

    this.domElement.addEventListener('keyup', function(e) {
      self.key[e.keyCode] = false;
      self._keyup = e.keyCode;
    });
    this.domElement.addEventListener('keypress', function(e) {
      self._keypress = e.keyCode;
    });
  }

  /**
   * 情報更新処理
   * マイフレーム呼んで下さい.
   * @private
   */
  update() {
    // TODO: 一括ビット演算で行うよう修正する
    for (var k in this.key) {
      this.last[k]    = this.press[k];
      this.press[k]   = this.key[k];
      
      this.down[k] = (this.press[k] ^ this.last[k]) & this.press[k];
      this.up[k] = (this.press[k] ^ this.last[k]) & this.last[k];
    }

    if (this._keydown) {
      this.flare('keydown', { keyCode: this._keydown });
      this._keydown = null;
    }
    if (this._keyup) {
      this.flare('keyup', { keyCode: this._keyup });
      this._keyup = null;
    }
    if (this._keypress) {
      this.flare('keypress', { keyCode: this._keypress });
      this._keypress = null;
    }
    
    return this;
  }

  /**
   * キーを押しているかをチェック
   * @param   {Number/String} key keyCode or keyName
   * @returns {Boolean}   チェック結果
   */
  getKey(key) {
    if (typeof(key) === "string") {
      key = Keyboard.KEY_CODE[key];
    }
    return !!this.press[key] === true;
  }
  
  /**
   * キーを押したかをチェック
   * @param   {Number/String} key keyCode or keyName
   * @returns {Boolean}   チェック結果
   */
  getKeyDown(key) {
    if (typeof(key) == "string") {
      key = Keyboard.KEY_CODE[key];
    }
    return this.down[key] == true;
  }
  
  /**
   * キーを離したかをチェック
   * @param   {Number/String} key keyCode or keyName
   * @returns {Boolean}   チェック結果
   */
  getKeyUp(key) {
    if (typeof(key) == "string") {
      key = Keyboard.KEY_CODE[key];
    }
    return this.up[key] == true;
  }
  
  /**
   * キーの方向を Angle(Degree) で取得
   * @returns {Boolean}   角度(Degree)
   */
  getKeyAngle() {
    var angle = null;
    var arrowBit =
      (this.getKey("left")   << 3) | // 1000
      (this.getKey("up")     << 2) | // 0100
      (this.getKey("right")  << 1) | // 0010
      (this.getKey("down"));         // 0001
    
    if (arrowBit !== 0 && Keyboard.ARROW_BIT_TO_ANGLE_TABLE.hasOwnProperty(arrowBit)) {
      angle = Keyboard.ARROW_BIT_TO_ANGLE_TABLE[arrowBit];
    }
    
    return angle;
  }

  /**
   * キーの押している向きを取得
   * 正規化されている
   */
  getKeyDirection() {
    var direction = new Vector2(0, 0);

    if (this.getKey("left")) {
      direction.x = -1;
    }
    else if (this.getKey("right")) {
      direction.x = 1;
    }
    if (this.getKey("up")) {
      direction.y = -1;
    }
    else if (this.getKey("down")) {
      direction.y = 1;
    }

    if (direction.x && direction.y) {
      direction.div(Math.SQRT2);
    }

    return direction;
  }
  
  /**
   * キーの状態を設定する
   */
  setKey(key, flag) {
    if (typeof(key) == "string") {
      key = Keyboard.KEY_CODE[key];
    }
    this.key[key] = flag;
    
    return this;
  }

  /**
   * キーを全て離したことにする
   */
  clearKey() {
    this.key = {};
    
    return this;
  }

}

/**
 * @static
 * @enum ARROW_BIT_TO_ANGLE_TABLE
 * 方向のアングル jsduckでは数字をプロパティに指定できない？
 * @private
 */
Keyboard.ARROW_BIT_TO_ANGLE_TABLE = {
  /* @property 下 */
  0x01: 270,
  /* @property 右 */
  0x02:   0,
  /* @property 上 */
  0x04:  90,
  /* @property 左 */
  0x08: 180,

  /* @property 右上 */
  0x06:  45,
  /* @property 右下 */
  0x03: 315,
  /* @property 左上 */
  0x0c: 135,
  /* @property 左下 */
  0x09: 225,

  // 三方向同時押し対応
  // 想定外の操作だが対応しといたほうが無難
  /* @property 右上左 */
  0x0e:  90,
  /* @property 上左下 */
  0x0d: 180,
  /* @property 左下右 */
  0x0b: 270,
  /* @property 下右上 */
  0x07:   0,
};

/*
 * @static
 * @enum KEY_CODE
 * キー番号
 * @private
 */
Keyboard.KEY_CODE = {
  /* @property */
  "backspace" : 8,
  /* @property */
  "tab"       : 9,
  /* @property */
  "enter"     : 13,
  /* @property */
  "return"    : 13,
  /* @property */
  "shift"     : 16,
  /* @property */
  "ctrl"      : 17,
  /* @property */
  "alt"       : 18,
  /* @property */
  "pause"     : 19,
  /* @property */
  "capslock"  : 20,
  /* @property */
  "escape"    : 27,
  /* @property */
  "pageup"    : 33,
  /* @property */
  "pagedown"  : 34,
  /* @property */
  "end"       : 35,
  /* @property */
  "home"      : 36,
  /* @property */
  "left"      : 37,
  /* @property */
  "up"        : 38,
  /* @property */
  "right"     : 39,
  /* @property */
  "down"      : 40,
  /* @property */
  "insert"    : 45,
  /* @property */
  "delete"    : 46,
  
  /* @property */
  "0" : 48,
  /* @property */
  "1" : 49,
  /* @property */
  "2" : 50,
  /* @property */
  "3" : 51,
  /* @property */
  "4" : 52,
  /* @property */
  "5" : 53,
  /* @property */
  "6" : 54,
  /* @property */
  "7" : 55,
  /* @property */
  "8" : 56,
  /* @property */
  "9" : 57,
  /* @property */
  
  "a" : 65,
  /* @property */
  "A" : 65,
  /* @property */
  "b" : 66,
  /* @property */
  "B" : 66,
  /* @property */
  "c" : 67,
  /* @property */
  "C" : 67,
  /* @property */
  "d" : 68,
  /* @property */
  "D" : 68,
  /* @property */
  "e" : 69,
  /* @property */
  "E" : 69,
  /* @property */
  "f" : 70,
  /* @property */
  "F" : 70,
  /* @property */
  "g" : 71,
  /* @property */
  "G" : 71,
  /* @property */
  "h" : 72,
  /* @property */
  "H" : 72,
  /* @property */
  "i" : 73,
  /* @property */
  "I" : 73,
  /* @property */
  "j" : 74,
  /* @property */
  "J" : 74,
  /* @property */
  "k" : 75,
  /* @property */
  "K" : 75,
  /* @property */
  "l" : 76,
  /* @property */
  "L" : 76,
  /* @property */
  "m" : 77,
  /* @property */
  "M" : 77,
  /* @property */
  "n" : 78,
  /* @property */
  "N" : 78,
  /* @property */
  "o" : 79,
  /* @property */
  "O" : 79,
  /* @property */
  "p" : 80,
  /* @property */
  "P" : 80,
  /* @property */
  "q" : 81,
  /* @property */
  "Q" : 81,
  /* @property */
  "r" : 82,
  /* @property */
  "R" : 82,
  /* @property */
  "s" : 83,
  /* @property */
  "S" : 83,
  /* @property */
  "t" : 84,
  /* @property */
  "T" : 84,
  /* @property */
  "u" : 85,
  /* @property */
  "U" : 85,
  /* @property */
  "v" : 86,
  /* @property */
  "V" : 86,
  /* @property */
  "w" : 87,
  /* @property */
  "W" : 87,
  /* @property */
  "x" : 88,
  /* @property */
  "X" : 88,
  /* @property */
  "y" : 89,
  /* @property */
  "Y" : 89,
  /* @property */
  "z" : 90,
  /* @property */
  "Z" : 90,
  
  /* @property */
  "numpad0" : 96,
  /* @property */
  "numpad1" : 97,
  /* @property */
  "numpad2" : 98,
  /* @property */
  "numpad3" : 99,
  /* @property */
  "numpad4" : 100,
  /* @property */
  "numpad5" : 101,
  /* @property */
  "numpad6" : 102,
  /* @property */
  "numpad7" : 103,
  /* @property */
  "numpad8" : 104,
  /* @property */
  "numpad9" : 105,
  /* @property */
  "multiply"      : 106,
  /* @property */
  "add"           : 107,
  /* @property */
  "subtract"      : 109,
  /* @property */
  "decimalpoint"  : 110,
  /* @property */
  "divide"        : 111,

  /* @property */
  "f1"    : 112,
  /* @property */
  "f2"    : 113,
  /* @property */
  "f3"    : 114,
  /* @property */
  "f4"    : 115,
  /* @property */
  "f5"    : 116,
  /* @property */
  "f6"    : 117,
  /* @property */
  "f7"    : 118,
  /* @property */
  "f8"    : 119,
  /* @property */
  "f9"    : 120,
  /* @property */
  "f10"   : 121,
  /* @property */
  "f11"   : 122,
  /* @property */
  "f12"   : 123,
  
  /* @property */
  "numlock"   : 144,
  /* @property */
  "scrolllock": 145,
  /* @property */
  "semicolon" : 186,
  /* @property */
  "equalsign" : 187,
  /* @property */
  "comma"     : 188,
  /* @property */
  "dash"      : 189,
  /* @property */
  "period"    : 190,
  /* @property */
  "forward slash" : 191,
  /* @property */
  "/": 191,
  /* @property */
  "grave accent"  : 192,
  /* @property */
  "open bracket"  : 219,
  /* @property */
  "back slash"    : 220,
  /* @property */
  "close bracket"  : 221,
  /* @property */
  "single quote"  : 222,
  /* @property */
  "space"         : 32

};

/**
 * MouseEvent/Touch拡張
 * @method    pointX
 * マウスのX座標.
 */
var pointX = {
  get: function() {
    return this.clientX - this.target.getBoundingClientRect().left;
  }
};

/**
 * MouseEvent/Touch拡張
 * @method    pointX
 * マウスのX座標.
 */
var pointY = {
  get: function() {
    return this.clientY - this.target.getBoundingClientRect().top;
  }
};

/**
 * TouchEvent拡張
 * @method    pointX
 * タッチイベント.
 */
var touchPointX = {
  get: function() {
    return this.touches[0].clientX - this.target.getBoundingClientRect().left;
    // return this.touches[0].pageX - this.target.getBoundingClientRect().left - tm.global.scrollX;
  }
};

/**
 * TouchEvent拡張
 * @method    pointY
 * タッチイベント.
 */
var touchPointY = {
  get: function() {
    return this.touches[0].clientY - this.target.getBoundingClientRect().top;
    // return this.touches[0].pageY - this.target.getBoundingClientRect().top - tm.global.scrollY;
  }
};


// ;(function() {

  // if (!phina.global.Event) return ;

  /**
   * @class global.Event
   * 既存のEventオブジェクト拡張
   */
    
  // /**
  //  * @method stop
  //  * イベントのデフォルト処理 & 伝達を止める
  //  */
  // Event.prototype.stop = function() {
  //   // イベントキャンセル
  //   this.preventDefault();
  //   // イベント伝達を止める
  //   this.stopPropagation();
  // };

// })();


// (function() {

//   if (!phina.global.MouseEvent) return ;

//   /**
//    * @class global.MouseEvent
//    * MouseEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * マウスのX座標.
//    */
//   MouseEvent.prototype.getter("pointX", function() {
//     return this.clientX - this.target.getBoundingClientRect().left;
//     // return this.pageX - this.target.getBoundingClientRect().left - window.scrollX;
//   });
  
//   /**
//    * @method    pointY
//    * マウスのY座標.
//    */
//   MouseEvent.prototype.getter("pointY", function() {
//     return this.clientY - this.target.getBoundingClientRect().top;
//     // return this.pageY - this.target.getBoundingClientRect().top - window.scrollY;
//   });
    
// })();


// (function() {
    
//   if (!phina.global.TouchEvent) return ;
  
  
//   /**
//    * @class global.TouchEvent
//    * TouchEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * タッチイベント.
//    */
//   TouchEvent.prototype.getter("pointX", function() {
//       return this.touches[0].clientX - this.target.getBoundingClientRect().left;
//       // return this.touches[0].pageX - this.target.getBoundingClientRect().left - tm.global.scrollX;
//   });
  
//   /**
//    * @method    pointY
//    * タッチイベント.
//    */
//   TouchEvent.prototype.getter("pointY", function() {
//       return this.touches[0].clientY - this.target.getBoundingClientRect().top;
//       // return this.touches[0].pageY - this.target.getBoundingClientRect().top - tm.global.scrollY;
//   });  
    
// })();


// (function() {
    
//   if (!phina.global.Touch) return ;
  
//   /**
//    * @class global.Touch
//    * TouchEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * タッチイベント.
//    */
//   Touch.prototype.getter("pointX", function() {
//       return this.clientX - this.target.getBoundingClientRect().left;
//   });

//   /**
//    * @method    pointY
//    * タッチイベント.
//    */
//   Touch.prototype.getter("pointY", function() {
//       return this.clientY - this.target.getBoundingClientRect().top;
//   });
    
// })();

var BUTTON_MAP;

/**
 * @class phina.input.Mouse
 * @extends phina.input.Input
 */
class Mouse extends Input {

  /**
   * @constructor
   */
  constructor(domElement) {
    super(domElement);

    this.id = 0;

    var self = this;
    this.domElement.addEventListener('mousedown', function(e) {
      self._start(pointX.get.call(e), pointY.get.call(e), 1<<e.button);
      // self._start(e.pointX, e.pointY, 1<<e.button);
    });

    this.domElement.addEventListener('mouseup', function(e) {
      self._end(1<<e.button);
    });
    this.domElement.addEventListener('mousemove', function(e) {
      self._move(pointX.get.call(e), pointY.get.call(e));
      // self._move(e.pointX, e.pointY);
    });

    // マウスがキャンバス要素の外に出た場合の対応
    this.domElement.addEventListener('mouseout', function(e)  {
      self._end(1);
    });
  }

  /**
   * ボタン取得
   */
  getButton(button) {
    if (typeof(button) == "string") {
      button = BUTTON_MAP[button];
    }
    
    return (this.now & button) != 0;
  }

  /**
   * ボタンダウン取得
   */
  getButtonDown(button) {
    if (typeof(button) === 'string') {
      button = BUTTON_MAP[button];
    }

    return (this.start & button) != 0;
  }
      
  /**
   * ボタンアップ取得
   */
  getButtonUp(button) {
    if (typeof(button) == "string") {
      button = BUTTON_MAP[button];
    }
    
    return (this.end & button) != 0;
  }

}

/** @static @property */
Mouse.BUTTON_LEFT = 0x1;
/** @static @property */
Mouse.BUTTON_MIDDLE = 0x2;
/** @static @property */
Mouse.BUTTON_RIGHT = 0x4;

BUTTON_MAP = {
  "left"  : Mouse.BUTTON_LEFT,
  "middle": Mouse.BUTTON_MIDDLE,
  "right" : Mouse.BUTTON_RIGHT
};

Mouse.prototype.getPointing = function() { return this.getButton("left"); };
Mouse.prototype.getPointingStart = function() { return this.getButtonDown("left"); };
Mouse.prototype.getPointingEnd = function() { return this.getButtonUp("left"); };

/**
 * @class phina.input.Touch
 * @extends phina.input.Input
 */
class Touch extends Input {

  /**
   * @constructor
   */
  constructor(domElement, isMulti) {
    super(domElement);

    this.id = null;

    if (isMulti === true) {
      return ;
    }

    var self = this;
    this.domElement.addEventListener('touchstart', function(e) {
      self._start(touchPointX.get.call(e), touchPointY.get.call(e), true);
      // self._start(e.pointX, e.pointY, true);
    });

    this.domElement.addEventListener('touchend', function(e) {
      self._end();
    });
    this.domElement.addEventListener('touchmove', function(e) {
      self._move(touchPointX.get.call(e), touchPointY.get.call(e));
      // self._move(e.pointX, e.pointY);
    });
  }

  /**
   * タッチしているかを判定
   */
  getTouch() {
    return this.now != 0;
  }
  
  /**
   * タッチ開始時に true
   */
  getTouchStart() {
    return this.start != 0;
  }
  
  /**
   * タッチ終了時に true
   */
  getTouchEnd() {
    return this.end != 0;
  }

}

/**
 * @method
 * ポインティング状態取得(mouse との差異対策)
 */
Touch.prototype.getPointing        = Touch.prototype.getTouch;
/**
 * @method
 * ポインティングを開始したかを取得(mouse との差異対策)
 */
Touch.prototype.getPointingStart   = Touch.prototype.getTouchStart;
/**
 * @method
 * ポインティングを終了したかを取得(mouse との差異対策)
 */
Touch.prototype.getPointingEnd     = Touch.prototype.getTouchEnd;


/**
 * @class phina.input.TouchList
 */
class TouchList {

  constructor(domElement) {
    this.domElement = domElement;

    this.touches = [];
    var touchMap = this.touchMap = {};

    // 32bit 周期でIDをループさせる
    this._id = new Uint32Array(1);

    var self = this;
    var each = Array.prototype.forEach;
    this.domElement.addEventListener('touchstart', function(e) {
      each.call(e.changedTouches, function(t) {
        var touch = self.getEmpty();
        touchMap[t.identifier] = touch;
        touch._start(pointX.get.call(t), pointY.get.call(t));
        // touch._start(t.pointX, t.pointY);
      });
    });

    this.domElement.addEventListener('touchend', function(e) {
      each.call(e.changedTouches, function(t) {
        var id = t.identifier;
        var touch = touchMap[id];
        touch._end();
        delete touchMap[id];
      });
    });
    this.domElement.addEventListener('touchmove', function(e) {
      each.call(e.changedTouches, function(t) {
        var touch = touchMap[t.identifier];
        touch._move(pointX.get.call(t), pointY.get.call(t));
        // touch._move(t.pointX, t.pointY);
      });
      e.stop();
    });

    // iPhone では 6本指以上タッチすると強制的にすべてのタッチが解除される
    this.domElement.addEventListener('touchcancel', function(e) {
      console.warn('この端末での同時タッチ数の制限を超えました。');
      each.call(e.changedTouches, function(t) {
        var id = t.identifier;
        var touch = touchMap[id];
        touch._end();
        delete touchMap[id];
      });
      e.stop();
    });
  }

  getEmpty() {
    var touch = new Touch(this.domElement, true);
  
    touch.id = this.id;
    this.touches.push(touch);

    return touch;
  }

  getTouch(id) {
    return this.touchMap[id];
  }

  removeTouch(touch) {
    var i = this.touches.indexOf(touch);
    this.touches.splice(i, 1);
  }

  update() {
    if (this.touches.length > 0) {
      var clone = this.touches.slice(0);
      clone.forEach(function(touch) {
        if (!touch.released) {
          touch.update();

          if (touch.flags === 0) {
            touch.released = true;
          }
        }
        else {
          touch.released = false;
          this.removeTouch(touch);
        }

      }, this);
    }
  }

  get id() { return this._id[0]++; }

}

/**
 * @class phina.input.GamepadManager
 * ゲームパッドマネージャー.
 * ゲームパッド接続状況の監視、個々のゲームパッドの入力状態の更新を行う.
 * @extends phina.util.EventDispatcher
 */
class GamepadManager extends EventDispatcher {

  /**
   * 作成済みphina.input.Gamepadオブジェクトのリスト
   *
   * @type {Object.<number, phina.input.Gamepad>}
   */
  // gamepads: null,

  /**
   * 作成済みゲームパッドのindexのリスト
   *
   * @type {number[]}
   * @private
   */
  // _created: null,

  /**
   * ラップ前Gamepadのリスト
   * @type {phina.input.Gamepad[]}
   * @private
   */
  // _rawgamepads: null,

  /**
   * @constructor
   */
  constructor() {
    super();

    this.gamepads = {};
    this._created = [];
    this._rawgamepads = [];

    this._prevTimestamps = {};

    this._getGamepads = null;
    var navigator = phina$1.global.navigator;
    if (navigator && navigator.getGamepads) {
      this._getGamepads = navigator.getGamepads.bind(navigator);
    } else if (navigator && navigator.webkitGetGamepads) {
      this._getGamepads = navigator.webkitGetGamepads.bind(navigator);
    } else {
      this._getGamepads = function() {};
    }

    phina$1.global.addEventListener('gamepadconnected', function(e) {
      var gamepad = this.get(e.gamepad.index);
      gamepad.connected = true;
      this.flare('connected', {
        gamepad: gamepad,
      });
    }.bind(this));

    phina$1.global.addEventListener('gamepaddisconnected', function(e) {
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
   *
   * 未作成の場合は作成して返す.
   */
  get(index) {
    index = index || 0;

    if (!this.gamepads[index]) {
      this._created.push(index);
      this.gamepads[index] = new Gamepad(index);
    }

    return this.gamepads[index];
  }

  /**
   * 指定されたindexのGamepadオブジェクトを破棄する.
   * 破棄されたGamepadオブジェクトは以降更新されない.
   */
  dispose(index) {
    if (contains.call(this._created, index)) {
    // if (this._created.contains(index)) {
      var gamepad = this.get(index);
      delete this.gamepad[gamepad];
      erase.call(this._created, index);
      // this._created.erase(index);

      gamepad.connected = false;
    }
  }

  /**
   * 指定されたindexのゲームパッドが接続中かどうかを返す.
   *
   * Gamepadオブジェクトが未作成の場合でも動作する.
   */
  isConnected(index) {
    index = index || 0;

    return this._rawgamepads[index] && this._rawgamepads[index].connected;
  }

  /**
   * @private
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
  var nav = phina$1.global.navigator;
  if (!nav) return false;

  return (!!nav.getGamepads) || (!!nav.webkitGetGamepads);
})();


/**
 * @class phina.input.Gamepad
 * ゲームパッド
 *
 * 直接インスタンス化せず、phina.input.GamepadManagerオブジェクトから取得して使用する.
 */
class Gamepad {
// phina.define("phina.input.Gamepad", {

  // index: null,
  // buttons: null,
  // /** @type {Array.<phina.geom.Vector2>} */
  // sticks: null,

  // id: null,
  // connected: false,
  // mapping: null,
  // timestamp: null,

  constructor(index) {
    this.index = index || 0;

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
   */
  getKey(button) {
    if (typeof(button) === 'string') {
      button = Gamepad.BUTTON_CODE[button];
    }
    if (this.buttons[button]) {
      return this.buttons[button].pressed;
    } else {
      return false;
    }
  }

  /**
   * ボタンを押した.
   */
  getKeyDown(button) {
    if (typeof(button) === 'string') {
      button = Gamepad.BUTTON_CODE[button];
    }
    if (this.buttons[button]) {
      return this.buttons[button].down;
    } else {
      return false;
    }
  }

  /**
   * ボタンを離した.
   */
  getKeyUp(button) {
    if (typeof(button) === 'string') {
      button = Gamepad.BUTTON_CODE[button];
    }
    if (this.buttons[button]) {
      return this.buttons[button].up;
    } else {
      return false;
    }
  }

  /**
   * 十字キーの入力されている方向.
   */
  getKeyAngle() {
    var angle = null;
    var arrowBit =
      (this.getKey('left') << 3) | // 1000
      (this.getKey('up') << 2) | // 0100
      (this.getKey('right') << 1) | // 0010
      (this.getKey('down')); // 0001

    if (arrowBit !== 0 && ARROW_BIT_TO_ANGLE_TABLE.hasOwnProperty(arrowBit)) {
      angle = ARROW_BIT_TO_ANGLE_TABLE[arrowBit];
    }

    return angle;
  }

  /**
   * 十字キーの入力されている方向をベクトルで.
   * 正規化されている.
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
   */
  getStickAngle(stickId) {
    stickId = stickId || 0;
    var stick = this.sticks[stickId];
    return stick ? Math.atan2(-stick.y, stick.x) : null;
  }

  /**
   * スティックの入力されている方向をベクトルで.
   */
  getStickDirection(stickId) {
    stickId = stickId || 0;
    return this.sticks ? this.sticks[stickId].clone() : new Vector2(0, 0);
  }

  /**
   * @private
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
   * @private
   */
  _updateStateEmpty() {
    for (var i = 0, iend = this.buttons.length; i < iend; i++) {
      this.buttons[i].down = false;
      this.buttons[i].up = false;
    }
  }

  /**
   * @private
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
      button.pressed = value > Gamepad.ANALOGUE_BUTTON_THRESHOLD;
    }

    button.down = (button.pressed ^ button.last) & button.pressed;
    button.up = (button.pressed ^ button.last) & button.last;
  }

  /**
   * @private
   */
  _updateStick(value, stickId, axisName) {
    if (this.sticks[stickId] === undefined) {
      this.sticks[stickId] = new Vector2(0, 0);
    }
    this.sticks[stickId][axisName] = value;
  }

}

/** ブラウザがGamepad APIに対応しているか. */
Gamepad.isAvailable = (function() {
  var nav = phina$1.global.navigator;
  if (!nav) return false;

  return (!!nav.getGamepads) || (!!nav.webkitGetGamepads);
})();

/** アナログ入力対応のボタンの場合、どの程度まで押し込むとonになるかを表すしきい値. */
Gamepad.ANALOGUE_BUTTON_THRESHOLD = 0.5;

/** ボタン名とボタンIDのマップ. */
Gamepad.BUTTON_CODE = {
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
};

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

/**
 * @class phina.input.Accelerometer
 * スマートフォンのセンサー情報
 */
class Accelerometer {

  /** @property  gravity 重力センサー */
  /** @property  acceleration 加速度センサー */
  /** @property  rotation 回転加速度センサー */
  /** @property  orientation スマートフォンの傾き */

  /**
   * @constructor
   */
  constructor() {

    var self = this;
    
    this.gravity        = new Vector3(0, 0, 0);
    this.acceleration   = new Vector3(0, 0, 0);
    this.rotation       = new Vector3(0, 0, 0);
    this.orientation    = new Vector3(0, 0, 0);

    if (phina$1.isMobile()) {
      phina$1.global.addEventListener("devicemotion", function(e) {
        var acceleration = self.acceleration;
        var gravity = self.gravity;
        var rotation = self.rotation;
        
        if (e.acceleration) {
          acceleration.x = e.acceleration.x;
          acceleration.y = e.acceleration.y;
          acceleration.z = e.acceleration.z;
        }
        if (e.accelerationIncludingGravity) {
          gravity.x = e.accelerationIncludingGravity.x;
          gravity.y = e.accelerationIncludingGravity.y;
          gravity.z = e.accelerationIncludingGravity.z;
        }
        if (e.rotationRate) {
          rotation.x = rotation.beta  = e.rotationRate.beta;
          rotation.y = rotation.gamma = e.rotationRate.gamma;
          rotation.z = rotation.alpha = e.rotationRate.alpha;
        }
      });
      
      phina$1.global.addEventListener("deviceorientation", function(e) {
        var orientation = self.orientation;
        orientation.alpha   = e.alpha;  // z(0~360)
        orientation.beta    = e.beta;   // x(-180~180)
        orientation.gamma   = e.gamma;  // y(-90~90)
      });
    }
  }

}

/**
 * @class phina.app.Updater
 */
class Updater {

  constructor(app) {
    this.app = app;
  }

  update(root) {
    this._updateElement(root);
  }

  _updateElement(element) {
    var app = this.app;

    // 更新するかを判定
    if (element.awake === false) return ;

    // エンターフレームイベント
    if (element.has('enterframe')) {
      element.flare('enterframe', {
        app: this.app,
      });
    }

    // 更新
    if (element.update) element.update(app);

    // タッチ判定
    // this._checkPoint(element);

    // 子供を更新
    var len = element.children.length;
    if (element.children.length > 0) {
      var tempChildren = element.children.slice();
      for (var i=0; i<len; ++i) {
        this._updateElement(tempChildren[i]);
      }
    }
  }

  _checkPoint(obj) {
    this.app.pointers.forEach(function(p) {
      if (p.id !== null) {
        this.__checkPoint(obj, p);
      }
    }, this);
  }

  __checkPoint(obj, p) {
    if (!obj.interactive) return ;

    var prevOverFlag = obj._overFlags[p.id];
    var overFlag = obj.hitTest2(p.x, p.y);
    obj._overFlags[p.id] = overFlag;

    if (!prevOverFlag && overFlag) {
      obj.flare('pointover', {
        pointer: p,
      });
    }
    if (prevOverFlag && !overFlag) {
      obj.flare('pointout');
    }

    if (overFlag) {
      if (p.getPointingStart()) {
        obj._touchFlags[p.id] = true;
        obj.flare('pointstart');
      }
    }

    if (obj._touchFlags[p.id]) {
      obj.flare('pointstay');
      if (p._moveFlag) {
        obj.flare('pointmove');
      }
    }

    if (obj._touchFlags[p.id]===true && p.getPointingEnd()) {
      obj._touchFlags[p.id] = false;
      obj.flare('pointend');

      if (obj._overFlags[p.id]) {
        obj._overFlags[p.id] = false;
        obj.flare('pointout');
      }
    }
  }

}

/**
 * @class phina.app.Interactive
 */
class Interactive {

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

      if (phina$1.isMobile() && obj._overFlags[p.id]) {
        obj._overFlags[p.id] = false;
        obj.flare('pointout', e);
        // this._holds.erase(obj);
        erase.call(this._holds, obj);
      }
    }
  }

}

// import { Element } from "../app/element"

/**
 * @class phina.accessory.Accessory
 * @extends phina.util.EventDispatcher
 */
class Accessory extends EventDispatcher {

  /**
   * @constructor
   */
  constructor(target) {
    super();

    this.target = target;
  }

  setTarget(target) {
    if (this.target === target) return ;

    this.target = target;
    return this;
  }

  getTarget() {
    return this.target;
  }

  isAttached() {
    return !!this.target;
  }

  attachTo(element) {
    element.attach(this);
    this.setTarget(element);
    return this;
  }

  remove() {
    this.target.detach(this);
    this.target = null;
  }

}

// Element側で拡張
// phina.app.Element.prototype.$method('attach', function(accessory) {
//   if (!this.accessories) {
//     this.accessories = [];
//     this.on('enterframe', function(e) {
//       this.accessories.each(function(accessory) {
//         accessory.update && accessory.update(e.app);
//       });
//     });
//   }

//   this.accessories.push(accessory);
//   accessory.setTarget(this);
//   accessory.flare('attached');

//   return this;
// });

// phina.app.Element.prototype.$method('detach', function(accessory) {
//   if (this.accessories) {
//     this.accessories.erase(accessory);
//     accessory.setTarget(null);
//     accessory.flare('detached');
//   }

//   return this;
// });

/**
 * @class phina.accessory.Tweener
 * # Tweener
 * Tweenerはオブジェクトのプロパティに対して、
 * Tweenアニメーションの効果を与えるクラスです。  
 * 主に {@link phina.app.Element} とそのサブクラスで使用されます。
 * @extends phina.accessory.Accessory
 */
class Tweener extends Accessory {

  /**
   * アニメーションを更新する方法を指定します。  
   * 変更するとdurationによる時間の進み方が変わります。  
   * 詳しくは{@link #UPDATE_MAP}を参照してください。
   */
  // updateType = 'delta'

  /**
   * @constructor
   */
  constructor(target) {
    super(target);
    this.updateType = 'delta';

    this._init();
  }

  _init() {
    this._loop = false;
    this._tasks = [];
    this._index = 0;
    this.playing = true;
    this._update = this._updateTask;
  }

  /**
   * @param {phina.app.BaseApp} app
   */
  update(app) {
    this._update(app);
  }

  /**
   * {@link #updateType}を変更します。
   * @param {String} type 更新方法を表す文字列
   * @chainable
   */
  setUpdateType(type) {
    this.updateType = type;
    return this;
  }

  /**
   * propsで指定した値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * @param {Object} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   * 
   */
  to(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'to',
      props: props,
      duration: duration,
      easing: easing,
    });
    return this;
  }

  /**
   * アニメーション開始時の値とpropsで指定した値を加算した値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * @param {Object} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  by(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'by',
      props: props,
      duration: duration,
      easing: easing,
    });

    return this;
  }

  /**
   * propsで指定した値からアニメーション開始時の値になるまで、durationで指定した時間をかけて、アニメーションさせます。
   * @param {Object} props 変更したいプロパティをkeyとしたオブジェクト
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  from(props, duration, easing) {
    this._add({
      type: 'tween',
      mode: 'from',
      props: props,
      duration: duration,
      easing: easing,
    });
    return this;
  }

  /**
   * 指定した時間が経過するまで待機します。
   * @param {Number} time waitする時間
   * @chainable
   */
  wait(time) {
    this._add({
      type: 'wait',
      data: {
        limit: time,
      },
    });
    return this;
  }

  /**
   * 現在設定されているアニメーションが終了した時に呼び出される関数をセットします。
   * @param {Function} func 呼び出される関数
   * @param {Object} self (optional) func内でthisにしたいオブジェクト。
   * @param {Object[]} args (optional) funcの引数にしたい値
   * @chainable
   */
  call(func, self, args) {
    this._add({
      type: 'call',
      data: {
        func: func,
        self: self || this,
        args: args,
      },
    });
    return this;
  }

  /**
   * 現在設定されているアニメーションが終了した時にプロパティをセットします。  
   * 第一引数にオブジェクトをセットすることもできます。
   * @param {String | Object} key valueをセットするプロパティ名か、変更したいプロパティをkeyとしたオブジェクト。
   * @param {Object} value (optional) セットする値
   * @chainable
   */
  set(key, value) {
    var values = null;
    if (arguments.length == 2) {
      values = {};
      values[key] = value;
    }
    else {
      values = key;
    }
    this._tasks.push({
      type: "set",
      data: {
        values: values
      }
    });

    return this;
  }

  /**
   * x, yに対して、 {@link #to} の処理を行います。
   * @param {Number} x
   * @param {Number} y
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  moveTo(x, y, duration, easing) {
    return this.to({ x: x, y: y }, duration, easing);
  }
  
  /**
   * x, yに対して、 {@link #by} の処理を行います。
   * @param {Number} x
   * @param {Number} y
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  moveBy(x, y, duration, easing) {
    return this.by({ x: x, y: y }, duration, easing);
  }

  /**
   * rotationに対して、 {@link #to} の処理を行います。
   * @param {Number} rotation
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  rotateTo(rotation, duration, easing) {
    return this.to({ rotation: rotation }, duration, easing);
  }
  
  /**
   * rotationに対して、 {@link #by} の処理を行います。
   * @param {Number} rotation
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  rotateBy(rotation, duration, easing) {
    return this.by({ rotation: rotation }, duration, easing);
  }

  /**
   * scaleX, scaleYに対して {@link #to} の処理を行います。
   * @param {Number} scale scaleXとscaleYに設定する値
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  scaleTo(scale, duration, easing) {
    return this.to({ scaleX: scale, scaleY: scale }, duration, easing);
  }
  /**
   * scaleX, scaleYに対して {@link #by} の処理を行います。
   * @param {Number} scale scaleXとscaleYに設定する値
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  scaleBy(scale, duration, easing) {
    return this.by({ scaleX: scale, scaleY: scale }, duration, easing);
  }

  /**
   * alphaに対して {@link #to} の処理を行います。
   * @param {Number} value alphaに設定する値
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  fade(value, duration, easing) {
    return this.to({ alpha: value }, duration, easing);
  }

  /**
   * alphaを0にするアニメーションを設定します。
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  fadeOut(duration, easing) {
    return this.fade(0.0, duration, easing);
  }

  /**
   * alphaを1にするアニメーションを設定します。
   * @param {Number} duration (optional) アニメーションにかける時間
   * @param {String} easing (optional) easing {@link phina.util.Tween#EASING}を参照してください。
   * @chainable
   */
  fadeIn(duration, easing) {
    return this.fade(1.0, duration, easing);
  }

  /**
   * アニメーション開始
   * @chainable
   */
  play() {
    this.playing = true;
    return this;
  }

  /**
   * アニメーションを一時停止
   * @chainable
   */
  pause() {
    this.playing = false;
    return this;
  }

  /**
   * アニメーションを停止し、最初まで巻き戻します。
   * @chainable
   */
  stop() {
    this.playing = false;
    this.rewind();
    return this;
  }

  /**
   * アニメーションを巻き戻す
   * @chainable
   */
  rewind() {
    this._update = this._updateTask;
    this._index = 0;
    return this;
  }

  yoyo() {
    // TODO: 最初の値が分からないので反転できない...
    this._update = this._updateTask;
    this._index = 0;
    this._tasks.each(function(task) {
      if (task.type === 'tween') ;
    });
    this.play();

    return this;
  }

  /**
   * アニメーションループ設定
   * @param {Boolean} flag
   * @chainable
   */
  setLoop(flag) {
    this._loop = flag;
    return this;
  }

  /**
   * アニメーションをクリア
   * @chainable
   */
  clear() {
    this._init();
    return this;
  }

  /**
   * JSON形式でアニメーションを設定します。
   * @chainable
   * @param {Object} json
   * @param {Boolean} json.loop (optional) ループする場合true
   * @param {Array[]} json.tweens 設定するアニメーション
   * 
   * ```
   * [
   *   [method, arg1, arg2,,,],
   *   ['to', {value: 100}, 1000, 'swing'],
   *   ['wait', 1000],
   *   ['set', 'text', 'END']
   * ]
   * ```
   */
  fromJSON(json) {
    if (json.loop !== undefined) {
      this.setLoop(json.loop);
    }

    json.tweens.each(function(t) {
      t = t.clone();
      var method = t.shift();
      this[method].apply(this, t);
    }, this);

    return this;
  }

  _add(params) {
    this._tasks.push(params);
  }

  _updateTask(app) {
    if (!this.playing) return ;

    var task = this._tasks[this._index];
    if (!task) {
      if (this._loop) {
        this.rewind();
        this._update(app);
      }
      else {
        this.playing = false;
      }
      return ;
    }
    else {
      ++this._index;
    }

    if (task.type === 'tween') {
      // this._tween = phina.util.Tween();
      this._tween = new Tween();

      var duration = task.duration || this._getDefaultDuration();
      if (task.mode === 'to') {
        this._tween.to(this.target, task.props, duration, task.easing);
      }
      else if (task.mode === 'by') {
        this._tween.by(this.target, task.props, duration, task.easing);
      }
      else {
        this._tween.from(this.target, task.props, duration, task.easing);
      }
      this._update = this._updateTween;
      this._update(app);
    }
    else if (task.type === 'wait') {
      this._wait = {
        time: 0,
        limit: task.data.limit,
      };

      this._update = this._updateWait;
      this._update(app);
    }
    else if (task.type === 'call') {
      task.data.func.apply(task.data.self, task.data.args);
      // 1フレーム消費しないよう再帰
      this._update(app);
    }
    else if (task.type === 'set') {
      this.target.$extend(task.data.values);
      // 1フレーム消費しないよう再帰
      this._update(app);
    }
  }

  _updateTween(app) {
    var tween = this._tween;
    var time = this._getUnitTime(app);

    tween.forward(time);
    this.flare('tween');

    if (tween.time >= tween.duration) {
      delete this._tween;
      this._tween = null;
      this._update = this._updateTask;
    }
  }

  _updateWait(app) {
    var wait = this._wait;
    var time = this._getUnitTime(app);
    wait.time += time;

    if (wait.time >= wait.limit) {
      delete this._wait;
      this._wait = null;
      this._update = this._updateTask;
    }
  }

  _getUnitTime(app) {
    var obj = UPDATE_MAP[this.updateType];
    if (obj) {
      return obj.func(app);
    }
    else {
      return 1000 / app.fps;
    }
  }

  _getDefaultDuration() {
    var obj = UPDATE_MAP[this.updateType];
    return obj && obj.duration;
  }

}

/**
 * @static
 * {@link #updateType}に設定する更新方法の定義です。
 * 下記の表に定義済みの更新方法を{@link #updateType}に設定することで、
 * アニメーションの更新方法を変更することができます。
 * 
 * | 更新方法 | 単位(デフォルト値) | 1フレームあたりのアニメーション速度 |
 * |-|-|-|
 * | normal | ミリ秒(1000) | app.fpsによって変化 |
 * | delta | ミリ秒(1000) | 経過時間によって変化 |
 * | fps | フレーム(30) | 必ず同じ速度で変化 |
 */
var UPDATE_MAP = Tweener.UPDATE_MAP = {
  normal: {
    func: function(app) {
      return 1000 / app.fps;
    },
    duration: 1000,
  },

  delta: {
    func: function(app) {
      return app.ticker.deltaTime;
    },
    duration: 1000,
  },

  fps: {
    func: function(app) {
      return 1;
    },
    duration: 30,
  },

};

// Element側で拡張
// /**
//  * @member phina.app.Element
//  * @property tweener
//  * 自身にアタッチ済みの{@link phina.accessory.Tweener}オブジェクト。
//  */
// phina.app.Element.prototype.getter('tweener', function() {
//   if (!this._tweener) {
//     this._tweener = phina.accessory.Tweener().attachTo(this);
//   }
//   return this._tweener;
// });

/**
 * @class phina.app.Element
 * @extends phina.util.EventDispatcher
 * # 主に要素の親子関係を扱うクラス
 * 主に親子関係等を定義するクラスです。
 */
class Element extends EventDispatcher {

  /**
   * @property parent
   * 親要素
   */
  // parent = null;

  /**
   * @property children
   * 子要素
   */
  // children = null;

  /**
   * @property awake
   * 有効かどうか
   */
  // awake = true;

  /**
   * @constructor
   */
  constructor() {
    super();

    this.children = [];
  }

  /**
   * @method addChild
   * 自身に子要素を追加します。
   *
   * 自身を子要素として引数で指定した要素に追加するには {@link #addChildTo} を使用してください。
   *
   * @param {Object} child 追加する子要素
   */
  addChild(child) {
    if (child.parent) child.remove();

    child.parent = this;
    this.children.push(child);

    child.has('added') && child.flare('added');

    return child;
  }

  /**
   * @method addChildTo
   * 自身を子要素として引数で指定した要素に追加します。
   *
   * 自身に子要素を追加するには {@link #addChild} を使用してください。
   *
   * @param {Object} parent 自身を子要素として追加する要素
   */
  addChildTo(parent) {
    parent.addChild(this);

    return this;
  }

  /**
   * @method addChildAt
   * 自身を、指定した要素の子要素の任意の配列インデックスに追加します。
   *
   * @param {Object} child 追加する子要素
   * @param {Number} index インデックス番号
   */
  addChildAt(child, index) {
    if (child.parent) child.remove();

    child.parent = this;
    this.children.splice(index, 0, child);

    child.has('added') && child.flare('added');

    return child;
  }

  /**
   * @method getChildAt
   * 指定したインデックスの子要素を返します。
   *
   * @param {Number} index インデックス番号
   * @return {Object} 指定したインデックスの子要素
   */
  getChildAt(index) {
    // return this.children.at(index);
    return at.call(this.children, index);
  }

  /**
   * @method getChildByName
   * 指定した名前の子要素を返します。（未実装）
   */
  getChildByName(name) {
    // TODO:
  }

  /**
   * @method getChildIndex
   * 指定した子要素のインデックス番号を返します。
   *
   * @param {Object} child 子要素
   * @return {Number} 指定した子要素のインデックス番号
   */
  getChildIndex(child) {
    return this.children.indexOf(child);
  }

  /**
   * @method getParent
   * 指定した要素の親要素を返します。
   *
   * @return {Object} 指定した要素の親要素
   */
  getParent() {
    return this.parent;
  }

  /**
   * @method getRoot
   * 指定した要素の階層ツリーのルートを返します。
   *
   * @return {Object} 指定した要素の階層ツリーのルート
   */
  getRoot() {
    var elm = this;
    for (elm=this.parent; elm.parent != null; elm = elm.parent) {

    }
    return elm;
  }

  /**
   * @method removeChild
   * @chainable
   * 指定した要素を自身の子要素から削除します。
   *
   * @param {Object} child 要素
   */
  removeChild(child) {
    var index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.has('removed') && child.flare('removed');
    }
    return this;
  }

  /**
   * @method remove
   * 自身を親要素の子要素から削除します。
   */
  remove() {
    if (!this.parent) return ;

    this.parent.removeChild(this);
    this.parent = null;

    return this;
  }

  /**
   * @method isAwake
   * 自身が有効かどうかを返します。
   *
   * @return {Boolean} 有効かどうか
   */
  isAwake() {
    return this.awake;
  }

  /**
   * @method wakeUp
   * 自身を有効にします。
   */
  wakeUp() {
    this.awake = true;
    return this;
  }

  /**
   * @method sleep
   * 自身を無効にします。
   */
  sleep() {
    this.awake = false;
    return this;
  }

  /**
   * @method fromJSON
   * JSON 形式を使って自身に子要素を追加することができます。
   *
   * ### Example
   *      this.fromJSON({
   *        "children": {
   *          "label": {                  //キー名が追加する子要素の名前になる
   *            "className": "Label",     //クラス
   *            "arguments": ['hello!'],  //初期化時の引数
   *            "x":320,                  //その他プロパティ
   *            "y":480,
   *          },
   *        },
   *      });
   *
   * @param {JSON} json JSON 形式
   */
  fromJSON(json) {

    var createChildren = function(name, data) {
      //
      var args = data.arguments;
      args = (args instanceof Array) ? args : [args];
      //
      var _class = phina.using(data.className);
      //
      var element = _class.apply(null, args);

      element.name = name;
      this[name] = element;

      element.fromJSON(data);
      element.addChildTo(this);
    }.bind(this);

    forIn.call(json, function(key, value) {
    // json.forIn(function(key, value) {
      if (key === 'children') {
        forIn.call(value, function(name, data) {
        // value.forIn(function(name, data) {
          createChildren(name, data);
        });
      }
      else {
        if (key !== 'type' && key !== 'className') {
          this[key] = value;
        }
      }
    }, this);

    return this;
  }

  /**
   * @method toJSON
   * 自身の子要素を JSON 形式で返します。
   *
   * @return {JSON} JSON形式
   */
  toJSON() {
    var keys = Object.keys(phina.using(this.className).defaults || {});

    this._hierarchies.forEach(function(e) {
      var d = e.defaults;
      if (d) {
        Object.keys(d).forEach(function(k) {
          if (keys.indexOf(k) === -1) {
            keys.push(k);
          }
        });
      }
    });

    keys.push('name', 'className');

    var json = {};
    // keys.each(function(key) {
    keys.forEach(function(key) {
      json[key] = this[key];
    }, this);

    var children = this.children.map(function(child) {
      return child.toJSON();
    });

    if (children.length) {
      json.children = {};
      // children.each(function(child, i) {
      children.forEach(function(child, i) {
        json.children[child.name || (child.className + '_' + i)] = child;
      });
    }

    return json;
  }

  /**
   * accessoryを付与する
   * @param  {Accessory} Accessory継承クラス
   * @return {this}
   */
  attach(accessory) {
    if (!this.accessories) {
      this.accessories = [];
      this.on('enterframe', function(e) {
        this.accessories.forEach(function(accessory) {
          accessory.update && accessory.update(e.app);
        });
      });
    }

    this.accessories.push(accessory);
    accessory.setTarget(this);
    accessory.flare('attached');

    return this;
  }

  /**
   * accessoryを削除
   * @param  {Accessory} Accessory継承クラス
   * @return {this}
   */
  detach(accessory) {
    if (this.accessories) {
      // this.accessories.erase(accessory);
      erase.call(this.accessories, accessory);
      accessory.setTarget(null);
      accessory.flare('detached');
    }

    return this;
  }

  get tweener() {
    if (!this._tweener) {
      this._tweener = new Tweener().attachTo(this);
    }
    return this._tweener;
  }
}

/**
 * @class phina.app.Scene
 * @extends phina.app.Element
 */
class Scene extends Element {

  constructor() {
    super();
  }

  exit(nextLabel, nextArguments) {
    if (!this.app) return ;

    if (arguments.length > 0) {
      if (typeof arguments[0] === 'object') {
        nextLabel = arguments[0].nextLabel || this.nextLabel;
        nextArguments = arguments[0];
      }

      this.nextLabel = nextLabel;
      this.nextArguments = nextArguments;
    }

    this.app.popScene();

    return this;
  }

}

/**
 * @class phina.app.BaseApp
 * ベースとなるアプリケーションクラス
 * @extends phina.util.EventDispatcher
 */
class BaseApp extends EventDispatcher {

  // /** awake */
  // awake = null
  // /** fps */
  // fps = null
  // /** frame */
  // frame = null

  /**
   * @constructor
   */
  constructor() {
    super();
    this._scenes = [new Scene()];
    this._sceneIndex = 0;

    this.updater = new Updater(this);
    this.interactive = new Interactive(this);

    this.awake = true;
    this.ticker = new Ticker();
  }

  run() {
    var self = this;
    this._loopCaller = function() {
      self._loop();
    };
    this.ticker.tick(this._loopCaller);

    this.ticker.start();

    return this;
  }

  kill() {
    this.ticker.stop();
    this.ticker.untick(this._loopCaller);
    return this;
  }

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
   */
  start() {
    this.awake = true;

    return this;
  }

  /**
   * シーンのupdateを実行しないようにする
   */
  stop() {
    this.awake = false;

    return this;
  }

  enableStats() {
    if (phina$1.global.Stats) {
      this.stats = new Stats();
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

  enableDatGUI(callback) {
    if (phina$1.global.dat) {
      var gui = new phina$1.global.dat.GUI();
      callback(gui);
    }
    else {
      // console.warn("not defined dat.GUI.");
      var URL = 'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.5.1/dat.gui.js';
      var script = document.createElement('script');
      script.src = URL;
      document.body.appendChild(script);
      script.onload = function() {
        var gui = new phina$1.global.dat.GUI();
        callback(gui);
      }.bind(this);
    }
    return this;
  }

  _loop() {
    this._update();
    this.interactive.check(this.currentScene);
    this._draw();

    // stats update
    if (this.stats) this.stats.update();
  }

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
   * 描画用仮想関数
   * @private
   */
  _draw() {}

  get currentScene()   { return this._scenes[this._sceneIndex]; }
  set currentScene(v)  { this._scenes[this._sceneIndex] = v; }

  get rootScene()   { return this._scenes[0]; }
  set rootScene(v)  { this._scenes[0] = v; }

  get frame() { return this.ticker.frame; }
  set frame(v) { this.ticker.frame = v; }

  get fps() { return this.ticker.fps; }
  set fps(v) { this.ticker.fps = v; }

  get deltaTime() { return this.ticker.deltaTime; }

  get elapsedTime() { return this.ticker.elapsedTime; }

  get currentTime() { return this.ticker.currentTime; }

  get startTime() { return this.ticker.startTime; }

}

/**
 * @class phina.app.Object2D
 * Object2D
 * @extends phina.app.Element
 */
class Object2D extends Element {

  // /** 位置 */
  // position: null,
  // /** 回転 */
  // rotation: 0,
  // /** スケール */
  // scale: null,
  // /** 基準位置 */
  // origin: null,

  /**
   * @constructor
   */
  constructor(options) {
    super();

    options = $safe.call({}, options, Object2D.defaults);
    // options = ({}).$safe(options, phina.app.Object2D.defaults);

    this.position = new Vector2(options.x, options.y);
    this.scale    = new Vector2(options.scaleX, options.scaleY);
    this.rotation = options.rotation;
    this.origin   = new Vector2(options.originX, options.originY);

    this._matrix = new Matrix33().identity();
    this._worldMatrix = new Matrix33().identity();

    this.interactive = false;
    this._overFlags = {};
    this._touchFlags = {};

    this.width = options.width;
    this.height = options.height;
    this.radius = options.radius;
    this.boundingType = options.boundingType;
  }

  /**
   * 点と衝突しているかを判定
   * @param {Number} x
   * @param {Number} y
   */
  hitTest(x, y) {
    if (this.boundingType === 'rect') {
      return this.hitTestRect(x, y);
    }
    else if (this.boundingType === 'circle') {
      return this.hitTestCircle(x, y);
    }
    else {
      // none の場合
      return true;
    }
  }

  hitTestRect(x, y) {
    var p = this.globalToLocal(new Vector2(x, y));

    var left   = -this.width*this.originX;
    var right  = +this.width*(1-this.originX);
    var top    = -this.height*this.originY;
    var bottom = +this.height*(1-this.originY);

    return ( left < p.x && p.x < right ) && ( top  < p.y && p.y < bottom );
  }

  hitTestCircle(x, y) {
    // 円判定
    var p = this.globalToLocal(new Vector2(x, y));
    if (((p.x)*(p.x)+(p.y)*(p.y)) < (this.radius*this.radius)) {
        return true;
    }
    return false;
  }

  /**
   * 要素と衝突しているかを判定
   * @param {Object} elm
   */
  hitTestElement(elm) {
    var rect0 = this;
    var rect1 = elm;
    return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
           (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
  }


  globalToLocal(p) {
    var matrix = this._worldMatrix.clone();
    matrix.invert();
    // matrix.transpose();

    var temp = matrix.multiplyVector2(p);

    return temp;
  }

  setInteractive(flag, type) {
    this.interactive = flag;
    if (type) {
      this.boundingType = type;
    }

    return this;
  }

  /**
   * X 座標値をセット
   * @param {Number} x
   */
  setX(x) {
    this.position.x = x;
    return this;
  }
  
  /**
   * Y 座標値をセット
   * @param {Number} y
   */
  setY(y) {
    this.position.y = y;
    return this;
  }
  
  /**
   * XY 座標をセット
   * @param {Number} x
   * @param {Number} y
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    return this;
  }

  /**
   * 回転をセット
   * @param {Number} rotation
   */
  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  /**
   * スケールをセット
   * @param {Number} x
   * @param {Number} y
   */
  setScale(x, y) {
    this.scale.x = x;
    if (arguments.length <= 1) {
        this.scale.y = x;
    } else {
        this.scale.y = y;
    }
    return this;
  }
  
  /**
   * 基準点をセット
   * @param {Number} x
   * @param {Number} y
   */
  setOrigin(x, y) {
    this.origin.x = x;
    this.origin.y = y;
    return this;
  }
  
  /**
   * 幅をセット
   * @param {Number} width
   */
  setWidth(width) {
    this.width = width;
    return this;
  }
  
  /**
   * 高さをセット
   * @param {Number} height
   */
  setHeight(height) {
    this.height = height;
    return this;
  }
  
  /**
   * サイズ(幅, 高さ)をセット
   * @param {Number} width
   * @param {Number} height
   */
  setSize(width, height) {
    this.width  = width;
    this.height = height;
    return this;
  }

  setBoundingType(type) {
    this.boundingType = type;
    return this;
  }

  moveTo(x, y) {
    this.position.x = x;
    this.position.y = y;
    return this;
  }

  moveBy(x, y) {
    this.position.x += x;
    this.position.y += y;
    return this;
  }

  _calcWorldMatrix() {
    if (!this.parent) return ;

    // cache check
    if (this.rotation != this._cachedRotation) {
      this._cachedRotation = this.rotation;

      var r = this.rotation*(Math.PI/180);
      this._sr = Math.sin(r);
      this._cr = Math.cos(r);
    }

    var local = this._matrix;
    var parent = this.parent._worldMatrix || Matrix33.IDENTITY;
    var world = this._worldMatrix;

    // ローカルの行列を計算
    local.m00 = this._cr * this.scale.x;
    local.m01 =-this._sr * this.scale.y;
    local.m10 = this._sr * this.scale.x;
    local.m11 = this._cr * this.scale.y;
    local.m02 = this.position.x;
    local.m12 = this.position.y;

    // cache
    var a00 = local.m00; var a01 = local.m01; var a02 = local.m02;
    var a10 = local.m10; var a11 = local.m11; var a12 = local.m12;
    var b00 = parent.m00; var b01 = parent.m01; var b02 = parent.m02;
    var b10 = parent.m10; var b11 = parent.m11; var b12 = parent.m12;

    // 親の行列と掛け合わせる
    world.m00 = b00 * a00 + b01 * a10;
    world.m01 = b00 * a01 + b01 * a11;
    world.m02 = b00 * a02 + b01 * a12 + b02;

    world.m10 = b10 * a00 + b11 * a10;
    world.m11 = b10 * a01 + b11 * a11;
    world.m12 = b10 * a02 + b11 * a12 + b12;

    return this;
  }

  /**
   * @property    x
   * x座標値
   */
  get x()   { return this.position.x; }
  set x(v)  { this.position.x = v; }

  /**
   * @property    y
   * y座標値
   */
  get y()   { return this.position.y; }
  set y(v)  { this.position.y = v; }

  /**
   * @property    originX
   * x座標値
   */
  get originX()   { return this.origin.x; }
  set originX(v)  { this.origin.x = v; }

  /**
   * @property    originY
   * y座標値
   */
  get originY()   { return this.origin.y; }
  set originY(v)  { this.origin.y = v; }

  /**
   * @property    scaleX
   * スケールX値
   */
  get scaleX()   { return this.scale.x; }
  set scaleX(v)  { this.scale.x = v; }
  
  /**
   * @property    scaleY
   * スケールY値
   */
  get scaleY()   { return this.scale.y; }
  set scaleY(v)  { this.scale.y = v; }
  
  /**
   * @property    width
   * width
   */
  get width()   {
    return (this.boundingType === 'rect') ?
      this._width : this._diameter;
  }
  set width(v)  { this._width = v; }
  /**
   * @property    height
   * height
   */
  get height()   {
    return (this.boundingType === 'rect') ?
      this._height : this._diameter;
  }
  set height(v)  { this._height = v; }

  /**
   * @property    radius
   * 半径
   */
  get radius()   {
    return (this.boundingType === 'rect') ?
      (this.width+this.height)/4 : this._radius;
  }
  set radius(v)  {
    this._radius = v;
    this._diameter = v*2;
  }
  
  /**
   * @property    top
   * 左
   */
  get top()   { return this.y - this.height*this.originY; }
  set top(v)  { this.y = v + this.height*this.originY; }

  /**
   * @property    right
   * 左
   */
  get right()   { return this.x + this.width*(1-this.originX); }
  set right(v)  { this.x = v - this.width*(1-this.originX); }

  /**
   * @property    bottom
   * 左
   */
  get bottom()   { return this.y + this.height*(1-this.originY); }
  set bottom(v)  { this.y = v - this.height*(1-this.originY); }

  /**
   * @property    left
   * 左
   */
  get left()   { return this.x - this.width*this.originX; }
  set left(v)  { this.x = v + this.width*this.originX; }

  /**
   * @property    centerX
   * centerX
   */
  get centerX()   { return this.x + this.width/2 - this.width*this.originX; }
  set centerX(v)  {
    // TODO: どうしようかな??
  }

  /**
   * @property    centerY
   * centerY
   */
  get centerY()   { return this.y + this.height/2 - this.height*this.originY; }
  set centerY(v)  {
    // TODO: どうしようかな??
  }
}

Object2D.defaults = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  originX: 0.5,
  originY: 0.5,
  width: 64,
  height: 64,
  radius: 32,
  boundingType: 'rect',
};

/**
 * @class phina.display.DomApp
 * @extends phina.app.BaseApp
 */
class DomApp extends BaseApp {

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
    var eventName = phina$1.isMobile() ? 'touchend' : 'mouseup';
    this.domElement.addEventListener(eventName, this._checkClick.bind(this));

    // 決定時の処理をオフにする(iPhone 時のちらつき対策)
    this.domElement.addEventListener("touchstart", function(e) { e.stop(); });
    this.domElement.addEventListener("touchmove", function(e) { e.stop(); });

    // ウィンドウフォーカス時イベントリスナを登録
    phina$1.global.addEventListener('focus', function() {
      this.flare('focus');
      this.currentScene.flare('focus');
    }.bind(this), false);
    // ウィンドウブラー時イベントリスナを登録
    phina$1.global.addEventListener('blur', function() {
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

/**
 * @class phina.display.CanvasRenderer
 */
class CanvasRenderer {

  constructor(canvas) {
    this.canvas = canvas;
    this._context = this.canvas.context;
  }

  render(scene) {
    this.canvas.clear();
    if (scene.backgroundColor) {
      this.canvas.clearColor(scene.backgroundColor);
    }

    this._context.save();
    this.renderChildren(scene);
    this._context.restore();
  }

  renderChildren(obj) {
    // 子供たちも実行
    if (obj.children.length > 0) {
      var tempChildren = obj.children.slice();
      for (var i=0,len=tempChildren.length; i<len; ++i) {
        this.renderObject(tempChildren[i]);
      }
    }
  }

  renderObject(obj) {
    if (obj.visible === false && !obj.interactive) return;

    obj._calcWorldMatrix && obj._calcWorldMatrix();

    if (obj.visible === false) return;

    obj._calcWorldAlpha && obj._calcWorldAlpha();

    var context = this.canvas.context;

    context.globalAlpha = obj._worldAlpha;
    context.globalCompositeOperation = obj.blendMode;

    if (obj._worldMatrix) {
      // 行列をセット
      var m = obj._worldMatrix;
      context.setTransform( m.m00, m.m10, m.m01, m.m11, m.m02, m.m12 );
    }

    if (obj.clip) {

      context.save();

      obj.clip(this.canvas);
      context.clip();

      if (obj.draw) obj.draw(this.canvas);

      // 子供たちも実行
      if (obj.renderChildBySelf === false && obj.children.length > 0) {
          var tempChildren = obj.children.slice();
          for (var i=0,len=tempChildren.length; i<len; ++i) {
              this.renderObject(tempChildren[i]);
          }
      }

      context.restore();
    }
    else {
      if (obj.draw) obj.draw(this.canvas);

      // 子供たちも実行
      if (obj.renderChildBySelf === false && obj.children.length > 0) {
        var tempChildren = obj.children.slice();
        for (var i=0,len=tempChildren.length; i<len; ++i) {
          this.renderObject(tempChildren[i]);
        }
      }

    }
  }

}

/**
 * @class phina.display.DisplayScene
 * @extends phina.app.Scene
 */
class DisplayScene extends Scene {

  constructor(params) {
    super();

    params = $safe.call({}, params, DisplayScene.defaults);
    // params = ({}).$safe(params, DisplayScene.defaults);

    this.canvas = new Canvas();
    this.canvas.setSize(params.width, params.height);
    this.renderer = new CanvasRenderer(this.canvas);
    this.backgroundColor = (params.backgroundColor) ? params.backgroundColor : null;

    this.width = params.width;
    this.height = params.height;
    this.gridX = new Grid(params.width, 16);
    this.gridY = new Grid(params.height, 16);

    // TODO: 一旦むりやり対応
    this.interactive = true;
    this.setInteractive = function(flag) {
      this.interactive = flag;
    };
    this._overFlags = {};
    this._touchFlags = {};

    var ctx = this.canvas.context;
    if (params.imageSmoothing === false) {
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
    }
  }

  hitTest() {
    return true;
  }

  _update() {
    if (this.update) {
      this.update();
    }
  }

  _render() {
    this.renderer.render(this);
  }

}

DisplayScene.defaults = {
  width: 640,
  height: 960,
  imageSmoothing: true,
};

/**
 * @class phina.display.CanvasApp
 * @extends phina.display.DomApp
 */
class CanvasApp extends DomApp {

  /**
   * @constructor
   */
  constructor(options) {
    options = $safe.call((options || {}), CanvasApp.defaults);
    // options = (options || {}).$safe(CanvasApp.defaults);
    
    if (!options.query && !options.domElement) {
      options.domElement = document.createElement('canvas');
      if (options.append) {
        document.body.appendChild(options.domElement);
      }
    }
    super(options);

    this.gridX = new Grid({
      width: options.width,
      columns: options.columns,
    });
    this.gridY = new Grid({
      width: options.height,
      columns: options.columns,
    });

    this.canvas = new Canvas(this.domElement);
    this.canvas.setSize(options.width, options.height);

    this.backgroundColor = (options.backgroundColor !== undefined) ? options.backgroundColor : 'white';

    this.replaceScene(new DisplayScene({
      width: options.width,
      height: options.height,
    }));

    if (options.fit) {
      this.fitScreen();
    }

    if (options.pixelated) {
      // チラつき防止
      // ドット絵ゲームのサポート
      // https://drafts.csswg.org/css-images/#the-image-rendering
      // https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering#Browser_compatibility
      if (navigator.userAgent.match(/Firefox\/\d+/)) {
        this.domElement.style.imageRendering = 'crisp-edges';
      } else {
        this.domElement.style.imageRendering = 'pixelated';
      }
    }

    // pushScene, popScene 対策
    this.on('push', function() {
      // onenter 対策で描画しておく
      if (this.currentScene.canvas) {
        this._draw();
      }
    });
  }

  _draw() {
    if (this.backgroundColor) {
      this.canvas.clearColor(this.backgroundColor);
    } else {
      this.canvas.clear();
    }

    if (this.currentScene.canvas) {
      this.currentScene._render();

      // this._scenes.each(function(scene) {
      this._scenes.forEach(function(scene) {
        var c = scene.canvas;
        if (c) {
          this.canvas.context.drawImage(c.domElement, 0, 0, c.width, c.height);
        }
      }, this);
    }
  }

  fitScreen() {
    this.canvas.fitScreen();
  }

}

// static
CanvasApp.defaults = {
  width: 640,
  height: 960,
  columns: 12,
  fit: true,
  append: true,
};

/**
 * @class phina.display.DisplayElement
 * @extends phina.app.Object2D
 */
class DisplayElement extends Object2D {

  // /** 表示フラグ */
  // visible: true,
  // /** アルファ */
  // alpha: 1.0,
  // /** ブレンドモード */
  // blendMode: "source-over",

  // /** 子供を 自分のCanvasRenderer で描画するか */
  // renderChildBySelf: false,

  constructor(options) {
    options = $safe.call({}, options||{}, DisplayElement.defaults);
    // options = ({}).$safe(options || {}, phina.display.DisplayElement.defaults);

    super(options);
    this.visible = (options.visible != null) ? options.visible : true;
    this.alpha = (options.alpha != null) ? options.alpha : 1.0;
    this.blendMode = "source-over";
    this.renderChildBySelf = false;
    this._worldAlpha = 1.0;
  }

  /**
   * アルファ値をセット
   */
  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }

  /**
   * 表示/非表示をセット
   */
  setVisible(flag) {
    this.visible = flag;
    return this;
  }

  /**
   * 表示
   */
  show() {
    this.visible = true;
    return this;
  }

  /**
   * 非表示
   */
  hide() {
    this.visible = false;
    return this;
  }

  /**
   * @private
   */
  _calcWorldAlpha() {
    if (this.alpha < 0) {
      this._worldAlpha = 0;
      return;
    }
    if (!this.parent) {
      this._worldAlpha = this.alpha;
      return ;
    }
    else {
      var worldAlpha = (this.parent._worldAlpha !== undefined) ? this.parent._worldAlpha : 1.0;
      // alpha
      this._worldAlpha = worldAlpha * this.alpha;
    }
  }

}

DisplayElement.defaults = {
  alpha: 1.0,
  visible: true,
};

/**
 * @class phina.asset.AssetManager
 * 
 */
class AssetManager {

  static get(type, key) {
    return this.assets[type] && this.assets[type][key];
  }

  static set(type, key, asset) {
    if (!this.assets[type]) {
      this.assets[type] = {};
    }
    this.assets[type][key] = asset;
  }

  static contains(type, key) {
    return ;
  }

}

AssetManager.assets = {
  image: {},
  sound: {},
  spritesheet: {},
};

/**
 * @class phina.display.Sprite
 * @extends phina.display.DisplayElement
 */
class Sprite extends DisplayElement {

  constructor(image, width, height) {
    super();

    this.srcRect = new Rect();
    this.setImage(image, width, height);
  }

  draw(canvas) {
    var image = this.image.domElement;

    // canvas.context.drawImage(image,
    //   0, 0, image.width, image.height,
    //   -this.width*this.origin.x, -this.height*this.origin.y, this.width, this.height
    //   );

    var srcRect = this.srcRect;
    canvas.context.drawImage(image,
      srcRect.x, srcRect.y, srcRect.width, srcRect.height,
      -this._width*this.originX, -this._height*this.originY, this._width, this._height
      );
  }

  setImage(image, width, height) {
    if (typeof image === 'string') {
      image = AssetManager.get('image', image);
    }
    this._image = image;
    this.width = this._image.domElement.width;
    this.height = this._image.domElement.height;

    if (width) { this.width = width; }
    if (height) { this.height = height; }

    this.frameIndex = 0;

    return this;
  }

  setFrameIndex(index, width, height) {
    var tw  = width || this._width;      // tw
    var th  = height || this._height;    // th
    var row = ~~(this.image.domElement.width / tw);
    var col = ~~(this.image.domElement.height / th);
    var maxIndex = row*col;
    index = index%maxIndex;
    
    var x = index%row;
    var y = ~~(index/row);
    this.srcRect.x = x*tw;
    this.srcRect.y = y*th;
    this.srcRect.width  = tw;
    this.srcRect.height = th;

    this._frameIndex = index;

    return this;
  }

  get image() {return this._image;}
  set image(v) {
    this.setImage(v);
    return this;
  }

  get frameIndex() {return this._frameIndex;}
  set frameIndex(idx) {
    this.setFrameIndex(idx);
    return this;
  }
}

/**
 * @class phina.display.PlainElement
 * @extends phina.display.DisplayElement
 */
class PlainElement extends DisplayElement {

  constructor(options) {
    super(options);
    this.canvas = new Canvas();
    this.canvas.setSize(this.width, this.height);
  }

  draw(canvas) {
    var image = this.canvas.domElement;
    var w = image.width;
    var h = image.height;

    var x = -w*this.origin.x;
    var y = -h*this.origin.y;

    canvas.context.drawImage(image,
      0, 0, w, h,
      x, y, w, h
      );
  }
}

/**
 * @class phina.display.Layer
 * @extends phina.display.DisplayElement
 */
class Layer extends DisplayElement {

  /** 子供を 自分の CanvasRenderer で描画するか */
  // renderChildBySelf: true,

  constructor(options) {
    options = $safe.call({}, options||{}, {
    // options = ({}).$safe(options, {
      width: 640,
      height: 960,
    });
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.gridX = new Grid(options.width, 16);
    this.gridY = new Grid(options.height, 16);
    this.renderChildBySelf = true;
  }

  draw(canvas) {
    if (!this.domElement) return ;

    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}


/**
 * @class phina.display.CanvasLayer
 * @extends phina.display.Layer
 */
class CanvasLayer extends Layer {

  constructor(options) {
    super(options);
    this.canvas = new Canvas();
    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    this.renderer = new CanvasRenderer(this.canvas);
    this.domElement = this.canvas.domElement;

    this.on('enterframe', function() {
      var temp = this._worldMatrix;
      this._worldMatrix = null;
      this.renderer.render(this);
      this._worldMatrix = temp;
    });
  }

  draw(canvas) {
    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}


/**
 * @class phina.display.ThreeLayer
 * @extends phina.display.Layer
 */
class ThreeLayer extends Layer {

  // scene: null,
  // camera: null,
  // light: null,
  // renderer: null,

  constructor(options) {
    super(options);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 75, options.width / options.height, 1, 10000 );
    this.camera.position.z = 1000;

    this.light = new THREE.DirectionalLight( 0xffffff, 1 );
    this.light.position.set( 1, 1, 1 ).normalize();
    this.scene.add( this.light );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setSize( options.width, options.height );

    this.on('enterframe', function() {
      this.renderer.render( this.scene, this.camera );
    });

    this.domElement = this.renderer.domElement;
  }
}

/**
 * @class phina.display.Shape
 * @extends phina.display.PlainElement
 */
class Shape extends PlainElement {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.Shape.defaults);
    options = $safe.call({}, options||{}, Shape.defaults);

    super(options);

    this.padding = options.padding;

    this.backgroundColor = options.backgroundColor;
    this.fill = options.fill;
    this.stroke = options.stroke;
    this.strokeWidth = options.strokeWidth;
    this.lineCap = options.lineCap;
    this.lineJoin = options.lineJoin;

    this.shadow = options.shadow;
    this.shadowBlur = options.shadowBlur;

    this.watchDraw = true;
    this._dirtyDraw = true;

    var checkRender = function() {
      // render
      if (this.watchDraw && this._dirtyDraw === true) {
        this.render(this.canvas);
        this._dirtyDraw = false;
      }
    };

    this.on('enterframe', checkRender);
    this.on('added', checkRender);
  }

  calcCanvasWidth() {
    return this.width + this.padding*2;
  }

  calcCanvasHeight() {
    return this.height + this.padding*2;
  }

  calcCanvasSize () {
    return {
      width: this.calcCanvasWidth(),
      height: this.calcCanvasHeight(),
    };
  }

  isStrokable() {
    return this.stroke && 0 < this.strokeWidth;
  }

  /**
   * @virtual
   * @param  {phina.graphics.Canvas} canvas 
   * @return {any}
   */
  prerender(canvas) {

  }

  /**
   * @virtual
   * @param  {phina.graphics.Canvas} canvas 
   * @return {any}
   */
  postrender(canvas) {

  }

  renderFill(canvas) {
    canvas.fill();
  }

  renderStroke(canvas) {
    canvas.stroke();
  }

  render(canvas) {
    var context = canvas.context;
    // リサイズ
    var size = this.calcCanvasSize();
    canvas.setSize(size.width, size.height);
    // クリアカラー
    canvas.clearColor(this.backgroundColor);
    // 中心に座標を移動
    canvas.transformCenter();

    // 描画前処理
    this.prerender(this.canvas);

    // ストローク描画
    if (this.isStrokable()) {
      context.strokeStyle = this.stroke;
      context.lineWidth = this.strokeWidth;
      context.lineCap = this.lineCap;
      context.lineJoin = this.lineJoin;
      context.shadowBlur = 0;
      this.renderStroke(canvas);
    }

    // 塗りつぶし描画
    if (this.fill) {
      context.fillStyle = this.fill;

      // shadow の on/off
      if (this.shadow) {
        context.shadowColor = this.shadow;
        context.shadowBlur = this.shadowBlur;
      }
      else {
        context.shadowBlur = 0;
      }

      this.renderFill(canvas);
    }

    // 描画後処理
    this.postrender(this.canvas);

    return this;
  }

  static watchRenderProperty(key) {
    // this.prototype.$watch(key, function(newVal, oldVal) {
    $watch.call(this.prototype, key, function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this._dirtyDraw = true;
      }
    });
  }

  static watchRenderProperties(keys) {
    var watchRenderProperty = this.watchRenderProperty || Shape.watchRenderProperty;
    keys.forEach(function(key) {
      watchRenderProperty.call(this, key);
    }, this);
  }

}

// static props
Shape.defaults = {
  width: 64,
  height: 64,
  padding: 8,

  backgroundColor: '#aaa',
  fill: '#00a',
  stroke: '#aaa',
  strokeWidth: 4,
  lineCap: 'round',
  lineJoin: 'round',

  shadow: false,
  shadowBlur: 4,
};

// _defined
Shape.watchRenderProperties([
  'width',
  'height',
  'radius',
  'padding',
  'backgroundColor',
  'fill',
  'stroke',
  'strokeWidth',
  'lineCap',
  'lineJoin',
  'shadow',
  'shadowBlur',
]);


/**
 * @class phina.display.RectangleShape
 * @extends phina.display.Shape
 */
class RectangleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.RectangleShape.defaults);
    options = $safe.call({}, options||{}, RectangleShape.defaults);

    super(options);

    this.cornerRadius = options.cornerRadius;
  }

  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

}

// static props
RectangleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'blue',
  stroke: '#aaa',
  strokeWidth: 4,
  cornerRadius: 0,
};

// _defined
Shape.watchRenderProperty.call(RectangleShape, 'cornerRadius');


/**
 * @class phina.display.CircleShape
 * @extends phina.display.Shape
 */
class CircleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.CircleShape.defaults);
    options = $safe.call({}, options||{}, CircleShape.defaults);

    super(options);

    this.setBoundingType('circle');
  }

  prerender(canvas) {
    canvas.circle(0, 0, this.radius);
  }

}

// static props
CircleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'red',
  stroke: '#aaa',
  strokeWidth: 4,
  radius: 32,
};


/**
 * @class phina.display.TriangleShape
 * @extends phina.display.Shape
 */
class TriangleShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.TriangleShape.defaults);
    options = $safe.call({}, options||{}, TriangleShape.defaults);

    super(options);

    this.setBoundingType('circle');
  }

  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, 3);
  }

}

// static props
TriangleShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'green',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
};


/**
 * @class phina.display.StarShape
 * @extends phina.display.Shape
 */
class StarShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.StarShape.defaults);
    options = $safe.call({}, options||{}, StarShape.defaults);

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
    this.sideIndent = options.sideIndent;
  }

  prerender(canvas) {
    canvas.star(0, 0, this.radius, this.sides, this.sideIndent);
  }

}

// static props
StarShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'yellow',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  sides: 5,
  sideIndent: 0.38,
};

// _defined
Shape.watchRenderProperty.call(StarShape, 'sides');
Shape.watchRenderProperty.call(StarShape, 'sideIndent');


/**
 * @class phina.display.PolygonShape
 * @extends phina.display.Shape
 */
class PolygonShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PolygonShape.defaults);
    options = $safe.call({}, options||{}, PolygonShape.defaults);

    super(options);

    this.setBoundingType('circle');
    this.sides = options.sides;
  }

  prerender(canvas) {
    canvas.polygon(0, 0, this.radius, this.sides);
  }

}

// static props
PolygonShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'cyan',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  sides: 5,
};

// defined
Shape.watchRenderProperty.call(PolygonShape, 'sides');


/**
 * @class phina.display.HeartShape
 * @extends phina.display.Shape
 */
class HeartShape extends Shape {

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.HeartShape.defaults);
    options = $safe.call({}, options||{}, HeartShape.defaults);

    super(options);

    this.setBoundingType('circle');
    this.cornerAngle = options.cornerAngle;
  }

  prerender(canvas) {
    canvas.heart(0, 0, this.radius, this.cornerAngle);
  }

}
// static props
HeartShape.defaults = {
  backgroundColor: 'transparent',
  fill: 'pink',
  stroke: '#aaa',
  strokeWidth: 4,

  radius: 32,
  cornerAngle: 45,
};

// defined
Shape.watchRenderProperty.call(HeartShape, 'cornerAngle');


/**
 * @class phina.display.PathShape
 * @extends phina.display.Shape
 */
class PathShape extends Shape {
  // paths: null,

  constructor(options) {
    // options = ({}).$safe(options || {}, phina.display.PathShape.defaults);
    options = $safe.call({}, options||{}, PathShape.defaults);

    super(options);
    this.paths = options.paths || [];
    this.lineJoin = options.lineJoin;
    this.lineCap = options.lineCap;
  }

  setPaths (paths) {
    this.paths = paths;
    this._dirtyDraw = true;
    return this;
  }

  clear () {
    this.paths.length = 0;
    this._dirtyDraw = true;
    return this;
  }

  addPaths (paths) {
    [].push.apply(this.paths, paths);
    this._dirtyDraw = true;
    return this;
  }

  addPath (x, y) {
    this.paths.push(phina.geom.Vector2(x, y));
    this._dirtyDraw = true;
    return this;
  }

  getPath (i) {
    return this.paths[i];
  }

  getPaths () {
    return this.paths;
  }

  changePath (i, x, y) {
    this.paths[i].set(x, y);
    this._dirtyDraw = true;
    return this;
  }

  calcCanvasSize () {
    var paths = this.paths;
    if (paths.length === 0) {
      return {
        width: this.padding * 2,
        height:this.padding * 2,
      };
    }
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;

    for (var i = 0, len = paths.length; i < len; ++i) {
      var path = paths[i];
      if (maxX < path.x) { maxX = path.x; }
      if (minX > path.x) { minX = path.x; }
      if (maxY < path.y) { maxY = path.y; }
      if (minY > path.y) { minY = path.y; }
    }
    return {
      width: Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + this.padding * 2,
      height: Math.max(Math.abs(maxY), Math.abs(minY)) * 2 + this.padding * 2,
    };
  }

  calcCanvasWidth () {
    return this.calcCanvasSize().width;
  }

  calcCanvasHeight () {
    return this.calcCanvasSize().height;
  }

  prerender (canvas) {
    var paths = this.paths;
    if (paths.length > 1) {
      var c = canvas.context;
      var p = paths[0];
      c.beginPath();
      c.moveTo(p.x, p.y);
      for (var i = 1, len = paths.length; i < len; ++i) {
        p = paths[i];
        c.lineTo(p.x, p.y);
      }
    }
  }

}

// static props
PathShape.defaults = {
  fill: false,
  backgroundColor: 'transparent',
};

/**
 * @class phina.display.Label
 * @extends phina.display.Shape
 */
class Label extends Shape {

  /**
   * @constructor
   */
  constructor(options) {
    if (typeof arguments[0] !== 'object') {
      options = { text: arguments[0], };
    }
    else {
      options = arguments[0];
    }

    options = $safe.call({}, options||{}, Label.defaults);
    // options = ({}).$safe(options, phina.display.Label.defaults);

    super(options);

    this.text = options.text;
    this.fontSize = options.fontSize;
    this.fontWeight = options.fontWeight;
    this.fontFamily = options.fontFamily;
    this.align = options.align;
    this.baseline = options.baseline;
    this.lineHeight = options.lineHeight;
  }

  calcCanvasWidth() {
    var width = 0;
    var canvas = this.canvas;
    canvas.context.font = this.font;
    this._lines.forEach(function(line) {
      var w = canvas.context.measureText(line).width;
      if (width < w) {
        width = w;
      }
    }, this);
    if (this.align !== 'center') width*=2;

    return width + this.padding*2;
  }

  calcCanvasHeight() {
    var height = this.fontSize * this._lines.length;
    if (this.baseline !== 'middle') height*=2;
    return height*this.lineHeight + this.padding*2;
  }

  prerender(canvas) {
    var context = canvas.context;
    context.font = this.font;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;

    var lines = this._lines;
    this.lineSize = this.fontSize*this.lineHeight;
    this._offset = -Math.floor(lines.length/2)*this.lineSize;
    this._offset += ((lines.length+1)%2) * (this.lineSize/2);
  }

  renderFill(canvas) {
    var context = canvas.context;
    this._lines.forEach(function(line, i) {
      context.fillText(line, 0, i*this.lineSize+this._offset);
    }, this);
  }

  renderStroke(canvas) {
    var context = canvas.context;
    this._lines.forEach(function(line, i) {
      context.strokeText(line, 0, i*this.lineSize+this._offset);
    }, this);
  }

  /**
   * text
   */
  get text() { return this._text; }
  set text(v) {
    this._text = v;
    this._lines = (this.text + '').split('\n');
  }

  get font() {
    return format.call("{fontWeight} {fontSize}px {fontFamily}", this);
    // return "{fontWeight} {fontSize}px {fontFamily}".format(this);
  }

}

// static props
Label.defaults = {
  backgroundColor: 'transparent',

  fill: 'black',
  stroke: null,
  strokeWidth: 2,

  // 
  text: 'Hello, world!',
  // 
  fontSize: 32,
  fontWeight: '',
  fontFamily: "'HiraKakuProN-W3'", // Hiragino or Helvetica,
  // 
  align: 'center',
  baseline: 'middle',
  lineHeight: 1.2,
};

// defined
Shape.watchRenderProperty.call(Label, 'text');
Shape.watchRenderProperty.call(Label, 'fontSize');
Shape.watchRenderProperty.call(Label, 'fontWeight');
Shape.watchRenderProperty.call(Label, 'fontFamily');
Shape.watchRenderProperty.call(Label, 'align');
Shape.watchRenderProperty.call(Label, 'baseline');
Shape.watchRenderProperty.call(Label, 'lineHeight');

/**
 * @class phina.accessory.FrameAnimation
 * FrameAnimation
 * @extends phina.accessory.Accessory
 */
class FrameAnimation extends Accessory {

  /**
   * @constructor
   */
  constructor(ss) {
    super();

    this.ss = AssetManager.get('spritesheet', ss);
    this.paused = true;
    this.finished = false;
    this.fit = true;
  }

  update() {
    if (this.paused) return ;
    if (!this.currentAnimation) return ;

    if (this.finished) {
      this.finished = false;
      this.currentFrameIndex = 0;
      return ;
    }

    ++this.frame;
    if (this.frame%this.currentAnimation.frequency === 0) {
      ++this.currentFrameIndex;
      this._updateFrame();
    }
  }

  gotoAndPlay(name, keep) {
    keep = (keep !== undefined) ? keep : true;
    if (keep && name === this.currentAnimationName
             && this.currentFrameIndex < this.currentAnimation.frames.length
             && !this.paused) {
      return this;
    }
    this.currentAnimationName = name;
    this.frame = 0;
    this.currentFrameIndex = 0;
    this.currentAnimation = this.ss.getAnimation(name);
    this._updateFrame();

    this.paused = false;

    return this;
  }

  gotoAndStop(name) {
    this.currentAnimationName = name;
    this.frame = 0;
    this.currentFrameIndex = 0;
    this.currentAnimation = this.ss.getAnimation(name);
    this._updateFrame();

    this.paused = true;

    return this;
  }

  _updateFrame() {
    var anim = this.currentAnimation;
    if (anim) {
      if (this.currentFrameIndex >= anim.frames.length) {
        if (anim.next) {
          this.gotoAndPlay(anim.next);
          return ;
        }
        else {
          this.paused = true;
          this.finished = true;
          return ;
        }
      }
    }

    var index = anim.frames[this.currentFrameIndex];
    var frame = this.ss.getFrame(index);
    this.target.srcRect.set(frame.x, frame.y, frame.width, frame.height);

    if (this.fit) {
      this.target.width = frame.width;
      this.target.height = frame.height;
    }
  }

}

/**
 * @class phina.accessory.Draggable
 * Draggable
 * @extends phina.accessory.Accessory
 */
class Draggable extends Accessory {

  /**
   * @constructor
   */
  constructor(target) {
    super(target);

    this.initialPosition = new Vector2(0, 0);
    var self = this;

    this.on('attached', function() {
      this.target.setInteractive(true);

      this._dragging = false;

      this.target.on('pointstart', function(e) {
        if (Draggable._lock) return ;

        this._dragging = true;
        self.initialPosition.x = this.x;
        self.initialPosition.y = this.y;
        self.flare('dragstart');
        this.flare('dragstart');
      });
      this.target.on('pointmove', function(e) {
        if (!this._dragging) return ;

        this.x += e.pointer.dx;
        this.y += e.pointer.dy;
        self.flare('drag');
        this.flare('drag');
      });

      this.target.on('pointend', function(e) {
        if (!this._dragging) return ;

        this._dragging = false;
        self.flare('dragend');
        this.flare('dragend');
      });
    });
  }

  back(time, easing) {
    if (time) {
      var t = this.target;
      t.setInteractive(false);
      var tweener = new Tweener().attachTo(t);
      tweener
        .to({
          x: this.initialPosition.x,
          y: this.initialPosition.y,
        }, time, easing || 'easeOutElastic')
        .call(function() {
          tweener.remove();

          t.setInteractive(true);
          this.flare('backend');
        }, this);
    }
    else {
      this.target.x = this.initialPosition.x;
      this.target.y = this.initialPosition.y;
      this.flare('backend');
    }
  }

  enable() {
    this._enable = true;
  }

  static lock() {
    this._lock = true;
  }

  static unlock() {
    this._lock = false;
  }

}

Draggable._lock = false;

// 呼び出しで拡張する？ TweenerはElement側で定義
// phina.app.Element.prototype.getter('draggable', function() {
//   if (!this._draggable) {
//     this._draggable = phina.accessory.Draggable().attachTo(this);
//   }
//   return this._draggable;
// });

/**
 * @class phina.accessory.Flickable
 * Flickable
 * @extends phina.accessory.Accessory
 */
class Flickable extends Accessory {

  /**
   * @constructor
   */
  constructor(target) {
    super(target);

    this.initialPosition = new Vector2(0, 0);
    var self = this;

    this.friction = 0.9;
    this.velocity = new Vector2(0, 0);
    this.vertical = true;
    this.horizontal = true;

    this.cacheList = [];

    this.on('attached', function() {
      this.target.setInteractive(true);

      this.target.on('pointstart', function(e) {
        self.initialPosition.set(this.x, this.y);
        self.velocity.set(0, 0);
      });
      this.target.on('pointstay', function(e) {
        if (self.horizontal) {
          this.x += e.pointer.dx;
        }
        if (self.vertical) {
          this.y += e.pointer.dy;
        }

        if (self.cacheList.length > 3) self.cacheList.shift();
        self.cacheList.push(e.pointer.deltaPosition.clone());
      });

      this.target.on('pointend', function(e) {
        // 動きのある delta position を後ろから検索　
        var delta = self.cacheList.reverse().find(function(v) {
          return v.lengthSquared() > 10;
        });
        clear.call(self.cacheList);
        // self.cacheList.clear();

        if (delta) {
          self.velocity.x = delta.x;
          self.velocity.y = delta.y;

          self.flare('flickstart', {
            direction: delta.normalize(),
          });
        }
        else {
          self.flare('flickcancel');
        }

        // self.flare('flick');
        // self.flare('flickend');
      });
    });
  }

  update() {
    if (!this.target) return ;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    if (this.horizontal) {
      this.target.position.x += this.velocity.x;
    }
    if (this.vertical) {
      this.target.position.y += this.velocity.y;
    }
  }

  cancel() {
    this.target.x = this.initialPosition.x;
    this.target.y = this.initialPosition.y;
    this.velocity.set(0, 0);

    // TODO: 
    // this.setInteractive(false);
    // this.tweener.clear()
    //     .move(this.initialX, this.initialY, 500, "easeOutElastic")
    //     .call(function () {
    //         this.setInteractive(true);
    //         this.fire(tm.event.Event("backend"));
    //     }.bind(this));
  }

  enable() {
    this._enable = true;
  }

}

// TODO: Element側で呼ぶ？
// phina.app.Element.prototype.getter('flickable', function() {
//   if (!this._flickable) {
//     this._flickable = phina.accessory.Flickable().attachTo(this);
//   }
//   return this._flickable;
// });

/**
 * @class phina.accessory.Physical
 * 本物ではないので名前変えるかも
 * FakePhysical or MarioPhysical or LiePhysical
 * RetroPysical or PysicaLike
 * @extends phina.accessory.Accessory
 */
class Physical extends Accessory  {

  /**
   * @constructor
   */
  constructor(target) {
    super(target);

    this.velocity = new Vector2(0, 0);
    this.gravity = new Vector2(0, 0);

    this.friction = 1.0;
  }

  update() {
    var t = this.target;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.velocity.x += this.gravity.x;
    this.velocity.y += this.gravity.y;

    t.position.x += this.velocity.x;
    t.position.y += this.velocity.y;
  }

  force(x, y) {
    this.velocity.set(x, y);
    return this;
  }

  addForce(x, y) {
    this.velocity.x += x;
    this.velocity.y += y;
    return this;
  }

  setGravity(x, y) {
    this.gravity.set(x, y);
    return this;
  }

  setFriction(fr) {
    this.friction = fr;
    return this;
  }
}

// phina.app.Element.prototype.getter('physical', function() {
//   if (!this._physical) {
//     this._physical = phina.accessory.Physical().attachTo(this);
//   }
//   return this._physical;
// });

/**
 * @class phina.asset.Asset
 * @extends phina.util.EventDispatcher
 */
class Asset extends EventDispatcher {

  // serverError: false,
  // notFound: false,
  // loadError: false,

  /**
   * @constructor
   */
  constructor(src) {
    super();

    this.loaded = false;
    this.serverError = false;
    this.notFound = false;
    this.loadError = false;
  }

  load(src) {
    this.src = src;
    return new Flow(this._load.bind(this));
  }

  isLoaded() {
    return this.loaded;
  }

  _load(resolve) {
    var self = this;
    setTimeout(function() {
      self.loaded = true;
      resolve();
    }, 100);
  }

  // ロード失敗時にダミーをセットする
  loadDummy() { }

}

var getFirst = function(array) { return first.get.call(array); };
var getLast = function(array) { return last.get.call(array); };

/**
 * @class phina.asset.Texture
 * @extends phina.asset.Asset
 */
class Texture extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  _load(resolve) {
    this.domElement = new Image();

    var isLocal = (location.protocol == 'file:');
    if ( !isLocal && !(/^data:/.test(this.src)) ) ;

    var self = this;
    this.domElement.onload = function(e) {
      self.loaded = true;
      resolve(self);
    };
    this.domElement.onerror = function(e) {
      console.error("[phina.js] not found `{0}`!".format(this.src));

      // var key = self.src.split('/').last.replace('.png', '').split('?').first.split('#').first;
      var key = getFirst(
        getFirst(
          getLast(
            self.src.split('/')
          ).replace('.png', '').split('?')
        ).split('#')
      );
      e.target.onerror = null;
      e.target.src = "http://dummyimage.com/128x128/444444/eeeeee&text=" + key;
    };

    this.domElement.src = this.src;
  }

  clone() {
    var image = this.domElement;
    var canvas = new Canvas().setSize(image.width, image.height);
    var t = new Texture();
    canvas.context.drawImage(image, 0, 0);
    t.domElement = canvas.domElement;
    return t;
  }

  transmit(color) {
    // imagaオブジェクトをゲット
    var image = this.domElement;
    // 新規canvas作成
    var canvas = new Canvas().setSize(image.width, image.height);
    // 新規canvasに描画
    canvas.context.drawImage(image, 0, 0);
    // canvas全体のイメージデータ配列をゲット
    var imageData = canvas.context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    // 透過色の指定がなければ左上のrgb値を抽出
    var r = (color !== undefined) ? color.r : data[0];
    var g = (color !== undefined) ? color.g : data[1];
    var b = (color !== undefined) ? color.b : data[2];
    // 配列を4要素目から4つ飛び（アルファ値）でループ
    // (3).step(data.length, 4, function(i) {
    step.call(3, data.length, 4, function(i) {
      // rgb値を逆算でゲットし、左上のrgbと比較
      if (data[i - 3] === r && data[i - 2] === g && data[i - 1] === b) {
        // 一致した場合はアルファ値を書き換える
        data[i] = 0;
      }
    });
    // 書き換えたイメージデータをcanvasに戻す
    canvas.context.putImageData(imageData, 0, 0);

    this.domElement = canvas.domElement;
  }

  filter(filters) {
    if (!filters) {
      return this;
    }
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    var image = this.domElement;
    var w = image.width;
    var h = image.height;
    var canvas = new Canvas().setSize(w, h);
    var imageData = null;

    canvas.context.drawImage(image, 0, 0);
    imageData = canvas.context.getImageData(0, 0, w, h);
    filters.forEach( function (fn) {
      if (typeof fn == 'function') {
        // h.times( function (y) {
        times.call(h, function (y) {
          // w.times( function (x) {
          times(w, function (x) {
            var i = (y * w + x) * 4;
            var pixel = imageData.data.slice(i, i + 4);
            fn(pixel, i, x, y, imageData);
          });
        });
      }
    });
    canvas.context.putImageData(imageData, 0, 0);
    this.domElement = canvas.domElement;
    return this;
  }

}

/**
 * @class phina.asset.Sound
 * @extends phina.asset.Asset
 */
class Sound extends Asset {
  
  // _loop: false,
  // _loopStart: 0,
  // _loopEnd: 0,
  // _playbackRate: 1,
  
  /**
   * @constructor
   */
  constructor() {
    super();
    this._loop = false;
    this._loopStart = 0;
    this._loopEnd = 0;
    this._playbackRate = 1;
    this.context = Sound.getAudioContext();
    this.gainNode = this.context.createGain();
  }

  play(when, offset, duration) {
    when = when ? when + this.context.currentTime : 0;
    offset = offset || 0;

    if (this.source) ;

    var source = this.source = this.context.createBufferSource();
    var buffer = source.buffer = this.buffer;
    source.loop = this._loop;
    source.loopStart = this._loopStart;
    source.loopEnd = this._loopEnd;
    source.playbackRate.value = this._playbackRate;

    // connect
    source.connect(this.gainNode);
    this.gainNode.connect(Sound.getMasterGain());
    // play
    if (duration !== undefined) {
      source.start(when, offset, duration);
    }
    else {
      source.start(when, offset);
    }
    
    // check play end
    source.addEventListener('ended', function(){
      this.flare('ended');
    }.bind(this));

    return this;
  }

  stop() {
    // stop
    if (this.source) {
      // stop すると source.endedも発火する
      this.source.stop && this.source.stop(0);
      this.source = null;
      this.flare('stop');
    }

    return this;
  }

  pause() {
    this.source.playbackRate.value = 0;
    this.flare('pause');
    return this;
  }

  resume() {
    this.source.playbackRate.value = this._playbackRate;
    this.flare('resume');
    return this;
  }

  // 試してみるなう
  _oscillator(type) {
    var context = this.context;

    var oscillator = context.createOscillator();

    // Sine wave is type = “sine”
    // Square wave is type = “square”
    // Sawtooth wave is type = “saw”
    // Triangle wave is type = “triangle”
    // Custom wave is type = “custom” 
    oscillator.type = type || 'sine';

    this.source = oscillator;
    // connect
    this.source.connect(context.destination);
  }

  loadFromBuffer(buffer) {
    var context = this.context;

    // set default buffer
    if (!buffer) {
      buffer = context.createBuffer( 1, 44100, 44100 );
      var channel = buffer.getChannelData(0);

      for( var i=0; i < channel.length; i++ )
      {
        channel[i] = Math.sin( i / 100 * Math.PI);
      }
    }

    // source
    this.buffer = buffer;
  }

  setLoop(loop) {
    this.loop = loop;
    return this;
  }

  setLoopStart(loopStart) {
    this.loopStart = loopStart;
    return this;
  }

  setLoopEnd(loopEnd) {
    this.loopEnd = loopEnd;
    return this;
  }
  
  setPlaybackRate(playbackRate) {
    this.playbackRate = playbackRate;
    return this;
  }

  _load(r) {
    if (/^data:/.test(this.src)) {
      this._loadFromURIScheme(r);
    }
    else {
      this._loadFromFile(r);
    }
  }

  _loadFromFile(r) {
    var self = this;

    var xml = new XMLHttpRequest();
    xml.open('GET', this.src);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {

          // 音楽バイナリーデータ
          var data = xml.response;

          // webaudio 用に変換
          self.context.decodeAudioData(data, function(buffer) {
            self.loadFromBuffer(buffer);
            r(self);
          }, function() {
            console.warn("音声ファイルのデコードに失敗しました。(" + self.src + ")");
            r(self);
            self.flare('decodeerror');
          });

        } else if (xml.status === 404) {
          // not found

          self.loadError = true;
          self.notFound= true;
          r(self);
          self.flare('loaderror');
          self.flare('notfound');

        } else {
          // サーバーエラー

          self.loadError = true;
          self.serverError = true;
          r(self);
          self.flare('loaderror');
          self.flare('servererror');
        }
      }
    };

    xml.responseType = 'arraybuffer';

    xml.send(null);
  }

  _loadFromURIScheme(r) {
    var byteString = '';
    if (this.src.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(this.src.split(',')[1]);
    }
    else {
      byteString = unescape(this.src.split(',')[1]);
    }

    var self = this;
    var len = byteString.length;
    var buffer = new Uint8Array(len);

    for (var i=0; i<len; ++i) {
      buffer[i] = byteString.charCodeAt(i);
    }

    // webaudio 用に変換
    this.context.decodeAudioData(buffer.buffer, function(buffer) {
      self.loadFromBuffer(buffer);
      r(self);
    }, function() {
      console.warn("音声ファイルのデコードに失敗しました。(" + self.src + ")");
      self.loaded = true;
      r(self);
    });
  }

  loadDummy() {
    this.loadFromBuffer();
  }

  get volume()  { return this.gainNode.gain.value; }
  set volume(v) { this.gainNode.gain.value = v; }

  get loop()  { return this._loop; }
  set loop(v) {
    this._loop = v;
    if (this.source) this.source._loop = v;
  }

  get loopStart()  { return this._loopStart; }
  set loopStart(v) {
    this._loopStart = v;
    if (this.source) this.source._loopStart = v;
  }

  get loopEnd()  { return this._loopEnd; }
  set loopEnd(v) {
    this._loopEnd = v;
    if (this.source) this.source._loopEnd = v;
  }

  get playbackRate() { return this._playbackRate; }
  set playbackRate(v) {
    this._playbackRate = v;
    if(this.source && this.source.playbackRate.value !== 0){
      this.source.playbackRate.value = v;
    }
  }

  static getMasterGain() {
    if(!this._masterGain) {
      var context = this.getAudioContext();
      this._masterGain = context.createGain();
      this._masterGain.connect(context.destination);
    }
    return this._masterGain;
  }

  static getAudioContext() {
    if (!Support.webAudio) return null;

    if (this.context) return this.context;

    var g = phina$1.global;
    var context = null;

    if (g.AudioContext) {
      context = new AudioContext();
    }
    else if (g.webkitAudioContext) {
      context = new webkitAudioContext();
    }
    else if (g.mozAudioContext) {
      context = new mozAudioContext();
    }

    this.context = context;

    return context;
  }

}

// defined
accessor.call(Sound, 'volume', {
// this.accessor('volume', {
  get: function() {
    return this.getMasterGain().gain.value;
  },
  set: function(v) {
    this.getMasterGain().gain.value = v;
  },
});

/**
 * @class phina.asset.Script
 * @extends phina.asset.Asset
 */
class Script extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  _load(resolve) {
    var self = this;
    this.domElement = document.createElement('script');
    this.domElement.src = this.src;

    this.domElement.onload = function() {
      resolve(self);
    }.bind(this);

    document.body.appendChild(this.domElement);
  }

}

/**
 * @class phina.asset.SpriteSheet
 * @extends phina.asset.Asset
 */
class SpriteSheet extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  setup(params) {
    this._setupFrame(params.frame);
    this._setupAnim(params.animations);
    return this;
  }

  _load(resolve) {

    var self = this;

    if (typeof this.src === 'string') {
      var xml = new XMLHttpRequest();
      xml.open('GET', this.src);
      xml.onreadystatechange = function() {
        if (xml.readyState === 4) {
          if ([200, 201, 0].indexOf(xml.status) !== -1) {
            var data = xml.responseText;
            var json = JSON.parse(data);

            self.setup(json);

            resolve(self);
          }
        }
      };

      xml.send(null);
    }
    else {
      this.setup(this.src);
      resolve(self);
    }

  }

  _setupFrame(frame) {
    var frames = this.frames = [];
    var unitWidth = frame.width;
    var unitHeight = frame.height;

    var count = frame.rows * frame.cols;
    this.frame = count;

    times.call(count, function(i) {
    // (count).times(function(i) {
      var xIndex = i%frame.cols;
      var yIndex = (i/frame.cols)|0;

      frames.push({
        x: xIndex*unitWidth,
        y: yIndex*unitHeight,
        width: unitWidth,
        height: unitHeight,
      });
    });
  }

  _setupAnim(animations) {
    this.animations = {};

    // デフォルトアニメーション
    this.animations["default"] = {
        frames: range.call([], 0, this.frame),
        // frames: [].range(0, this.frame),
        next: "default",
        frequency: 1,
    };

    forIn.call(animations, function(key, value) {
    // animations.forIn(function(key, value) {
      var anim = value;

      if (anim instanceof Array) {
        this.animations[key] = {
          frames: range.call([], anim[0], anim[1]),
          // frames: [].range(anim[0], anim[1]),
          next: anim[2],
          frequency: anim[3] || 1,
        };
      }
      else {
        this.animations[key] = {
          frames: anim.frames,
          next: anim.next,
          frequency: anim.frequency || 1
        };
      }

    }, this);
  }

  /**
   * フレームを取得
   */
  getFrame(index) {
    return this.frames[index];
  }

  getAnimation(name) {
    name = (name !== undefined) ? name : "default";
    return this.animations[name];
  }

}

/**
 * @class phina.asset.Font
 * @extends phina.asset.Asset
 */
class Font extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
    this.fontName = null;
  }

  load(path) {
    path = path.replace(/\\/g, "/");
    this.src = path;

    var reg = /(.*)(?:\.([^.]+$))/;
    var key = this.fontName || last.call(path.match(reg)[1].split('/'));    //フォント名指定が無い場合はpathの拡張子前を使用
    // var key = this.fontName || path.match(reg)[1].split('/').last;    //フォント名指定が無い場合はpathの拡張子前を使用
    var type = path.match(reg)[2];
    var format$1 = "unknown";
    switch (type) {
      case "ttf":
        format$1 = "truetype"; break;
      case "otf":
        format$1 = "opentype"; break;
      case "woff":
        format$1 = "woff"; break;
      case "woff2":
        format$1 = "woff2"; break;
      default:
        console.warn("サポートしていないフォント形式です。(" + path + ")");
    }
    this.format = format$1;
    this.fontName = key;

    if (format$1 !== "unknown") {
      var text = format.call("@font-face { font-family: '{0}'; src: url({1}) format('{2}'); }", key, path, format$1);
      // var text = "@font-face { font-family: '{0}'; src: url({1}) format('{2}'); }".format(key, path, format);
      var e = document.querySelector("head");
      var fontFaceStyleElement = document.createElement("style");
      if (fontFaceStyleElement.innerText) {
        fontFaceStyleElement.innerText = text;
      } else {
        fontFaceStyleElement.textContent = text;
      }
      e.appendChild(fontFaceStyleElement);
    }

    return new Flow(this._load.bind(this));
  }

  _load(resolve) {
    if (this.format !== "unknown") {
      this._checkLoaded(this.fontName, function() {
        this.loaded = true;
        resolve(this);
      }.bind(this));
    } else {
      this.loaded = true;
      resolve(this);
    }
  }

  _checkLoaded (font, callback) {
    var canvas = new Canvas();
    var DEFAULT_FONT = canvas.context.font.split(' ')[1];
    canvas.context.font = '40px ' + DEFAULT_FONT;

    var checkText = "1234567890-^\\qwertyuiop@[asdfghjkl;:]zxcvbnm,./\!\"#$%&'()=~|QWERTYUIOP`{ASDFGHJKL+*}ZXCVBNM<>?_１２３４５６７８９０－＾￥ｑｗｅｒｔｙｕｉｏｐａｓｄｆｇｈｊｋｌｚｘｃｖｂｎｍ，．あいうかさたなをん時は金なり";
    // 特殊文字対応
    checkText += String.fromCharCode("0xf04b");

    var before = canvas.context.measureText(checkText).width;
    canvas.context.font = '40px ' + font + ', ' + DEFAULT_FONT;

    var timeoutCount = 30;
    var checkLoadFont = function () {
      var after = canvas.context.measureText(checkText).width;
      if (after !== before) {
        setTimeout(function() {
          callback && callback();
        }, 100);
      } else {
        if (--timeoutCount > 0) {
          setTimeout(checkLoadFont, 100);
        }
        else {
          callback && callback();
          console.warn("timeout font loading");
        }
      }
    };
    checkLoadFont();
  }

  setFontName(name) {
    if (this.loaded) {
      console.warn("フォント名はLoad前にのみ設定が出来ます(" + name + ")");
      return this;
    }
    this.fontName = name;
    
    return this;
  }

  getFontName() {
    return this.fontName;
  }

}

/**
 * @class phina.asset.File
 * @extends phina.asset.Asset
 */
class File extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  _load(resolve) {

    var params = {};

    if (typeof this.src === 'string') {
      $extend.call(params, {
      // params.$extend({
        path: this.src,
      });
    }
    else if (typeof this.src === 'object') {
      $extend.call(params, this.src);
      // params.$extend(this.src);
    }

    $safe.call(params, {
    // params.$safe({
      path: '',
      dataType: 'text',
    });

    // load
    var self = this;
    var xml = new XMLHttpRequest();
    xml.open('GET', params.path);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {
          var data = xml.responseText;

          if (params.dataType === 'json') {
            data = JSON.parse(data);
          } else if (params.dataType === 'xml') {
            data = (new DOMParser()).parseFromString(data, "text/xml");
          }
          self.dataType = params.dataType;

          self.data = data;
          resolve(self);
        }
      }
    };

    xml.send(null);
    // this.domElement = new Image();
    // this.domElement.src = this.src;

    // var self = this;
    // this.domElement.onload = function() {
    //   self.loaded = true;
    //   resolve(self);
    // };
  }

}

/**
 * @class phina.asset.AssetLoader
 * @extends phina.util.EventDispatcher
 */
class AssetLoader extends EventDispatcher {

  /**
   * @constructor
   */
  constructor(params) {
    super();

    // params = (params || {}).$safe({
    //   cache: true,
    // });
    params = $safe.call(params||{}, { cache: true });

    this.assets = {};
    this.cache = params.cache;
  }

  load(params) {
    var self = this;
    var flows = [];

    var counter = 0;
    var length = 0;
    forIn.call(params, function(type, assets) {
    // params.forIn(function(type, assets) {
      length += Object.keys(assets).length;
    });
    
    forIn.call(params, function(type, assets) {
    // params.forIn(function(type, assets) {
      forIn.call(assets, function(key, value) {
      // assets.forIn(function(key, value) {
        var func = AssetLoader.assetLoadFunctions[type];
        var flow = func(key, value);
        flow.then(function(asset) {
          if (self.cache) {
            AssetManager.set(type, key, asset);
          }
          self.flare('progress', {
            key: key,
            asset: asset,
            progress: (++counter/length),
          });
        });
        flows.push(flow);
      });
    });


    if (self.cache) {

      self.on('progress', function(e) {
        if (e.progress >= 1.0) {
          // load失敗時、対策

          forIn.call(params, function(type, assets) {
          // params.forIn(function(type, assets) {
            forIn.call(assets, function(key, value) {
            // assets.forIn(function(key, value) {
              var asset = AssetManager.get(type, key);
              if (asset.loadError) {
                var dummy = AssetManager.get(type, 'dummy');
                if (dummy) {
                  if (dummy.loadError) {
                    dummy.loadDummy();
                    dummy.loadError = false;
                  }
                  AssetManager.set(type, key, dummy);
                } else {
                  asset.loadDummy();
                }
              }
            });
          });
        }
      });
    }
    return Flow.all(flows).then(function(args) {
      self.flare('load');
    });
  }

  static register(key, func) {
    this.assetLoadFunctions[key] = func;
    return this;
  }

}

AssetLoader.assetLoadFunctions = {
  image: function(key, path) {
    var texture = new Texture();
    var flow = texture.load(path);
    return flow;
  },
  sound: function(key, path) {
    var sound = new Sound();
    var flow = sound.load(path);
    return flow;
  },
  spritesheet: function(key, path) {
    var ss = new SpriteSheet();
    var flow = ss.load(path);
    return flow;
  },
  script: function(key, path) {
    var script = new Script();
    return script.load(path);
  },
  font: function(key, path) {
    var font = new Font();
    font.setFontName(key);
    return font.load(path);
  },
  json: function(key, path) {
    var text = new File();
    return text.load({
      path: path,
      dataType: "json",
    });
  },
  xml: function(key, path) {
    var text = new File();
    return text.load({
      path: path,
      dataType: "xml",
    });
  },
  text: function(key, path) {
    var text = new File();
    return text.load(path);
  }
};

/**
 * @class phina.asset.SoundManager
 * ### Ref
 * - http://evolve.reintroducing.com/_source/classes/as3/SoundManager/SoundManager.html
 * - https://github.com/nicklockwood/SoundManager
 */
class SoundManager {
  // volume: 0.8,
  // musicVolume: 0.8,
  // muteFlag: false,
  // currentMusic: null,

  static play(name, when, offset, duration) {
    var sound = AssetManager.get('sound', name);

    sound.volume = this.getVolume();
    sound.play(when, offset, duration);

    return sound;
  }

  static stop() {
    // TODO: 
  }
  static pause() {
    // TODO: 
  }
  static fade() {
    // TODO: 
  }
  static setVolume(volume) {
    this.volume = volume;
  }
  static getVolume() {
    return this.volume;
  }

  /*
   * ミュート
   */
  static mute() {
    this.muteFlag = true;
    if (this.currentMusic) {
      this.currentMusic.volume = 0;
    }
    return this;
  }
  /*
   * ミュート解除
   */
  static unmute() {
    this.muteFlag = false;
    if (this.currentMusic) {
      this.currentMusic.volume = this.getVolumeMusic();
    }
    return this;
  }
  static isMute() {
    return this.muteFlag;
  }

  static playMusic(name, fadeTime, loop, when, offset, duration) {
    loop = (loop !== undefined) ? loop : true;

    if (this.currentMusic) {
      this.stopMusic(fadeTime);
    }

    var music = AssetManager.get('sound', name);

    music.setLoop(loop);
    music.play(when, offset, duration);

    if (fadeTime > 0) {
      var count = 32;
      var counter = 0;
      var unitTime = fadeTime/count;
      var volume = this.getVolumeMusic();

      music.volume = 0;
      var id = setInterval(function() {
        counter += 1;
        var rate = counter/count;
        music.volume = rate*volume;

        if (rate >= 1) {
          clearInterval(id);
          return false;
        }

        return true;
      }, unitTime);
    }
    else {
      music.volume = this.getVolumeMusic();
    }

    this.currentMusic = music;

    return this.currentMusic;
  }

  static stopMusic(fadeTime) {
    if (!this.currentMusic) { return ; }

    var music = this.currentMusic;
    this.currentMusic = null;

    if (fadeTime > 0) {
      var count = 32;
      var counter = 0;
      var unitTime = fadeTime/count;
      var volume = this.getVolumeMusic();

      music.volume = 0;
      var id = setInterval(function() {
        counter += 1;
        var rate = counter/count;
        music.volume = volume*(1-rate);

        if (rate >= 1) {
          music.stop();
          clearInterval(id);
          return false;
        }

        return true;
      }, unitTime);
    }
    else {
      music.stop();
    }
  }

  /*
   * 音楽を一時停止
   */
  static pauseMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.pause();
  }
  /*
   * 音楽を再開
   */
  static resumeMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.resume();
  }
  /*
   * 音楽のボリュームを設定
   */
  static setVolumeMusic(volume) {
    this.musicVolume = volume;
    if (this.currentMusic) {
      this.currentMusic.volume = volume;
    }

    return this;
  }
  /*
   * 音楽のボリュームを取得
   */
  static getVolumeMusic() {
    return this.musicVolume;
  }

}

// static props
SoundManager.volume = 0.8;
SoundManager.musicVolume = 0.8;
SoundManager.muteFlag = false;
SoundManager.currentMusic = null;

/**
 * @class phina.ui.Button
 * Button
 * @extends phina.display.Shape
 */
class Button extends Shape {

  /**
   * @constructor
   */
  constructor(options) {
    options = $safe.call(options || {}, Button.defaults);
    // options = (options || {}).$safe(phina.ui.Button.defaults);
    super(options);

    this.cornerRadius = options.cornerRadius;
    this.text         = options.text;
    this.fontColor    = options.fontColor;
    this.fontSize     = options.fontSize;
    this.fontWeight     = options.fontWeight;
    this.fontFamily   = options.fontFamily;

    this.setInteractive(true);
    this.on('pointend', function() {
      this.flare('push');
    });
  }

  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

  postrender(canvas) {
    var context = canvas.context;
    // text
    var font = "{fontWeight} {fontSize}px {fontFamily}".format(this);
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = this.fontColor;
    context.fillText(this.text, 0, 0);
  }

}

// static props
Button.defaults = {
  width: 200,
  height: 80,
  backgroundColor: 'transparent',
  fill: 'hsl(200, 80%, 60%)',
  stroke: null,

  cornerRadius: 8,
  text: 'Hello',
  fontColor: 'white',
  fontSize: 32,
  fontWeight: '',
  fontFamily: "'HiraKakuProN-W3'", // Hiragino or Helvetica,
};

// defined
Shape.watchRenderProperty.call(Button, 'cornerRadius');
Shape.watchRenderProperty.call(Button, 'text');
Shape.watchRenderProperty.call(Button, 'fontColor');
Shape.watchRenderProperty.call(Button, 'fontSize');
Shape.watchRenderProperty.call(Button, 'fontFamily');

/**
 * @class phina.ui.Gauge
 * @extends phina.display.Shape
 */
class Gauge extends Shape {

  constructor(options) {
    options = $safe.call({}, options || {}, Gauge.defaults);
    // options = ({}).$safe(options || {}, phina.ui.Gauge.defaults);
    
    super(options);

    this._value = (options.value !== undefined) ? options.value : options.maxValue;
    this.maxValue = options.maxValue;
    this.gaugeColor = options.gaugeColor;
    this.cornerRadius = options.cornerRadius;

    this.visualValue = (options.value !== undefined) ? options.value : options.maxValue;
    this.animation = options.animation;
    this.animationTime = 1*1000;
  }

  /**
   * 満タンかをチェック
   */
  isFull() {
    return this.value === this.maxValue;
  }

  /**
   * 空っぽかをチェック
   */
  isEmpty() {
    return this.value === 0;
  }

  setValue(value) {
    value = clamp(value, 0, this.maxValue);
    // value = Math.clamp(value, 0, this.maxValue);

    // end when now value equal value of argument
    if (this.value === value) return ;

    // fire value change event
    this.flare('change');

    this._value = value;

    if (this.animation) {
      var range = Math.abs(this.visualValue-value);
      var time = (range/this.maxValue)*this.animationTime;

      this.tweener.ontween = function() {
        this._dirtyDraw = true;
      }.bind(this);
      this.tweener
        .clear()
        .to({'visualValue': value}, time)
        .call(function() {
          this.flare('changed');
          if (this.isEmpty()) {
            this.flare('empty');
          }
          else if (this.isFull()) {
            this.flare('full');
          }
        }, this);
    }
    else {
      this.visualValue = value;
      this.flare('changed');
      if (this.isEmpty()) {
        this.flare('empty');
      }
      else if (this.isFull()) {
        this.flare('full');
      }
    }
  }

  getRate() {
    var rate = this.visualValue/this.maxValue;
    return rate;
  }

  prerender(canvas) {
    canvas.roundRect(-this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
  }

  postrender(canvas) {
    var rate = this.getRate();
    canvas.context.fillStyle = this.gaugeColor;
    canvas.context.save();
    canvas.context.clip();
    canvas.fillRect(-this.width/2, -this.height/2, this.width*rate, this.height);
    canvas.context.restore();
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this.setValue(v);
  }

}

// static props
Gauge.defaults = {
  width: 256,
  height: 32,
  backgroundColor: 'transparent',
  fill: 'white',
  stroke: '#aaa',
  strokeWidth: 4,
  maxValue: 100,
  gaugeColor: '#44f',
  cornerRadius: 0,
  animation: true
};

// defined
Shape.watchRenderProperty.call(Gauge, 'value');
Shape.watchRenderProperty.call(Gauge, 'maxValue');
Shape.watchRenderProperty.call(Gauge, 'gaugeColor');
Shape.watchRenderProperty.call(Gauge, 'cornerRadius');


/**
 * @class phina.ui.CircleGauge
 * @extends phina.ui.Gauge
 */
class CircleGauge extends Gauge {

  constructor(options) {
    options = $safe.call(options || {}, {
    // options = (options || {}).$safe({
      backgroundColor: 'transparent',
      fill: '#aaa',
      stroke: '#222',

      radius: 64,
      anticlockwise: true,
      showPercentage: false, // TODO
    });

    super(options);

    this.setBoundingType('circle');

    this.radius = options.radius;
    this.anticlockwise = options.anticlockwise;
    this.showPercentage = options.showPercentage;
  }

  prerender(canvas) {
    var rate = this.getRate();
    var end = (Math.PI*2)*rate;
    this.startAngle = 0;
    this.endAngle = end;

    this.canvas.rotate(-Math.PI*0.5);
    this.canvas.scale(1, -1);
  }

  renderFill(canvas) {
    canvas.fillPie(0, 0, this.radius, this.startAngle, this.endAngle);
  }

  renderStroke(canvas) {
    canvas.strokeArc(0, 0, this.radius, this.startAngle, this.endAngle);
  }

  postrender() {
    // if (this.showPercentage) {
    //   // TODO:
    //   var left = Math.max(0, this.limit-this.time);
    //   this.label.text = Math.ceil(left/1000)+'';
    // }
  }

}

var textWidthCache = {};

/**
 * @class phina.ui.LabelArea
 * @extends phina.display.Label
 */
class LabelArea extends Label {

  // _lineUpdate: true,

  constructor(options) {
    options = $safe.call({}, options, LabelArea.defaults);
    // options = {}.$safe(options, LabelArea.defaults);
    super(options);

    this._lineUpdate = true;
    this.verticalAlign = options.verticalAlign;
    this.scroll = options.scroll || new Vector2();
    this.scrollX = options.scrollX;
    this.scrollY = options.scrollY;
  }

  calcCanvasWidth () {
    return this.width + this.padding * 2;
  }

  calcCanvasHeight () {
    return this.height + this.padding * 2;
  }
  getOffsetY () {
    if (typeof this.verticalAlign === 'number') {
      return this.verticalAlign;
    }
    return LabelArea.verticalAlignToOffsetMap[this.verticalAlign] || 0;
  }

  getOffsetX () {
    return LabelArea.alignToOffsetMap[this.align] || 0;
  }

  getTextWidthCache () {
    var cache = textWidthCache[this.font];
    return cache || (textWidthCache[this.font] = {});
  }
  
  spliceLines (lines) {
    var rowWidth = this.width;
    var context = this.canvas.context;
    context.font = this.font;

    var cache = this.getTextWidthCache();

    // update cache
    each.call(this._text, function(ch) {
    // this._text.each(function(ch) {
      if (!cache[ch]) {
        cache[ch] = context.measureText(ch).width;
      }
    });
    
    var localLines = [];
    lines.forEach(function(line) {
      
      var str = '';
      var totalWidth = 0;

      // はみ出ていたら強制的に改行する
      each.call(line, function(ch) {
      // line.each(function(ch) {
        var w = cache[ch];

        if ((totalWidth+w) > rowWidth) {
          localLines.push(str);
          str = '';
          totalWidth = 0;
        }

        str += ch;
        totalWidth += w;
      });

      // 残りを push する
      localLines.push(str);

    });
    

    return localLines;
  }
  
  getLines () {
    if (this._lineUpdate === false) {
      return this._lines;
    }
    this._lineUpdate = false;

    var lines = (this.text + '').split('\n');
    if (this.width < 1) {
      this._lines = lines;
    }
    else {
      this._lines = this.spliceLines(lines);
    }

    return this._lines;
  }

  prerender (canvas) {
    var context = canvas.context;
    context.font = this.font;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;

    var text = this.text + '';
    var lines = this.getLines();
    var length = lines.length;
    var width = this.width;
    var height = this.height;

    var fontSize = this.fontSize;
    var lineSize = fontSize * this.lineHeight;
    var offsetX = this.getOffsetX() * width;
    var offsetY = this.getOffsetY();
    if (offsetY === 0) {
      offsetY = -Math.floor(length / 2) * lineSize;
      offsetY += ((length + 1) % 2) * (lineSize / 2);
    }
    else if (offsetY < 0) {
      offsetY *= height;
    }
    else {
      offsetY = offsetY * height - length * lineSize + lineSize;
    }

    offsetY -= this.scrollY;
    offsetX -= this.scrollX;
    var start = (offsetY + height / 2) / -lineSize | 0;
    if (start < 0) { start = 0; }

    var end = (height / 2 - offsetY + lineSize * 2) / lineSize | 0;
    lines = lines.filter(function(line, i) {
      return start <= i && end > i;
    });

    this.lines = lines;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.lineSize = lineSize;
    this.start = start;
  }

  renderFill (canvas) {
    var context = canvas.context;
    var offsetX = this.offsetX;
    var offsetY = this.offsetY;
    var lineSize = this.lineSize;
    var start = this.start;
    this.lines.forEach(function(line, i) {
      context.fillText(line, offsetX, (start + i) * lineSize + offsetY);
    }, this);
  }

  renderStroke (canvas) {
    var context = canvas.context;
    var offsetX = this.offsetX;
    var offsetY = this.offsetY;
    var lineSize = this.lineSize;
    var start = this.start;
    this.lines.forEach(function(line, i) {
      context.strokeText(line, offsetX, (start + i) * lineSize + offsetY);
    }, this);
  }

  get text() {
    return this._text;
  }
  set text(v) {
    this._text = v;
  }

  get scrollX() {
    return this.scroll.x;
  }
  set scrollX(v) {
    this.scroll.x = v;
  }

  get scrollY() {
    return this.scroll.y;
  }
  set scrollY(v) {
    this.scroll.y = v;
  }
  
  // _static: {
  //   defaults: {
  //     verticalAlign: 'top',
  //     align: 'left',
  //     baseline: 'top',
  //     width: 320,
  //     height: 320,
  //     scrollX: 0,
  //     scrollY: 0,
  //   },
  //   alignToOffsetMap: {
  //     start: -0.5,
  //     left: -0.5,
  //     center: 0,
  //     end: 0.5,
  //     right: 0.5,
  //   },

  //   verticalAlignToOffsetMap: {
  //     top: -0.5,
  //     center: 0,
  //     middle: 0,
  //     bottom: 0.5,
  //   },
  // },

  // _defined: function() {
  //   var func = function(newVal, oldVal) {
  //     if((this._lineUpdate === false) && (newVal !== oldVal)){
  //       this._lineUpdate = true;
  //     }
  //   };

  //   [
  //     'text',
  //     'width',
  //     'fontSize',
  //     'fontWeight',
  //     'fontFamily'
  //   ].forEach(function(key) {
  //     this.$watch(key, func);
  //   }, this.prototype);

  //   phina.display.Shape.watchRenderProperties.call(this ,[
  //     'verticalAlign',
  //     'text',
  //     'scroll',
  //     'scrollX',
  //     'scrollY'
  //   ]);
  // },


  enableScroll() {
    //   this.setInteractive(true);
    //   var physical = phina.accessory.Physical();
    //   physical.attachTo(this);
    //   physical.friction = 0.8;
    //   var lastForce = 0;
    //   var lastMove = 0;
    //   this.on('pointstart', function(e){
    //     lastForce = physical.velocity.y;
    //     lastMove = 0;
    //     physical.force(0, 0);
    //   });
    //   this.on('pointmove', function(e){
    //     var p = e.pointer.deltaPosition;
    //     lastMove = p.y;
    //     this.scrollY += lastMove;
    //   });

    //   this.on('pointend', function(e){
    //     physical.force(0, lastForce + lastMove);
    //   });

    return this;
  }

}

// static props
LabelArea.defaults = {
  verticalAlign: 'top',
  align: 'left',
  baseline: 'top',
  width: 320,
  height: 320,
  scrollX: 0,
  scrollY: 0,
};
LabelArea.alignToOffsetMap = {
  start: -0.5,
  left: -0.5,
  center: 0,
  end: 0.5,
  right: 0.5,
};
LabelArea.verticalAlignToOffsetMap = {
  top: -0.5,
  center: 0,
  middle: 0,
  bottom: 0.5,
}

// defined
;
Shape.watchRenderProperties.call(LabelArea ,[
  'verticalAlign',
  'text',
  'scroll',
  'scrollX',
  'scrollY'
]);

/**
 * @class phina.effect.Wave
 * Button
 * @extends phina.display.CircleShape
 */
class Wave extends CircleShape {

  /**
   * @constructor
   */
  constructor(options) {
    options = $safe.call(options || {}, {
    // options = (options || {}).$safe({
      fill: 'white',
      stroke: false,
    });

    super(options);

    var tweener = new Tweener().attachTo(this);
    tweener
      .to({scaleX:2, scaleY:2, alpha:0}, 500)
      .call(function() {
        this.remove();
      }, this);
  }
}

/**
 * @class phina.social.Twitter
 * # Twitter の共有リンクを生成するクラス
 * Twitter の共有リンクの URL を生成してくれるクラスです。
 */
class Twitter {

  /**
   * @constructor
   * 
   * コンストラクタは存在しますがインスタンスメンバはありません。
   */
  constructor() {}

  /**
   * @method phina.social.Twitter.createURL
   * Twitterの共有リンクを生成します。引数にオブジェクトを渡すことで様々なパラメーターを設定出来ます。引数のオブジェクトは {@link #phina.social.Twitter.defaults} で安全拡張されます。
   * 
   * ### Example
   *     phina.social.Twitter.createURL(); // => http://twitter.com/intent/tweet?text=Hello%2C%20world!&hashtags=javascript%2Cphina&url={現在のURL}
   * 
   *     phina.social.Twitter.createURL({
   *       text: 'This is text',
   *       hashtags: 'hashtag1,hashtag2',
   *       url: 'http://phinajs.com'
   *     }); // => http://twitter.com/intent/tweet?text=This%20is%20text&hashtags=hashtag1%2Chashtag2&url=http%3A%2F%2Fphinajs.com
   * 
   *     phina.social.Twitter.createURL({
   *       text: 'This is text',
   *       hashtags: 'hashtag1,hashtag2',
   *       url: 'http://phinajs.com',
   *       other: 'This is other'//設定項目は適当に増やせる
   *     }); // => http://twitter.com/intent/tweet?text=This%20is%20text&hashtags=hashtag1%2Chashtag2&url=http%3A%2F%2Fphinajs.com&other=This%20is%20other
   * 
   *     phina.social.Twitter.createURL({
   *       url: 'http://phinajs.com'
   *     }); // => http://twitter.com/intent/tweet?url=http%3A%2F%2Fphinajs.com&text=Hello%2C%20world!&hashtags=javascript%2Cphina
   * 
   * @param {Object}
   * @return {String} Twitter の共有リンク
   * @static
   */
  static createURL (options) {
    options = $safe.call(options || {}, Twitter.defaults);
    // options = (options || {}).$safe(this.defaults);

    var queries = [];
    var euc = encodeURIComponent;
    forIn.call(options, function(key, value) {
    // options.forIn(function(key, value) {
      var str = key + '=' + euc(value);
      queries.push(str);
    });

    var url = format.call('{baseURL}/{type}?{query}', {
    // var url = '{baseURL}/{type}?{query}'.format({
      baseURL: this.baseURL,
      // type: options.type,
      type: 'tweet',
      query: queries.join('&'),
    });

    return url;
  }

}


/**
 * @property {String} [phina.social.Twitter.baseURL = 'https://twitter.com/intent']
 * Twitter の共有リンクのベースとなる URL です。
 * 
 * @static
 */
Twitter.baseURL = 'https://twitter.com/intent';

/**
 * @property {Object} phina.social.Twitter.defaults
 * デフォルト値を格納しているオブジェクトです。{@link #phina.social.Twitter.defaults.text}, {@link #phina.social.Twitter.defaults.hashtags}, {@link #phina.social.Twitter.defaults.url} を内包しています。
 * 
 * @static
 */
Twitter.defaults = {
  // type: 'tweet',

  /**
   * @property {String} [phina.social.Twitter.defaults.text = 'Hello, World']
   * デフォルトでツイートに含まれる文字列です。
   * 
   * @static
   */
  text: 'Hello, world!',

  // screen_name: 'phi_jp',

  /**
   * @property {String} [phina.social.Twitter.defaults.hashtags = 'javascript, phina_js']
   * デフォルトでツイートに含まれるハッシュタグです。
   * 
   * @static
   */
  hashtags: 'javascript,phina_js',

  // url: 'http://github.com/phi-jp/phina.js',

  /**
   * @property {String} [phina.social.Twitter.defaults.url = phina.global.location && phina.global.location.href]
   * デフォルトでツイートに含まれる URL です。
   * 
   * @static
   */
  url: phina$1.global.location && phina$1.global.location.href

  // via: 'phi_jp',
};

export { Accelerometer, Accessory, Ajax, Asset, AssetLoader, AssetManager, BaseApp, Button, Canvas, CanvasApp, CanvasLayer, CanvasRenderer, ChangeDispatcher, Circle, CircleGauge, CircleShape, Collision, Color, DisplayElement, DisplayScene, DomApp, Draggable, Element, EventDispatcher, File, Flickable, Flow, Font, FrameAnimation, GamepadManager, Gauge, Grid, HeartShape, Input, Interactive, Keyboard, Label, LabelArea, Layer, Matrix33, Mouse, Object2D, PathShape, Physical, PlainElement, PolygonShape, QueryString, Random, Rect, RectangleShape, Scene, Script, Shape, SoundManager, Sprite, SpriteSheet, StarShape, Support, Texture, ThreeLayer, Ticker, Touch, TouchList, TriangleShape, Tween, Tweener, Twitter, Updater, Vector2, Vector3, Wave, phina$1 as phina };
