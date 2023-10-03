/**
 * @class phina.util.Support
 * 
 */
export class Support {};
Support.canvas = !!globalThis.CanvasRenderingContext2D;
Support.webGL = (function() {
  return !!globalThis.CanvasRenderingContext2D && !!document.createElement('canvas').getContext('webgl');
})();
Support.webAudio = !!globalThis.AudioContext || !!globalThis['webkitAudioContext'] || !!globalThis['mozAudioContext'];
