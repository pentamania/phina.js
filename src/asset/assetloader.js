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
 * @class phina.asset.AssetLoader
 * _extends phina.util.EventDispatcher
 */
export class AssetLoader extends EventDispatcher {

  /**
   * @constructor
   * @param {{ cache: boolean }} [params]
   */
  constructor(params) {
    super();

    // params = (params || {}).$safe({
    //   cache: true,
    // });
    params = $safe.call(params||{}, { cache: true })

    this.assets = {};
    this.cache = params.cache;
  }

  /**
   * @param {AssetLoaderLoadParam} params
   * @returns {Flow}
   */
  load(params) {
    var self = this;
    var flows = [];

    var counter = 0;
    var length = 0;
    forIn.call(params, function(_type, assets) {
    // params.forIn(function(type, assets) {
      length += Object.keys(assets).length;
    });
    
    forIn.call(params, function(type, assets) {
    // params.forIn(function(type, assets) {
      forIn.call(assets, function(key, value) {
      // assets.forIn(function(key, value) {
        var func = AssetLoader.assetLoadFunctions[type];
        var flow = func(key, value);
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
              var asset = AssetManager.get(type, key);
              if (asset.loadError) {
                var dummy = AssetManager.get(type, 'dummy');
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
 */
AssetLoader.assetLoadFunctions = {
  image: function(key, path) {
    var texture = new Texture();
    var flow = texture.load(path);
    return flow;
  },
  sound: function(key, path) {
    var sound = new Sound();
    var flow = sound.load(path);
    return flow;
  },
  spritesheet: function(key, path) {
    var ss = new SpriteSheet();
    var flow = ss.load(path);
    return flow;
  },
  script: function(key, path) {
    var script = new Script();
    return script.load(path);
  },
  font: function(key, path) {
    var font = new Font();
    font.setFontName(key);
    return font.load(path);
  },
  json: function(key, path) {
    var text = new File();
    return text.load({
      path: path,
      dataType: "json",
    });
  },
  xml: function(key, path) {
    var text = new File();
    return text.load({
      path: path,
      dataType: "xml",
    });
  },
  text: function(key, path) {
    var text = new File();
    return text.load(path);
  }
}