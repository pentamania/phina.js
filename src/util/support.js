import phina from "../phina";

/**
 * @class phina.util.Support
 * 
 */
export class Support {};
Support.canvas = !!phina.global.CanvasRenderingContext2D;
Support.webGL = (function() {
  return !!phina.global.CanvasRenderingContext2D && !!document.createElement('canvas').getContext('webgl');
})();
Support.webAudio = !!phina.global.AudioContext || !!phina.global['webkitAudioContext'] || !!phina.global['mozAudioContext'];
