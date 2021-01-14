/**
 * MouseEvent/Touch拡張
 * マウスのX座標.
 */
export var pointX = {
  /** @this {MouseEvent|Touch} */
  get: function() {
    return this.clientX - /** @type {HTMLElement} */(this.target).getBoundingClientRect().left;
  }
}

/**
 * MouseEvent/Touch拡張
 * マウスのY座標.
 */
export var pointY = {
  /** @this {MouseEvent|Touch} */
  get: function() {
    return this.clientY - /** @type {HTMLElement} */(this.target).getBoundingClientRect().top;
  }
}

/**
 * TouchEvent拡張
 * タッチイベントのX座標.
 */
export var touchPointX = {
  /** @this {TouchEvent} */
  get: function() {
    return this.touches[0].clientX - /** @type {HTMLElement} */(this.target).getBoundingClientRect().left;
    // return this.touches[0].pageX - this.target.getBoundingClientRect().left - tm.global.scrollX;
  }
}

/**
 * TouchEvent拡張
 * タッチイベントのY座標.
 */
export var touchPointY = {
  /** @this {TouchEvent} */
  get: function() {
    return this.touches[0].clientY - /** @type {HTMLElement} */(this.target).getBoundingClientRect().top;
    // return this.touches[0].pageY - this.target.getBoundingClientRect().top - tm.global.scrollY;
  }
}

/**
 * global.Event
 * 既存のEventオブジェクト拡張
 */

/**
 * @method stop
 * イベントのデフォルト処理 & 伝達を止める
 */
export function stop() {
  // イベントキャンセル
  this.preventDefault();
  // イベント伝達を止める
  this.stopPropagation();
}


// ;(function() {

  // if (!phina.global.Event) return ;

  /**
   * @class global.Event
   * 既存のEventオブジェクト拡張
   */
    
  // /**
  //  * @method stop
  //  * イベントのデフォルト処理 & 伝達を止める
  //  */
  // Event.prototype.stop = function() {
  //   // イベントキャンセル
  //   this.preventDefault();
  //   // イベント伝達を止める
  //   this.stopPropagation();
  // };

// })();


// (function() {

//   if (!phina.global.MouseEvent) return ;

//   /**
//    * @class global.MouseEvent
//    * MouseEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * マウスのX座標.
//    */
//   MouseEvent.prototype.getter("pointX", function() {
//     return this.clientX - this.target.getBoundingClientRect().left;
//     // return this.pageX - this.target.getBoundingClientRect().left - window.scrollX;
//   });
  
//   /**
//    * @method    pointY
//    * マウスのY座標.
//    */
//   MouseEvent.prototype.getter("pointY", function() {
//     return this.clientY - this.target.getBoundingClientRect().top;
//     // return this.pageY - this.target.getBoundingClientRect().top - window.scrollY;
//   });
    
// })();


// (function() {
    
//   if (!phina.global.TouchEvent) return ;
  
  
//   /**
//    * @class global.TouchEvent
//    * TouchEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * タッチイベント.
//    */
//   TouchEvent.prototype.getter("pointX", function() {
//       return this.touches[0].clientX - this.target.getBoundingClientRect().left;
//       // return this.touches[0].pageX - this.target.getBoundingClientRect().left - tm.global.scrollX;
//   });
  
//   /**
//    * @method    pointY
//    * タッチイベント.
//    */
//   TouchEvent.prototype.getter("pointY", function() {
//       return this.touches[0].clientY - this.target.getBoundingClientRect().top;
//       // return this.touches[0].pageY - this.target.getBoundingClientRect().top - tm.global.scrollY;
//   });  
    
// })();


// (function() {
    
//   if (!phina.global.Touch) return ;
  
//   /**
//    * @class global.Touch
//    * TouchEvent クラス
//    */
  
//   /**
//    * @method    pointX
//    * タッチイベント.
//    */
//   Touch.prototype.getter("pointX", function() {
//       return this.clientX - this.target.getBoundingClientRect().left;
//   });

//   /**
//    * @method    pointY
//    * タッチイベント.
//    */
//   Touch.prototype.getter("pointY", function() {
//       return this.clientY - this.target.getBoundingClientRect().top;
//   });
    
// })();
