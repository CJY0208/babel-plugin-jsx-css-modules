(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.JsxCssModulesHelper = {})));
}(this, (function (exports) { 'use strict';

  var getMatcher = function getMatcher(styles, prefer) {
    return function (classNames) {
      var globalClassNames = [];
      var localClassNames = [];
      var restClassNames = classNames.replace(/:global\([\s\S]*?\)/g, function (text) {
        globalClassNames = globalClassNames.concat(text.trim().replace(/(:global\(|\))/g, '').split(' '));
        return '';
      }).replace(/:local\([\s\S]*?\)/g, function (text) {
        localClassNames = localClassNames.concat(text.trim().replace(/(:local\(|\))/g, '').split(' '));
        return '';
      }).trim().split(' ');

      if (prefer === 'local') {
        localClassNames = localClassNames.concat(restClassNames);
      } else {
        globalClassNames = globalClassNames.concat(restClassNames);
      }

      return localClassNames.map(function (className) {
        return styles[className] || className;
      }).concat(globalClassNames).join(' ').trim();
    };
  };

  exports.getMatcher = getMatcher;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
