import { Asset } from "./asset";

/**
 * @class phina.asset.Script
 * @extends phina.asset.Asset
 */
export class Script extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  _load(resolve) {
    var self = this;
    this.domElement = document.createElement('script');
    this.domElement.src = this.src;

    this.domElement.onload = function() {
      resolve(self);
    }.bind(this);

    document.body.appendChild(this.domElement);
  }

}