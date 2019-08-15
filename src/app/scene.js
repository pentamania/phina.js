import {Element} from "./element"

/**
 * @class phina.app.Scene
 * @extends phina.app.Element
 */
export class Scene extends Element {

  constructor() {
    super();
  }

  exit(nextLabel, nextArguments) {
    if (!this.app) return ;

    if (arguments.length > 0) {
      if (typeof arguments[0] === 'object') {
        nextLabel = arguments[0].nextLabel || this.nextLabel;
        nextArguments = arguments[0];
      }

      this.nextLabel = nextLabel;
      this.nextArguments = nextArguments;
    }

    this.app.popScene();

    return this;
  }

}