import { AssetManager } from "./assetmanager";

/**
 * @class phina.asset.SoundManager
 * ### Ref
 * - http://evolve.reintroducing.com/_source/classes/as3/SoundManager/SoundManager.html
 * - https://github.com/nicklockwood/SoundManager
 */
export class SoundManager {
  // volume: 0.8,
  // musicVolume: 0.8,
  // muteFlag: false,
  // currentMusic: null,

  /**
   * 音源を再生
   * @param {string} name
   * @param {number} [when]
   * @param {number} [offset]
   * @param {number} [duration]
   * @returns {import('../asset/sound').Sound}
   */
  static play(name, when, offset, duration) {
    /** @type {import('../asset/sound').Sound} */
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

  /**
   * @param {number} volume
   * @returns {void}
   */
  static setVolume(volume) {
    this.volume = volume;
  }

  /**
   * @returns {number}
   */
  static getVolume() {
    return this.volume;
  }

  /**
   * ミュート
   * @returns {SoundManager}
   */
  static mute() {
    this.muteFlag = true;
    if (this.currentMusic) {
      this.currentMusic.volume = 0;
    }
    return this;
  }

  /**
   * ミュート解除
   * @returns {SoundManager}
   */
  static unmute() {
    this.muteFlag = false;
    if (this.currentMusic) {
      this.currentMusic.volume = this.getVolumeMusic();
    }
    return this;
  }

  /**
   * ミュート状態かどうか
   * @returns {boolean}
   */
  static isMute() {
    return this.muteFlag;
  }

  /**
   * 音楽系の音源を再生：ループの有無などを細かく調整可能
   * @param {string} name
   * @param {number} [fadeTime]
   * @param {boolean} [loop]
   * @param {number} [when]
   * @param {number} [offset]
   * @param {number} [duration]
   * @returns {import('../asset/sound').Sound} 再生したSoundクラス
   */
  static playMusic(name, fadeTime, loop, when, offset, duration) {
    loop = (loop !== undefined) ? loop : true;

    if (this.currentMusic) {
      this.stopMusic(fadeTime);
    }

    /** @type {import('../asset/sound').Sound} */
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

  /**
   * 音楽を停止
   * @param {number} [fadeTime]
   * @returns {void}
   */
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

  /**
   * 音楽を一時停止
   * @returns {void}
   */
  static pauseMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.pause();
  }

  /**
   * 音楽を再開
   * @returns {void}
   */
  static resumeMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.resume();
  }

  /**
   * 音楽のボリュームを設定
   * @param {number} volume
   * @returns {SoundManager}
   */
  static setVolumeMusic(volume) {
    this.musicVolume = volume;
    if (this.currentMusic) {
      this.currentMusic.volume = volume;
    }

    return this;
  }

  /**
   * 音楽のボリュームを取得
   * @returns {number}
   */
  static getVolumeMusic() {
    return this.musicVolume;
  }

}

// static props
SoundManager.volume = 0.8
SoundManager.musicVolume = 0.8
SoundManager.muteFlag = false
SoundManager.currentMusic = null