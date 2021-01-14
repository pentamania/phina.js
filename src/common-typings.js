/**
 * アクセサ拡張用オブジェクト
 * @typedef {{get: ()=> any, set: (v:any)=> void}} AccessorExtendObject
 */

/**
 * new可能なFunction
 * @typedef {new (...args: any)=> any} Constructable
 */

/**
 * Appクラス統合ユニオン型
 * @typedef {import('./app/baseapp').BaseApp} BaseApp
 * @typedef {import('./display/domapp').DomApp} DomApp
 * @typedef {import('./display/canvasapp').CanvasApp} CanvasApp
 * @typedef {import('./game/gameapp').GameApp} GameApp
 * @typedef {BaseApp | DomApp | CanvasApp | GameApp} AppUnion
 */

/**
 * ゆるいオブジェクト型
 * @typedef {{[key: string]: any}} LooseObject
 */
