import { $safe, forIn } from "../core/object";
import { EventDispatcher } from "../util/eventdispatcher"
import { Flow } from "../util/flow"
import { AssetManager } from "./assetmanager";
import { Texture } from "./texture";
import { Sound } from "./sound";
import { Script } from "./script";
import { SpriteSheet } from "./spritesheet";
import { Font } from "./font";
import { File } from "./file";
import { Filter } from "./filter";

/**
 * assetKeyのvalueは通常はstring（パス文字列）
 * ただしパース済みjsonなどの特殊な形式も受け付けるため、any型としている
 * @typedef {{
 *   [assetType: string]: {
 *     [assetKey: string]: any
 *   }
 * }} AssetLoaderLoadParam
 */

/**
 * @typedef {{
 *   cache: boolean
 * }} AssetLoaderConstructParams
 */

/**
 * @class phina.asset.AssetLoader
 * _extends phina.util.EventDispatcher
 */
export class AssetLoader extends EventDispatcher {

  /**
   * @constructor
   * @param {AssetLoaderConstructParams} [params]
   */
  constructor(params) {
    super();

    // params = (params || {}).$safe({
    //   cache: true,
    // });
    /** @type {AssetLoaderConstructParams} */
    const paramsFulFilled = $safe.call(params||{}, { cache: true })

    this.assets = {};
    this.cache = paramsFulFilled.cache;
    
    /**
     * ロード中かどうか
     * @type {Boolean}
     */
    this.loading = false;
  }

  /**
   * アセットファイルのロードを行い、同時にAssetManagerへの登録も行います。
   * パラメータに複数のファイルを指定してる場合、各ファイルについて並列で処理します。
   * 
   * また全てのロード処理を終えると`load`イベントを発火します。
   * 
   * サポートするファイル種は{@link AssetLoader.assetLoadFunctions}に登録されたものとなりますが、
   * {@link AssetLoader.register}メソッドで拡張することも可能です。
   * 
   * @example
   * // Traditional
   * const loader = new AssetLoader();
   * loader.load({ image: "./assets/player.png"});
   * loader.on('load', ()=> console.log("load complete"));
   * 
   * // With async/await
   * (async()=> {
   *   const loader = new AssetLoader();
   *   await loader.load({ image: "./assets/player.png"})
   *   console.log("load complete")
   * })
   * 
   * @param {AssetLoaderLoadParam} params
   * @returns {Flow}
   */
  load(params) {
    const self = this;

    /** @type {PromiseLike<any>[]} */
    const flows = [];

    let counter = 0;
    let length = 0;
    forIn.call(params, function(_type, assets) {
    // params.forIn(function(type, assets) {
      length += Object.keys(assets).length;
    });
    
    forIn.call(params, function(type, assets) {
    // params.forIn(function(type, assets) {
      forIn.call(assets, function(key, value) {
      // assets.forIn(function(key, value) {
        const func = AssetLoader.assetLoadFunctions[type];
        const flow = func(key, value);
        flow.then(function(asset) {
          if (self.cache) {
            AssetManager.set(type, key, asset);
          }
          self.flare('progress', {
            key: key,
            asset: asset,
            progress: (++counter/length),
          });
        });
        flows.push(flow);
      });
    });


    if (self.cache) {

      self.on('progress', function(e) {
        if (e.progress >= 1.0) {
          // load失敗時、対策

          forIn.call(params, function(type, assets) {
          // params.forIn(function(type, assets) {
            forIn.call(assets, function(key, value) {
            // assets.forIn(function(key, value) {
              const asset = AssetManager.get(type, key);
              if (asset.loadError) {
                const dummy = AssetManager.get(type, 'dummy');
                if (dummy) {
                  if (dummy.loadError) {
                    dummy.loadDummy();
                    dummy.loadError = false;
                  }
                  AssetManager.set(type, key, dummy);
                } else {
                  asset.loadDummy();
                }
              }
            });
          });
        }
      });
    }
    return Flow.all(flows).then(function(args) {
      self.flare('load');
      self.loading = false;
    });
  }

  /**
   * アセット種類に応じたロード関数を登録
   * @param {string | number} key アセットタイプ名
   * @param {(...args: any)=> Flow} func Flowインスタンスを返す関数
   */
  static register(key, func) {
    this.assetLoadFunctions[key] = func;
    return this;
  }

}

/**
 * 登録済みアセットロード関数
 * @type {Record<any, (...params:any)=> PromiseLike<any>>}
 */
AssetLoader.assetLoadFunctions = {
  image: function(key, path) {
    const texture = new Texture();
    const flow = texture.load(path);
    return flow;
  },
  sound: function(key, path) {
    const sound = new Sound();
    const flow = sound.load(path);
    return flow;
  },
  spritesheet: function(key, path) {
    const ss = new SpriteSheet();
    const flow = ss.load(path);
    return flow;
  },
  script: function(key, path) {
    const script = new Script();
    return script.load(path);
  },
  font: function(key, path) {
    const font = new Font();
    font.setFontName(key);
    return font.load(path);
  },
  json: function(key, path) {
    const text = new File();
    return text.load({
      path: path,
      dataType: "json",
    });
  },
  xml: function(key, path) {
    const text = new File();
    return text.load({
      path: path,
      dataType: "xml",
    });
  },
  text: function(key, path) {
    const text = new File();
    return text.load(path);
  },
  filter: function(key, func) {
    var filter = new Filter()
    return filter.load(func);
  }
}