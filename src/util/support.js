import global from "../global";

/**
 * @class phina.util.Support
 * 
 */
export class Support {};
Support.canvas = !!global.CanvasRenderingContext2D;
Support.webGL = (function() {
  return !!global.CanvasRenderingContext2D && !!document.createElement('canvas').getContext('webgl');
})();
Support.webAudio = !!global.AudioContext || !!global['webkitAudioContext'] || !!global['mozAudioContext'];
