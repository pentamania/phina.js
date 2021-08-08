import { DisplayScene } from "../display/displayscene";
import { Label } from "../display/label";
import { $safe } from "../core/object";

/**
 * @typedef {{
 *   fontColor?: string,
 *   exitType?: 'touch'
 * } & import("../display/displayscene").DisplaySceneOptions } PauseSceneOptions
 */

/**
 * @class phina.game.PauseScene
 * _extends phina.display.DisplayScene
 */
export class PauseScene extends DisplayScene {

  /**
   * @constructor
   * @param {PauseSceneOptions} [params]
   */
  constructor(params) {
    params = $safe.call({}, params, PauseScene.defaults);
    // params = ({}).$safe(params, phina.game.PauseScene.defaults);
    super(params);

    this.backgroundColor = params.backgroundColor;

    this.fromJSON({
      children: {
        text: {
          className: Label,
          // className: 'phina.display.Label',
          arguments: {
            text: 'Pause',
            fill: params.fontColor,
            stroke: null,
            fontSize: 48,
          },
          x: this.gridX.center(),
          y: this.gridY.center(),
        },
      }
    });

    if (params.exitType === 'touch') {
      this.on('pointend', function() {
        this.exit();
      });
    }
  }

}

/** @type PauseSceneOptions */
PauseScene.defaults =  {
  fontColor: 'white',
  backgroundColor: 'hsla(0, 0%, 0%, 0.85)',

  exitType: 'touch',
}
