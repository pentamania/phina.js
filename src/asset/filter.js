
phina.namespace(function() {

  var getTexture = function(texture) {
    if (typeof texture === 'string') {
      texture = phina.asset.AssetManager.get('image', texture);
    }
    return texture;
  };

  /**
   * @class phina.asset.Filter
   * @extends phina.asset.Asset
   */
  phina.define('phina.asset.Filter', {
    superClass: "phina.asset.Asset",

    /**
     * @constructor
     */
    init: function() {
      this.superInit();
    },

    _load: function(resolve) {
      this._filterFunc = this.src;
      resolve(this);
    },

    applyFilter: function(texture) {
      var txt = getTexture(texture);
      txt.filter(this._filterFunc);
      return this;
    },

    registerFilteredImage: function(srcTexture, filteredImageKey) {
      var filtered = getTexture(srcTexture).clone().filter(this._filterFunc);
      phina.asset.AssetManager.set('image', filteredImageKey, filtered);
      return this;
    },

  });

});

