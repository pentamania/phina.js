import { accessor, $extend, forIn } from "./core/object";
import { clone, clear, last } from "./core/array";

/**
 * @typedef {{
 *   _creator: any
 *   _hierarchies: PhinaClass[]
 *   init: function
 *   superClass?: any
 *   superInit?: function
 *   superMethod?: (methodName: string, ...args:any) => any // スーパーメソッドの結果
 *   constructor?: any
 *   [k: string]: any // その他のプロパティ
 * }} PhinaClassPrototype
 */

/**
 * @typedef {{
 *   prototype: PhinaClassPrototype
 *   [k: string]: any // その他のstaticプロパティ
 * }} PhinaClass
 */

/**
 * @typedef {Object} CreateClassParam
 * @property {Function & {owner: any}} params.init クラス初期化関数
 * @property {PhinaClass} [params.superClass] スーパークラス
 * @property {{[k: string]: AccessorExtendObject}} [params._accessor] アクセサを付与
 * @property {{[k: string]: any}} [params._static] staticプロパティを付与
 * @property {Function} [params._defined] 定義時に実行したい関数
 */

var _classDefinedCallback = {};

var phina = {
  /**
   * @property {String} VERSION
   * @memberof phina
   * @static
   * phina.js のバージョンです。
   */
  VERSION: "<%= version %>",

  /**
   * @method isNode
   * Node.js の module かどうかをチェックします。
   * @memberof phina
   * @static
   */
  isNode: function () {
    return typeof module !== "undefined";
  },

  /**
   * @method namespace
   * 引数は関数で、その関数内での this は phina になります。
   * @memberof phina
   * @static
   *
   * @param {Function} fn 関数
   */
  namespace: function (fn) {
    fn.call(this);
  },

  /**
   * @method testUA
   * 引数の RegExp オブジェクトとユーザーエージェントを比較して返します。
   * @memberof phina
   * @static
   *
   * @param {RegExp} regExp
   * @return {Boolean}
   */
  testUA: function (regExp) {
    if (!this.global.navigator) return false;
    var ua = this.global.navigator.userAgent;
    return regExp.test(ua);
  },

  /**
   * @method isAndroid
   * Android かどうかを返します。
   * @memberof phina
   * @static
   *
   * @return {Boolean} Android かどうか
   */
  isAndroid: function () {
    return this.testUA(/Android/);
  },

  /**
   * @method isIPhone
   * iPhone かどうかを返します。
   * @memberof phina
   * @static
   *
   * @return {Boolean} iPhone かどうか
   */
  isIPhone: function () {
    return this.testUA(/iPhone/);
  },

  /**
   * @method isIPad
   * iPad かどうかを返します。
   * @memberof phina
   * @static
   *
   * @return {Boolean} iPad かどうか
   */
  isIPad: function () {
    return this.testUA(/iPad/);
  },

  /**
   * @method isIOS
   * iOS かどうかを返します。
   * @memberof phina
   * @static
   *
   * @return {Boolean} iOS かどうか
   */
  isIOS: function () {
    return this.testUA(/iPhone|iPad/);
  },

  /**
   * @method isMobile
   * モバイルかどうかを返します。具体的には Android, iPhone, iPad のいずれかだと true になります。
   * @memberof phina
   * @static
   *
   * @return {Boolean} モバイルかどうか
   */
  isMobile: function () {
    return this.testUA(/iPhone|iPad|Android/);
  },

  /**
   * @method createClass
   * クラスを作成する関数です。
   * 親クラスの指定は文字列でも可能です。
   * 何も継承しない場合 superClass の指定は不要です。また、親クラスを継承している場合、コンストラクタ内で this.superInit() を実行して親クラスを初期化することが必須です。
   * @memberof phina
   * @static
   *
   * @example
   * var Class = phina.createClass({
   *   superClass: namespace.Super,//親クラス継承
   *
   *   //メンバ変数
   *   member1: 100,
   *   member2: 'test',
   *   member3: null,
   *
   *   // コンストラクタ
   *   // Class()を呼び出したとき実行される
   *   init: function(a, b){
   *     //スーパークラス(継承したクラス)のinit
   *     this.superInit(a, b);
   *     this.a = a;
   *     this.b = b;
   *   },
   *
   *   //メソッド
   *   method1: function(){},
   *   method2: function(){},
   *
   * });
   *
   * @param {CreateClassParam} params
   * @return {PhinaClass} phinaクラス
   */
  createClass: function (params) {
    var props = {};

    /** @type {PhinaClass} */
    var _class = function () {
      var instance = new _class.prototype._creator();
      _class.prototype.init.apply(instance, arguments);
      return instance;
    };

    if (params.superClass) {
      _class.prototype = Object.create(params.superClass.prototype);
      params.init.owner = _class;
      _class.prototype.superInit = function () {
        this.__counter = this.__counter || 0;

        var superClass = this._hierarchies[this.__counter++];
        var superInit = superClass.prototype.init;
        superInit.apply(this, arguments);

        this.__counter = 0;
      };
      _class.prototype.superMethod = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var name = args.shift();
        this.__counters = this.__counters || {};
        this.__counters[name] = this.__counters[name] || 0;

        var superClass = this._hierarchies[this.__counters[name]++];
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
    while (_super) {
      _class.prototype._hierarchies.push(_super);
      _super = _super.prototype.superClass;
    }

    // accessor
    if (params._accessor) {
      // params._accessor.forIn(
      forIn.call(
        params._accessor,
        /**
         * @param {string} key
         * @param {AccessorExtendObject} value
         */
        function (key, value) {
          accessor.call(_class.prototype, key, value);
          // _class.prototype.accessor(key, value);
        }
      );
      // _class.prototype = Object.create(_class.prototype, params._accessor);
    }

    _class.prototype._creator = function () {
      return this;
    };
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
  },

  /**
   * @method using
   * 文字列で定義したパスを使ってオブジェクトを取り出します。パスは , . / \ :: で区切ることができます。
   * {@link #phina.register} で登録したオブジェクトを取り出すときなどに使うと便利な関数です。
   * @memberof phina
   * @static
   *
   * @example
   * hoge = {
   *   foo: {
   *     bar: {
   *       num: 100
   *     }
   *   }
   * };
   * var bar = phina.using('hoge.foo.bar');
   * console.log(bar.num); // => 100
   *
   * @param {String} path オブジェクトへのパス
   * @return {Object} 取り出したオブジェクト
   */
  using: function (path) {
    if (!path) {
      return this.global;
    }

    var pathes = path.split(/[,.\/ ]|::/);
    var current = this.global;

    pathes.forEach(function (p) {
      current = current[p] || (current[p] = {});
    });

    return current;
  },

  /**
   * @method register
   * パス指定でオブジェクトを登録する関数です。パスは , . / \ :: で区切ることができます。
   * @memberof phina
   * @static
   *
   * @example
   * phina.register('hoge.foo.bar', {
   *   num: 100,
   * });
   * console.log(hoge.foo.bar.num); // => 100
   *
   * @param {String} path 登録するオブジェクトのパス
   * @param {Object} _class 登録するオブジェクト
   * @return {Object} 登録したオブジェクト
   */
  register: function (path, _class) {
    var pathes = path.split(/[,.\/ ]|::/);
    // var className = pathes.last;
    var className = last.get.call(pathes);
    // FIXME: ここを直さないとピリオド区切り以外は無効？
    var parentPath = path.substring(0, path.lastIndexOf("."));
    var parent = this.using(parentPath);

    parent[className] = _class;

    return _class;
  },

  /**
   * @method define
   * クラスを定義する関数です。使い方は {@link #createClass} とほとんど同じです。
   * ただし、引数は2つあり、第一引数は定義するクラスのパスを文字列で渡します。第二引数のオブジェクトは {@link #createClass} の引数と同じようにします。
   * {@link #createClass} と違い、変数に代入する必要がなく、パス指定でクラスを定義できます。
   * 内部的には {@link #register}, {@link #using} を使用しているため、パスは , . / \ :: で区切ることができます。
   * @memberof phina
   * @static
   *
   * @example
   * phina.define('namespace.Class', {
   *   superClass: 'namespace.Super',//親クラス継承
   *
   *   //メンバ変数
   *   member1: 100,
   *   member2: 'test',
   *   member3: null,
   *
   *   //コンストラクタ
   *   //Class()を呼び出したとき実行される
   *   init: function(a, b){
   *     //スーパークラス(継承したクラス)のinit
   *     this.superInit(a, b);
   *     this.a = a;
   *     this.b = b;
   *   },
   *
   *   //メソッド
   *   method1: function(){},
   *   method2: function(){},
   * });
   *
   * @param {String} path パス
   * @param {Object} params
   * @param {Function & {owner: any}} params.init クラス初期化関数
   * @param {string | PhinaClass} [params.superClass] スーパークラス
   * @param {{[k: string]: AccessorExtendObject}} [params._accessor] アクセサを付与
   * @param {{[k: string]: any}} [params._static] staticプロパティを付与
   * @param {Function} [params._defined] 定義時に実行したい関数
   * @return {PhinaClass} 定義したクラス
   */
  define: function (path, params) {
    if (params.superClass) {
      if (typeof params.superClass === "string") {
        var _superClass = this.using(params.superClass);
        if (typeof _superClass != "function") {
          if (!_classDefinedCallback[params.superClass]) {
            _classDefinedCallback[params.superClass] = [];
          }
          _classDefinedCallback[params.superClass].push(function () {
            this.define(path, params);
          });

          return;
        } else {
          params.superClass = _superClass;
        }
      } else {
        params.superClass = params.superClass;
      }
    }

    var _class = this.createClass(/** @type CreateClassParam */ (params));
    // _class.prototype.accessor('className', {
    accessor.call(_class.prototype, "className", {
      get: function () {
        return path;
      },
    });

    this.register(path, _class);

    if (_classDefinedCallback[path]) {
      _classDefinedCallback[path].forEach(function (callback) {
        callback();
      });
      _classDefinedCallback[path] = null;
    }

    return _class;
  },

  /**
   * @method globalize
   * phina.js が用意している全てのクラスをグローバルに展開します。（具体的には phina が持つオブジェクトが一通りグローバルに展開されます。）
   * この関数を実行することで、いちいち global からたどっていかなくても phina.js の用意しているクラスをクラス名だけで呼び出すことができます。
   * @memberof phina
   * @static
   *
   * @example
   * var sprite1 = phina.display.Sprite("piyo"); 
   * phina.globalize();
   * var sprite2 = Sprite("piyo"); // sprite1と等価
   *
   */
  globalize: function () {
    // phina.forIn(
    forIn.call(this, function (key, value) {
      var ns = key;

      if (typeof value !== "object") return;

      // value.forIn(function(key, value) {
      forIn.call(value, function (key, value) {
        // if (phina.global[key]) {
        //   console.log(ns, key);
        //   phina.global['_' + key] = value;
        // }
        // else {
        //   phina.global[key] = value;
        // }
        this.global[key] = value;
      });
    });
  },

  /** @private */
  _mainListeners: [],
  /** @private */
  _mainLoaded: false,

  /**
   * @method main
   * phina.js でプログラミングする際、メインの処理を記述するための関数です。
   * 基本的に phina.js でのプログラミングではこの中にプログラムを書いていくことになります。
   * @memberof phina
   * @static
   *
   * @example
   * phina.main(function() {
   *   //ここにメインの処理を書く
   * });
   *
   * @param {Function} func メインの処理
   */
  main: function (func) {
    if (this._mainLoaded) {
      func();
    } else {
      this._mainListeners.push(func);
    }
  },

  /**
   * @memberof phina
   * Node.js なら global、 ブラウザなら window を返します。
   * ゲッターのみ定義されています。
   */
  get global() {
    return GLOBAL;
  },
};

var GLOBAL = phina.isNode() ? global : window;

var doc = phina.global.document;
if (phina.global.addEventListener && doc && doc.readyState !== "complete") {
  phina.global.addEventListener("load", function () {
    var run = function () {
      var listeners = clone.call(phina._mainListeners);
      // var listeners = phina._mainListeners.clone();
      clear.call(phina._mainListeners);
      // phina._mainListeners.clear();
      listeners.forEach(function (func) {
        // listeners.each(function(func) {
        func();
      });

      // main 内で main を追加している場合があるのでそのチェック
      if (phina._mainListeners.length > 0) {
        run();
        // run(0);
      } else {
        phina._mainLoaded = true;
      }
    };
    // ちょっと遅延させる(画面サイズ問題)
    setTimeout(run);
  });
} else {
  phina._mainLoaded = true;
}

export default phina;
