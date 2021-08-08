import phina from "../phina";
import { Vector3 } from "../geom/vector3";

/**
 * @class phina.input.Accelerometer
 * スマートフォンのセンサー情報
 */
export class Accelerometer {
  /**
   * @constructor
   */
  constructor() {
    var self = this;

    /** @property  gravity 重力センサー */
    this.gravity        = new Vector3(0, 0, 0);

    /** @property  acceleration 加速度センサー */
    this.acceleration   = new Vector3(0, 0, 0);

    /** @property  rotation 回転加速度センサー */
    this.rotation       = new Vector3(0, 0, 0);

    /** @property  orientation スマートフォンの傾き */
    this.orientation    = new Vector3(0, 0, 0);

    if (phina.isMobile()) {
      phina.global.addEventListener("devicemotion", function(e) {
        var acceleration = self.acceleration;
        var gravity = self.gravity;
        var rotation = self.rotation;
        
        if (e.acceleration) {
          acceleration.x = e.acceleration.x;
          acceleration.y = e.acceleration.y;
          acceleration.z = e.acceleration.z;
        }
        if (e.accelerationIncludingGravity) {
          gravity.x = e.accelerationIncludingGravity.x;
          gravity.y = e.accelerationIncludingGravity.y;
          gravity.z = e.accelerationIncludingGravity.z;
        }
        if (e.rotationRate) {
          rotation.x = rotation.beta  = e.rotationRate.beta;
          rotation.y = rotation.gamma = e.rotationRate.gamma;
          rotation.z = rotation.alpha = e.rotationRate.alpha;
        }
      });
      
      phina.global.addEventListener("deviceorientation", function(e) {
        var orientation = self.orientation;
        orientation.alpha   = e.alpha;  // z(0~360)
        orientation.beta    = e.beta;   // x(-180~180)
        orientation.gamma   = e.gamma;  // y(-90~90)
      });
    }
  }

}