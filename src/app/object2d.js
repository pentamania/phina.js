phina.namespace(function() {

  /**
   * @class phina.app.Object2D
   * Object2D
   * @extends phina.app.Element
   */
  phina.define('phina.app.Object2D', {
    superClass: 'phina.app.Element',

    /** 位置 */
    position: null,
    /** 回転 */
    rotation: 0,
    /** スケール */
    scale: null,
    /** 基準位置 */
    origin: null,

    /**
     * @constructor
     */
    init: function(options) {
      this.superInit();

      options = ({}).$safe(options, phina.app.Object2D.defaults);

      this.position = phina.geom.Vector2(options.x, options.y);
      this.scale    = phina.geom.Vector2(options.scaleX, options.scaleY);
      this.rotation = options.rotation;
      this.origin   = phina.geom.Vector2(options.originX, options.originY);

      this._matrix = phina.geom.Matrix33().identity();
      this._worldMatrix = phina.geom.Matrix33().identity();

      this.interactive = false;
      this._overFlags = {};
      this._touchFlags = {};

      this.width = options.width;
      this.height = options.height;
      this.radius = options.radius;
      this.boundingType = options.boundingType;
      this._collider = null;
    },

    /**
     * 当たり判定用のRectもしくはCircleをセットアップする。
     * radiusもしくはwidthどちらかは必ず指定する。
     * @param {Object} params
     * @param {Number} [params.x=0] - 相対位置x
     * @param {Number} [params.y=0] - 相対位置y
     * @param {Number} [params.radius] - 円形にする場合に指定：0は無効
     * @param {Number} [params.width] - 矩形にする場合に指定：0は無効、radius優先
     * @param {Number} [params.height] - 矩形にする場合に指定：0は無効、指定なければwidthの値が適用される
     * @returns {this}
     */
    setCollider: function(params) {
      params = ({}).$safe(params, {
        x: 0,
        y: 0,
      });
      if (params.radius) {
        this._collider = phina.geom.Circle(params.x, params.y, params.radius);
      } else if (params.width) {
        params.height = params.height || params.width;
        this._collider = phina.geom.Rect(params.x, params.y, params.width, params.height);
      }
      return this;
    },

    /**
     * colliderのグローバル領域を取得する
     * TODO: Rect/Circleは毎回作りなおさず、キャッシュする？
     *
     * @return {phina.geom.Rect|phina.geom.Circle|null}
     */
    getGlobalCollider: function() {
      if (!this._collider) return null;

      if (this.colliderType === "rect") {
        return phina.geom.Rect(
          this.colliderGlobalX,
          this.colliderGlobalY,
          this._collider.width,
          this._collider.height
        );
      } else {
        return phina.geom.Circle(
          this.colliderGlobalX,
          this.colliderGlobalY,
          this._collider.radius
        );
      }
    },

    /**
     * 点と衝突しているかを判定
     * @param {Number} x
     * @param {Number} y
     */
    hitTest: function(x, y) {
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
    },

    /**
     * 対象の位置が判定範囲内にあるかどうかを判定
     * @param {Object} elm
     */
    hitTestElementPosition: function(elm) {
      var col = this.getGlobalCollider();
      if (col) {
        return col.contains(elm.globalX, elm.globalY);
      } else {
        return this.hitTest(elm.globalX, elm.globalY);
      }
    },

    hitTestRect: function(x, y) {
      var p = this.globalToLocal(phina.geom.Vector2(x, y));

      var left   = -this.width*this.originX;
      var right  = +this.width*(1-this.originX);
      var top    = -this.height*this.originY;
      var bottom = +this.height*(1-this.originY);

      return ( left < p.x && p.x < right ) && ( top  < p.y && p.y < bottom );
    },

    hitTestCircle: function(x, y) {
      // 円判定
      var p = this.globalToLocal(phina.geom.Vector2(x, y));
      if (((p.x)*(p.x)+(p.y)*(p.y)) < (this.radius*this.radius)) {
          return true;
      }
      return false;
    },

    /**
     * @method
     * 要素と衝突しているかを判定。
     * 自身と対象がcolliderを持ってたらCollisionメソッドを使って判定を行う。
     * @param {Object} elm
     */
    hitTestElement: function(elm) {
      if (this._collider && elm._collider) {
        var thisCol = this.getGlobalCollider();
        var targetCol = elm.getGlobalCollider();
        if (this.colliderType === 'rect') {
          if (elm.colliderType === 'rect') {
            // 矩形 vs 矩形
            return phina.geom.Collision.testRectRect(thisCol, targetCol);
          } else {
            // 矩形 vs 円形
            return phina.geom.Collision.testCircleRect(targetCol, thisCol);
          }
        } else {
          if (elm.colliderType === 'rect') {
            // 円形 vs 矩形
            return phina.geom.Collision.testCircleRect(thisCol, targetCol);
          } else {
            // 円形 vs 円形
            return phina.geom.Collision.testCircleCircle(thisCol, targetCol);
          }
        }
      } else {
        // 従来の処理
        var rect0 = this;
        var rect1 = elm;
        return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
               (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
      }
    },

    globalToLocal: function(p) {
      var matrix = this._worldMatrix.clone();
      matrix.invert();
      // matrix.transpose();

      var temp = matrix.multiplyVector2(p);

      return temp;
    },

    setInteractive: function(flag, type) {
      this.interactive = flag;
      if (type) {
        this.boundingType = type;
      }

      return this;
    },

    /**
     * X 座標値をセット
     * @param {Number} x
     */
    setX: function(x) {
      this.position.x = x;
      return this;
    },

    /**
     * Y 座標値をセット
     * @param {Number} y
     */
    setY: function(y) {
      this.position.y = y;
      return this;
    },

    /**
     * XY 座標をセット
     * @param {Number} x
     * @param {Number} y
     */
    setPosition: function(x, y) {
      this.position.x = x;
      this.position.y = y;
      return this;
    },

    /**
     * 回転をセット
     * @param {Number} rotation
     */
    setRotation: function(rotation) {
      this.rotation = rotation;
      return this;
    },

    /**
     * スケールをセット
     * @param {Number} x
     * @param {Number} y
     */
    setScale: function(x, y) {
      this.scale.x = x;
      if (arguments.length <= 1) {
          this.scale.y = x;
      } else {
          this.scale.y = y;
      }
      return this;
    },

    /**
     * 基準点をセット
     * @param {Number} x
     * @param {Number} y
     */
    setOrigin: function(x, y) {
      this.origin.x = x;
      this.origin.y = y;
      return this;
    },

    /**
     * 幅をセット
     * @param {Number} width
     */
    setWidth: function(width) {
      this.width = width;
      return this;
    },

    /**
     * 高さをセット
     * @param {Number} height
     */
    setHeight: function(height) {
      this.height = height;
      return this;
    },

    /**
     * サイズ(幅, 高さ)をセット
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function(width, height) {
      this.width  = width;
      this.height = height;
      return this;
    },

    setBoundingType: function(type) {
      this.boundingType = type;
      return this;
    },

    moveTo: function(x, y) {
      this.position.x = x;
      this.position.y = y;
      return this;
    },

    moveBy: function(x, y) {
      this.position.x += x;
      this.position.y += y;
      return this;
    },

    _calcWorldMatrix: function() {
      if (!this.parent) return ;

      // cache check
      if (this.rotation != this._cachedRotation) {
        this._cachedRotation = this.rotation;

        var r = this.rotation*(Math.PI/180);
        this._sr = Math.sin(r);
        this._cr = Math.cos(r);
      }

      var local = this._matrix;
      var parent = this.parent._worldMatrix || phina.geom.Matrix33.IDENTITY;
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
    },

    _accessor: {
      /**
       * @property    x
       * x座標値
       */
      x: {
        "get": function()   { return this.position.x; },
        "set": function(v)  { this.position.x = v; }
      },
      /**
       * @property    y
       * y座標値
       */
      y: {
        "get": function()   { return this.position.y; },
        "set": function(v)  { this.position.y = v; }
      },

      /**
       * @property    originX
       * x座標値
       */
      originX: {
        "get": function()   { return this.origin.x; },
        "set": function(v)  { this.origin.x = v; }
      },

      /**
       * @property    originY
       * y座標値
       */
      originY: {
        "get": function()   { return this.origin.y; },
        "set": function(v)  { this.origin.y = v; }
      },

      /**
       * @property    scaleX
       * スケールX値
       */
      scaleX: {
        "get": function()   { return this.scale.x; },
        "set": function(v)  { this.scale.x = v; }
      },

      /**
       * @property    scaleY
       * スケールY値
       */
      scaleY: {
        "get": function()   { return this.scale.y; },
        "set": function(v)  { this.scale.y = v; }
      },

      /**
       * @property    width
       * width
       */
      width: {
        "get": function()   {
          return (this.boundingType === 'rect') ?
            this._width : this._diameter;
        },
        "set": function(v)  { this._width = v; }
      },
      /**
       * @property    height
       * height
       */
      height: {
        "get": function()   {
          return (this.boundingType === 'rect') ?
            this._height : this._diameter;
        },
        "set": function(v)  { this._height = v; }
      },

      /**
       * @property    radius
       * 半径
       */
      radius: {
        "get": function()   {
          return (this.boundingType === 'rect') ?
            (this.width+this.height)/4 : this._radius;
        },
        "set": function(v)  {
          this._radius = v;
          this._diameter = v*2;
        },
      },

      /**
       * @property    top
       * 左
       */
      top: {
        "get": function()   { return this.y - this.height*this.originY; },
        "set": function(v)  { this.y = v + this.height*this.originY; },
      },

      /**
       * @property    right
       * 左
       */
      right: {
        "get": function()   { return this.x + this.width*(1-this.originX); },
        "set": function(v)  { this.x = v - this.width*(1-this.originX); },
      },

      /**
       * @property    bottom
       * 左
       */
      bottom: {
        "get": function()   { return this.y + this.height*(1-this.originY); },
        "set": function(v)  { this.y = v - this.height*(1-this.originY); },
      },

      /**
       * @property    left
       * 左
       */
      left: {
        "get": function()   { return this.x - this.width*this.originX; },
        "set": function(v)  { this.x = v + this.width*this.originX; },
      },

      /**
       * @property    centerX
       * centerX
       */
      centerX: {
        "get": function()   { return this.x + this.width/2 - this.width*this.originX; },
        "set": function(v)  {
          // TODO: どうしようかな??
        }
      },

      /**
       * @property    centerY
       * centerY
       */
      centerY: {
        "get": function()   { return this.y + this.height/2 - this.height*this.originY; },
        "set": function(v)  {
          // TODO: どうしようかな??
        }
      },

      /**
       * @property    globalX
       * @readonly
       * global position x
       */
      globalX: {
        "get": function()   { return this._worldMatrix.m02; },
      },

      /**
       * @property    globalY
       * @readonly
       * global position y
       */
      globalY: {
        "get": function()   { return this._worldMatrix.m12; },
      },

      /**
       * @property    collider
       * the collider
       */
      collider: {
        "get": function()   { return this._collider.clone(); },
        "set": function(v)   {
          this.setCollider(v);
        },
      },

      /**
       * @property    colliderGlobalX
       * @readonly
       * global position x of the collider
       */
      colliderGlobalX: {
        "get": function()   {
          if (this.colliderType === 'rect') {
            return this.globalX + this._collider.x - this._collider.width * this.originX;
          } else {
            return this.globalX + this._collider.x;
          }
        },
      },

      /**
       * @property    colliderGlobalY
       * @readonly
       * global position y of the collider
       */
      colliderGlobalY: {
        "get": function()   {
          if (this.colliderType === 'rect') {
            return this.globalY + this._collider.y - this._collider.height * this.originY;
          } else {
            return this.globalY + this._collider.y;
          }
        },
      },

      /**
       * @property    colliderType
       * @readonly
       * the type of the collider
       * @returns {string} - 'rect', 'circle', or null
       */
      colliderType: {
        "get": function()   {
          if (!this._collider) return null;
          if (this._collider instanceof phina.geom.Rect) {
            return 'rect';
          } else {
            return 'circle';
          }
        },
      },
    },
    _static: {
      defaults: {
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
      },
    },

  });


});
