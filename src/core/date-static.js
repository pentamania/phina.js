/**
 * @class global.Date
 * Dateクラスのstatic拡張
 */

/**
 * @method calculateAge
 * @static
 * 指定した誕生日から、現在または指定した日付における年齢を計算します。
 *
 * ###Reference
 * - [Javascriptで誕生日から現在の年齢を算出](http://qiita.com/n0bisuke/items/dd537bd4cbe9ab501ce8)
 *
 * ### Example
 *     Date.calculateAge("1990-01-17"); // => 26 など
 *
 * @param {String|Date} birthday 誕生日
 * @param {String|Date} [when=本日] 基準の日付
 * @return {Number} 年齢
 */
export function calculateAge(birthday, when) {
// Date.$method('calculateAge', function(birthday, when) {
  // birthday
  if (typeof birthday === 'string') {
    birthday = new Date(birthday);
  }
  // when
  if (!when) {
    when = new Date();
  }
  else if (typeof when === 'string') {
    when = new Date(when);
  }

  var bn = new Date(birthday.getTime()).setFullYear(256);
  var wn = new Date(when.getTime()).setFullYear(256);
  var step = (wn < bn) ? 1 : 0;

  return (when.getFullYear() - birthday.getFullYear()) - step;
}