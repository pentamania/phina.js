import { $safe } from "../core/object";
import { Canvas } from "../graphics/canvas"
import { DisplayElement } from "./displayelement";
import { CanvasRenderer } from "./canvasrenderer";
import { Grid } from "../util/grid";
import phina from "../phina";

/**
 * @class phina.display.Layer
 * _extends phina.display.DisplayElement
 */
export class Layer extends DisplayElement {

  /**
   * @param {DisplayElement.defaults} [options] 
   */
  constructor(options) {
    options = $safe.call({}, options||{}, {
    // options = ({}).$safe(options, {
      width: 640,
      height: 960,
    });
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.gridX = new Grid(options.width, 16);
    this.gridY = new Grid(options.height, 16);
    this.renderChildBySelf = true;

    /**
     * @type HTMLCanvasElement 
     */
    this.domElement;
  }

  /**
   * @param {Canvas} canvas
   * @returns {void}
   */
  draw(canvas) {
    if (!this.domElement) return ;

    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}


/**
 * @class phina.display.CanvasLayer
 * _extends phina.display.Layer
 */
export class CanvasLayer extends Layer {

  /**
   * @param {DisplayElement.defaults} options 
   */
  constructor(options) {
    super(options);
    this.canvas = new Canvas();
    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    this.renderer = new CanvasRenderer(this.canvas);
    this.domElement = this.canvas.domElement;

    this.on('enterframe',
    /** @this CanvasLayer */
    function() {
      var temp = this._worldMatrix;
      this._worldMatrix = null;
      this.renderer.render(this);
      this._worldMatrix = temp;
    });
  }

  /**
   * @param {Canvas} canvas
   * @returns {void}
   */
  draw(canvas) {
    var image = this.domElement;
    canvas.context.drawImage(image,
      0, 0, image.width, image.height,
      -this.width*this.originX, -this.height*this.originY, this.width, this.height
      );
  }
}

var THREE = phina.global['THREE']

/**
 * @class phina.display.ThreeLayer
 * _extends phina.display.Layer
 */
export class ThreeLayer extends Layer {

  // scene: null,
  // camera: null,
  // light: null,
  // renderer: null,

  constructor(options) {
    super(options);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 75, options.width / options.height, 1, 10000 );
    this.camera.position.z = 1000;

    this.light = new THREE.DirectionalLight( 0xffffff, 1 );
    this.light.position.set( 1, 1, 1 ).normalize();
    this.scene.add( this.light );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setSize( options.width, options.height );

    this.on('enterframe',
    /** @this ThreeLayer */
    function() {
      this.renderer.render( this.scene, this.camera );
    });

    this.domElement = this.renderer.domElement;
  }
}