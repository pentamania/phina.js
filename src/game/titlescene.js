import { DisplayScene } from "../display/displayscene";
import { Label } from "../display/label";
import { $safe } from "../core/object";

/**
 * @typedef {Object} TitleSceneOptionExtend
 * @property {string} [title] タイトル文字列
 * @property {string} [message] 未使用
 * @property {import("../graphics/canvas").CanvasStyle} [fontColor] タイトルラベルの色
 * @property {string} [backgroundImage] 未使用
 * @property {"touch"|""} [exitType] "touch"指定時に自動でタッチ遷移イベントを付与
 * 
 * @typedef {import("../display/displayscene").DisplaySceneOptions & TitleSceneOptionExtend} TitleSceneOptions
 */

/**
 * @class phina.game.TitleScene
 * _extends phina.display.DisplayScene
 */
export class TitleScene extends DisplayScene {

  /**
   * @constructor
   * @param {TitleSceneOptions} [params]
   */
  constructor(params) {
    params = $safe.call({}, params, TitleScene.defaults);
    // params = ({}).$safe(params, phina.game.TitleScene.defaults);
    super(params);

    this.backgroundColor = params.backgroundColor;

    this.fromJSON({
      children: {
        titleLabel: {
          className: Label,
          // className: 'phina.display.Label',
          arguments: {
            text: params.title,
            fill: params.fontColor,
            stroke: false,
            fontSize: 64,
          },
          x: this.gridX.center(),
          y: this.gridY.span(4),
        }
      }
    });

    if (params.exitType === 'touch') {
      this.fromJSON({
        children: {
          touchLabel: {
            className: Label,
            // className: 'phina.display.Label',
            arguments: {
              text: "TOUCH START",
              fill: params.fontColor,
              stroke: false,
              fontSize: 32,
            },
            x: this.gridX.center(),
            y: this.gridY.span(12),
          },
        },
      });

      this.on('pointend', function() {
        this.exit();
      });
    }
  }

}

/**
 * @type {TitleSceneOptions}
 */
TitleScene.defaults = {
  title: 'phina.js games',
  message: '',

  fontColor: 'white',
  backgroundColor: 'hsl(200, 80%, 64%)',
  backgroundImage: '',

  exitType: 'touch',
}
