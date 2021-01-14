/**
 * @class phina.app.Updater
 */
export class Updater {

  /**
   * @param {AppUnion} app
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * @param {import('../app/scene').Scene} root 
   */
  update(root) {
    this._updateElement(root);
  }

  /**
   * @private
   * @param {import('../app/element').Element} element
   */
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

    // 子供を更新
    var len = element.children.length;
    if (element.children.length > 0) {
      var tempChildren = element.children.slice();
      for (var i=0; i<len; ++i) {
        this._updateElement(tempChildren[i]);
      }
    }
  }

}
