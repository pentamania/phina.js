phina.namespace(function() {

  /**
   * @class phina.display.VideoSprite
   * Wrapper class for html5video
   *
   * @param  {String, HTMLelement} video
   * @param  {Object} options
   */
  phina.define('phina.display.VideoSprite', {
    superClass: 'phina.display.Sprite',

    init: function(video, options) {
      this.setVideo(video);

      var _image = phina.graphics.Canvas();
      _image.setSize(this.video.videoWidth, this.video.videoHeight);
      this.superInit(_image);

      var options = {}.$safe(options, phina.display.VideoSprite.defaults);
      this.video.loop = options.loop;
      this.video.volume = options.volume;

      // image(内部canvas)とvideoの内容を常に同期する
      this.on('enterframe', function() {
        this.image.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
      });

      this.video.onended = function(){
        this.flare('ended');
      }.bind(this);
    },

    setVideo: function(video) {
      if (typeof video === 'string') {
        var _video = phina.asset.AssetManager.get('video', video);
        this._video = _video.domElement;
      } else {
        this._video = video;
      }
    },

    play: function() {
      this.video.play();
      this.flare('play');
      return this;
    },

    pause: function() {
      this.video.pause();
      this.flare('pause');
      return this;
    },

    _accessor: {
      video: {
        get: function()  { return this._video; },
        set: function(v) {
          this.setVideo(v);
        },
      },
      currentTime: {
        get: function()  { return this.video.currentTime; },
        set: function(v) {
          this.video.currentTime = v;
        },
      },
      paused: {
        get: function()  { return this.video.paused; },
      },
      duration: {
        get: function()  { return this.video.duration; },
      },
      volume: {
        get: function()  { return this.video.volume; },
        set: function(v)  { this.video.volume = v; },
      },
      muted: {
        get: function()  { return this.video.muted; },
        set: function(v)  { this.video.muted = v; },
      },
    },

    _static: {
      defaults: {
        loop: false,
        volume: 1.0,
      },
    },
  });

});