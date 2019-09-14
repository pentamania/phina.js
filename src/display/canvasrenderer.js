

phina.namespace(function() {
  /**
   * @class phina.display.CanvasRenderer
   */
  phina.define('phina.display.CanvasRenderer', {

    showCollider: false,

    colliderFillStyle: 'rgba(255, 0, 0, 0.4)',

    /**
     * @constructor
     */
    init: function(canvas) {
      this.canvas = canvas;
      this._context = this.canvas.context;
    },

    /**
     * デバッグ用にcollider（当たり判定）を描画する
     * @param {Object} obj - phina.add.Object2D subclass
     */
    _drawCollider: function(obj) {
      var context = this.canvas.context;
      var col = obj.getGlobalCollider();
      if (!col) return;

      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0); // reset Transform
      context.fillStyle = this.colliderFillStyle;
      if (col instanceof phina.geom.Rect) {
        this.canvas.fillRect(col.x, col.y, col.width, col.height);
      } else if (col instanceof phina.geom.Circle) {
        this.canvas.fillCircle(col.x, col.y, col.radius);
      }
      context.restore();
    },

    render: function(scene) {
      this.canvas.clear();
      if (scene.backgroundColor) {
        this.canvas.clearColor(scene.backgroundColor);
      }

      this._context.save();
      this.renderChildren(scene);
      this._context.restore();
    },

    renderChildren: function(obj) {
      // 子供たちも実行
      if (obj.children.length > 0) {
        var tempChildren = obj.children.slice();
        for (var i=0,len=tempChildren.length; i<len; ++i) {
          this.renderObject(tempChildren[i]);
        }
      }
    },

    renderObject: function(obj) {
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

      if (this.showCollider) this._drawCollider(obj);
    },

  });

});
