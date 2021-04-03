import { AssetManager } from "./assetmanager";

/**
 * @class phina.asset.SoundManager
 * 全てのクラスメンバーがstaticな静的クラス
 * サウンドの再生は基本これを使う
 * 
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
   * @private インスタンス化しない
   */
  constructor() {}

  /**
   * 音源を再生
   * 
   * @param {string} name 音源キー名
   * @param {number} [when=0] 指定の秒数、再生を遅らせる
   * @param {number} [offset=0] 音源のどの時間位置で再生するかを秒数指定
   * @param {number} [duration] 再生時間を秒数指定
   * @returns {import('../asset/sound').Sound}
   */
  static play(name, when, offset, duration) {
    /** @type {import('../asset/sound').Sound} */
    var sound = AssetManager.get('sound', name);

    sound.volume = this.getVolume();
    sound.play(when, offset, duration);

    return sound;
  }

  /**
   * @private 未実装のため
   */
  static stop() {
    // TODO: 
  }

  /**
   * @private 未実装のため
   */
  static pause() {
    // TODO: 
  }

  /**
   * @private 未実装のため
   */
  static fade() {
    // TODO: 
  }

  /**
   * 通常サウンド音量をセット
   * 
   * @param {number} volume
   * @returns {void}
   */
  static setVolume(volume) {
    this.volume = volume;
  }

  /**
   * 通常サウンド音量を取得
   * 
   * @returns {number}
   */
  static getVolume() {
    return this.volume;
  }

  /**
   * ミュート
   * 
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
   * 
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
   * 
   * @returns {boolean}
   */
  static isMute() {
    return this.muteFlag;
  }

  /**
   * 音楽系の音源を再生：ループの有無などを細かく調整可能
   * 
   * @param {string} name 音源キー名
   * @param {number} [fadeTime] 指定時間をかけて音量フェードイン。単位はミリ秒
   * @param {boolean} [loop] ループするかどうか。Default: true
   * @param {number} [when=0] 指定の秒数、再生を遅らせる
   * @param {number} [offset=0] 音源のどの時間位置で再生するかを秒数指定
   * @param {number} [duration] 再生時間を秒数指定
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
   * 
   * @param {number} [fadeTime] 指定時間をかけて音量フェードアウト。単位はミリ秒
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
   * 
   * @returns {void}
   */
  static pauseMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.pause();
  }

  /**
   * 音楽を再開
   * 
   * @returns {void}
   */
  static resumeMusic() {
    if (!this.currentMusic) { return ; }
    this.currentMusic.resume();
  }

  /**
   * 音楽の音量を設定
   * 
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
   * 音楽の音量を取得
   * 
   * @returns {number}
   */
  static getVolumeMusic() {
    return this.musicVolume;
  }

}

/**
 * 通常サウンド（SE）音量
 * @type {number}
 */
SoundManager.volume = 0.8

/**
 * 音楽音量
 * @type {number}
 */
SoundManager.musicVolume = 0.8

/**
 * ミュート状態
 * @type {boolean}
 */
SoundManager.muteFlag = false

/**
 * 再生中の音楽音源
 * @type {import('../asset/sound').Sound | null}
 */
SoundManager.currentMusic = null
