import { DisplayScene } from "../display/displayscene";
import { $safe } from "../core/object";
import { Gauge } from "../ui/gauge";
import { AssetLoader } from "../asset/assetloader";

/**
 * @typedef {{
 *   lie?: boolean,
 *   exitType?: 'auto'
 *   assets?: import("../asset/assetloader").AssetLoaderLoadParam
 * } & import("../display/displayscene").DisplaySceneOptions } LoadingSceneOptions
 */

/**
 * @class phina.game.LoadingScene
 * _extends phina.display.DisplayScene
 */
export class LoadingScene extends DisplayScene {

  /**
   * @constructor
   * @param {LoadingSceneOptions} [options]
   */
  constructor(options) {
    options = $safe.call({}, options, LoadingScene.defaults);
    // options = ({}).$safe(options, phina.game.LoadingScene.defaults);
    super(options);

    this.gauge = new Gauge({
      value: 0,
      width: this.width,
      height: 12,
      fill: '#aaa',
      stroke: false,
      gaugeColor: 'hsla(200, 100%, 80%, 0.8)',
      padding: 0,
    }).addChildTo(this)
      .setPosition(
        this.gridX.center(),
        0,
      )
      .setOrigin(
        0.5, 
        0
      )
    // this.fromJSON({
    //   children: {
    //     gauge: {
    //       className: 'phina.ui.Gauge',
    //       arguments: {
    //         value: 0,
    //         width: this.width,
    //         height: 12,
    //         fill: '#aaa',
    //         stroke: false,
    //         gaugeColor: 'hsla(200, 100%, 80%, 0.8)',
    //         padding: 0,
    //       },
    //       x: this.gridX.center(),
    //       y: 0,
    //       originY: 0,
    //     }
    //   }
    // });

    var loader = new AssetLoader();

    if (options.lie) {
      this.gauge.animationTime = 10*1000;
      this.gauge.value = 90;

      loader.on('load', function() {
        this.gauge.animationTime = 0;
        this.gauge.value = 100;
      }.bind(this));
    }
    else {
      this.gauge.animationTime = 100;
      loader.on('progress', function(e) {
        this.gauge.value = e.progress * 100;
      }.bind(this)) ;
    }

    this.gauge.on('full', function() {
      if (options.exitType === 'auto') {
        this.app.popScene();
      }
      this.flare('loaded');
    }.bind(this));

    loader.load(options.assets);
  }

}

/** @type LoadingSceneOptions */
LoadingScene.defaults = {
  exitType: 'auto',
  lie: false,
};
