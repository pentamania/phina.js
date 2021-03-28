import * as objectExtensions from "./core/object";
import * as arrayExtensions from "./core/array";
import * as arrayStaticExtensions from "./core/array-static";
import * as stringExtensions from "./core/string";
import * as numberExtensions from "./core/number";
import * as mathExtensions from "./core/math";
import * as dateExtensions from "./core/date";
import * as dateStaticExtensions from "./core/date-static";
import {
  pointX,
  pointY,
  touchPointX,
  touchPointY,
  stop as eventStop,
} from "./dom/event";

/** @typedef {"Object"|"Array"|"ArrayStatic"|"Math"|"String"|"Number"|"Date"|"DateStatic"} ExtendableObjectType */
/** @typedef {{ [key in ExtendableObjectType]: any } } ObjectTypeMapForExtension */
/** @typedef {{ [key in ExtendableObjectType]: Function | import('./phina').AccessorExtendObject | number | string }} ExtensionMethodMap */

/**
 * カスタムメソッドを定義
 * @param {any} obj
 * @param {string} methodName
 * @param {function} func
 */
function _defineMethod(obj, methodName, func) {
  return objectExtensions.$method.call(obj, methodName, func);
  // Object.defineProperty(obj, methodName, {
  //   value: func,
  //   enumerable: false,
  //   writable: true
  // })
}

/**
 * カスタムアクセサを定義
 * @param {any} obj
 * @param {string} accessorName
 * @param {import('./phina').AccessorExtendObject} extendObj
 */
function _defineAccessor(obj, accessorName, extendObj) {
  return objectExtensions.accessor.call(obj, accessorName, extendObj);
}

/**
 * 汎用オブジェクト拡張関数
 * @param {any} targetObj 対象ビルトインオブジェクト ex) Array.prototype
 * @param {ExtensionMethodMap} extensionMap
 */
function _extend(targetObj, extensionMap) {
  Object.keys(extensionMap).forEach((key) => {
    var value = extensionMap[key];
    if (typeof value === "function") {
      _defineMethod(targetObj, key, value);
    } else if (typeof value === "object" && (value.get || value.set)) {
      _defineAccessor(targetObj, key, value);
    } else {
      // その他static値、Math.DEG_TO_RADなど
      targetObj[key] = value;
    }
  });
}

/**
 * オブジェクト名称 <-> 実際のオブジェクト
 * @type {ObjectTypeMapForExtension}
 */
var ExtendableObjectTypeMap = {
  Object: Object.prototype,
  Array: Array.prototype,
  ArrayStatic: Array,
  Math: Math, // MathはStaticのみ
  String: String.prototype,
  Number: Number.prototype,
  Date: Date.prototype,
  DateStatic: Date,
};

/**
 * オブジェクト名称 <-> 拡張メソッドマップ
 * @type {ObjectTypeMapForExtension}
 * */
var ExtensionTypeMap = {
  Object: objectExtensions,
  Array: arrayExtensions,
  ArrayStatic: arrayStaticExtensions,
  Math: mathExtensions,
  String: stringExtensions,
  Number: numberExtensions,
  Date: dateExtensions,
  DateStatic: dateStaticExtensions,
};

/**
 * Objectなどの標準組み込みオブジェクトの拡張を行う
 * - 引数無指定では全ての拡張を行う
 * - 拡張したいオブジェクト、メソッドを文字列で指定することも可能
 *
 * @example
 * // 全拡張（従来のphina.jsの状態）
 * extendBuiltInObject();
 *
 * // Numberオブジェクトの一部メソッドだけ拡張
 * extendBuiltInObject("Number", ["clamp", "upto"]);
 *
 * @param {ExtendableObjectType} [objectType] "Array"などの対象オブジェクト文字列
 * @param {string[]} [methodNameList] メソッド名文字列
 * @returns {void}
 */
export function extendBuiltInObject(objectType, methodNameList) {
  if (!objectType) {
    // 拡張全てを一括で行う
    Object.keys(ExtendableObjectTypeMap).forEach((objType) => {
      _extend(ExtendableObjectTypeMap[objType], ExtensionTypeMap[objType]);
    });
    // _extend(Object.prototype, objectExtensions);
    // _extend(Array.prototype, arrayExtensions);
    // _extend(Array, arrayStaticExtensions);
    // _extend(String.prototype, stringExtensions);
    // _extend(Number.prototype, numberExtensions);
    // _extend(Math, mathExtensions);
    // _extend(Date.prototype, dateExtensions);
    // _extend(Date, dateStaticExtensions);
  } else {
    // 個別拡張
    var targetObject = ExtendableObjectTypeMap[objectType];
    if (!targetObject) {
      // `${objectType}は拡張可能対象ではありません`
      return;
    }
    if (methodNameList) {
      const exts = ExtensionTypeMap[objectType];

      /** @type ExtensionMethodMap */
      const methodMap = Object.create(null);
      methodNameList.forEach((methodName) => {
        if (!exts[methodName]) {
          // TODO: no method error
          return;
        }
        methodMap[methodName] = exts[methodName];
      });

      _extend(targetObject, methodMap);
    } else {
      // targetObjectの拡張全てを行う
      const exts = ExtensionTypeMap[objectType];
      _extend(targetObject, exts);
    }
  }
}

/**
 * dom/Event 一括拡張用メソッド
 */
export function extendEventObject() {
  const getter = objectExtensions.getter;

  [MouseEvent, Touch].forEach((eventObject) => {
    getter.call(eventObject.prototype, "pointX", pointX.get);
    getter.call(eventObject.prototype, "pointY", pointY.get);
  });

  getter.call(TouchEvent.prototype, "pointX", touchPointX.get);
  getter.call(TouchEvent.prototype, "pointY", touchPointY.get);

  _defineMethod(Event.prototype, "stop", eventStop);
}
