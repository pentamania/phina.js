import { $safe } from "../core/object";
import { Flow } from "./flow";

/**
 * @typedef {Object} AjaxRequestOptions Ajaxクラス初期化オプション
 * @property {'GET'|'POST'|'PUT'|'DELETE'} type 
 * @property {string} url 
 * @property {string} [contentType] 
 * @property {string} [responseType] 
 * @property {any} [data] 未使用？
 */

 /**
 * @class phina.util.Ajax
 * 
 */
export class Ajax {

  /**
   * @param {AjaxRequestOptions} options
   */
  static request(options) {
    var data = $safe.call({}, options, Ajax.defaults);
    // var data = ({}).$safe(options, this.defaults);

    var xhr = new XMLHttpRequest();
    var flow = new Flow(function(resolve) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if ([200, 201, 0].indexOf(xhr.status) !== -1) {
            resolve(xhr.response);
          }
        }
      };

      xhr.open(data.type, data.url);
      xhr.responseType = data.responseType;
      xhr.send(null);
    });

    return flow;
  }
  static get(url) {
    return Ajax.request({
      type: 'GET',
      url: url,
    });
  }
  static post(url) {
    return Ajax.request({
      type: 'POST',
      url: url,
    });
  }
  static put(url) {
    return Ajax.request({
      type: 'PUT',
      url: url,
    });
  }
  static del(url) {
    return Ajax.request({
      type: 'DELETE',
      url: url,
    });
  }

}

/** 
 * @static
 * @type {AjaxRequestOptions}
 */
Ajax.defaults = {
  type: 'GET',
  contentType: 'application/x-www-form-urlencoded',
  responseType: 'json',
  data: null,
  url: '',
}