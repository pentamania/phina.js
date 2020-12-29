
/**
 * @class phina.geom.Vector3
 * # 3次元ベクトルクラス（未実装）
 * 3次元のベクトルや座標を表すクラスです。
 */
export class Vector3 {

  /** x座標 */
  // x: 0,
  /** y座標 */
  // y: 0,
  /** z座標 */
  // z: 0,

  /**
   * @constructor
   */
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

    /**
     * z軸回転角度
     */
    this.alpha = 0;

    /**
     * x軸回転角度
     */
    this.beta = 0;

    /**
     * y軸回転角度
     */
    this.gamma = 0;
  }

}