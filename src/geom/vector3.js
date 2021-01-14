/**
 * @class phina.geom.Vector3
 * # 3次元ベクトルクラス（未実装）
 * 3次元のベクトルや座標を表すクラスです。
 */
export class Vector3 {

  /**
   * @param {number} [x=0]
   * @param {number} [y=0]
   * @param {number} [z=0]
   */
  constructor(x, y, z) {
    /**
     * x座標
     * @type {number}
     */
    this.x = x || 0;

    /**
     * y座標
     * @type {number}
     */
    this.y = y || 0;

    /**
     * z座標
     * @type {number}
     */
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