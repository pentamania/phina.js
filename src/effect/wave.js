import { $safe } from "../core/object"
import { CircleShape } from "../display/shape"
import { Tweener } from "../accessory/tweener"

/**
 * @class phina.effect.Wave
 * _extends phina.display.CircleShape
 */
export class Wave extends CircleShape {

  /**
   * @constructor
   * @param {import("../display/shape").CircleShapeOptions} [options]
   */
  constructor(options) {
    options = $safe.call(options || {}, {
    // options = (options || {}).$safe({
      fill: 'white',
      stroke: false,
    });

    super(options);

    var tweener = new Tweener().attachTo(this);
    tweener
      .to({scaleX:2, scaleY:2, alpha:0}, 500)
      .call(function() {
        this.remove();
      }, this);
  }
}