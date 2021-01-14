
/**
 * @class phina.util.QueryString
 * 
 */
export class QueryString {

  /**
   * @param {string} [text] 無指定のときは現在ページのURLを対象とする
   * @param {string} [sep="&"] セパレータ
   * @param {string} [eq="="] 
   * @param {boolean} [isDecode] decodeURIComponentによるデコードを行うかどうか
   * @returns {Object}
   */
  static parse(text, sep, eq, isDecode) {
    text = text || location.search.substr(1);
    sep = sep || '&';
    eq = eq || '=';
    var decode = (isDecode) ? decodeURIComponent : function(a) { return a; };
    return text.split(sep).reduce(function(obj, v) {
      var pair = v.split(eq);
      obj[pair[0]] = decode(pair[1]);
      return obj;
    }, {});
  }

  /**
   * @param {Object} value
   * @param {string} [sep="&"]
   * @param {string} [eq="="]
   * @param {boolean} [isEncode] encodeURIComponentによるエンコードを行うかどうか
   * @returns {string}
   */
  static stringify(value, sep, eq, isEncode) {
    sep = sep || '&';
    eq = eq || '=';
    var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
    return Object.keys(value).map(function(key) {
      return key + eq + encode(value[key]);
    }).join(sep);
  }
  
}