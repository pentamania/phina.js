phina.namespace(function() {

  /**
   * @class phina.asset.Video
   *
   */
  phina.define('phina.asset.Video', {
    superClass: "phina.asset.Asset",

    /**
     * @constructor
     */
    init: function() {
      this.superInit();
    },

    _load: function(resolve) {

      var self = this;
      var v = this.domElement = document.createElement('video');
      v.setAttribute('preload', "none");

      v.addEventListener('canplay', (function() {
        return function f() {
          self.loaded = true;
          resolve(self);
          v.removeEventListener('canplay', f, false);
        }
      })(), false);

      v.addEventListener('error', function(err){
        console.error(err);
      }, false)

      v.src = this.src;
      v.load();
    },

  });

});