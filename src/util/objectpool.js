phina.namespace(function() {

  /**
   * phina.util.ObjectPool
   * オブジェクトプールクラス
   * 後述の管理クラスを経由して使うのがおすすめ
   */
  phina.define('phina.util.ObjectPool', {
    superClass: 'phina.util.EventDispatcher',

    init: function() {
      this.superInit();
      this._pool = [];
    },

    /**
     * @method  add
     * @chainable
     * プールへオブジェクトを追加する
     * @param {T} obj getParentを持っていること
     * @return {this}
     */
    add: function(obj) {
      this._pool.push(obj);
      return this;
    },

    /**
     * @method  pick
     * プール内から親を持ってない（addChildされてない）objを探す。
     * 見つかったらコールバックで引数として返す。
     *
     * @param {function} [success] 取得成功時のコールバック
     * @param {function} [failure] 取得失敗時のコールバック
     * @return {T | null}
     */
    pick: function(success, failure) {
      var foundObj = this._pool.find(function(obj) {
        if (obj.getParent() == null) {
          obj.has('picked') && obj.flare('picked');
          success(obj);
          return true;
        }
      });

      /* not found */
      if (!foundObj && failure) failure();
      return foundObj;
    },

    _accessor: {
      length: {
        get: function() { return this._pool.length; }
      },
    },

  });


  /**
   * phina.util.ObjectPoolManager
   * オブジェクトプール管理用シングルトンクラス
   */
  phina.define('phina.util.ObjectPoolManager', {
    _static: {

      pools: {},

      /**
       * @method setPool
       * @static
       * @param {string} key       プールを取得する際のキー名
       * @param {Number} objectNum プールするオブジェクトの数
       * @param {function|string} ObjClass  プールするオブジェクトクラス
       * @param {Array} args      クラス引数
       */
      setPool: function(key, objectNum, ObjClass, args) {
        var pool = phina.util.ObjectPool();
        if (typeof ObjClass === 'string') {
          ObjClass = phina.using(ObjClass);
        }
        if (!(typeof ObjClass === 'function')) {
          console.error("[phina.js] Pooling ObjClass should be function or phina registered class string");
        }

        objectNum.times(function() {
          var instance = ObjClass.apply(null, args);
          pool.add(instance);
        });

        this.pools[key] = pool;
        return this;
      },

      getPool: function(key) {
        return this.pools[key];
      },

      add: function(key, obj) {
        return this.pools[key].add(obj);
      },

      pick: function(key, success, failure) {
        return this.pools[key].pick(success, failure);
      },

    }

  });

});