/**
 * Arrayクラスのstatic拡張
 */
import { range as _range } from "./array"

/**
 * @method range
 * @static
 * インスタンスメソッドの {@link #range} と同じです。
 *
 * ### Example
 *     Array.range(2, 14, 5); // => [2, 7, 12]
 */
export function range(start, end, step) {
  return _range.apply([], arguments);
}
// Array.$method("range", function(start, end, step) {
//   return Array.prototype.range.apply([], arguments);
// });
