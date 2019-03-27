(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.JsxCssModulesHelper = {})));
}(this, (function (exports) { 'use strict';

  var splitString = function splitString(string) {
    return string.trim().split(' ');
  };

  var getMatcher = function getMatcher(styles, prefer) {
    return function (classNames) {
      var globalClassNames = [];
      var localClassNames = [];
      var restClassNames = splitString(classNames.replace(/\s{2,}/g, ' ').replace(/:global\([\s\S]*?\)/g, function (text) {
        globalClassNames = globalClassNames.concat(splitString(text.replace(/(:global\(|\))/g, '')));
        return '';
      }).replace(/:local\([\s\S]*?\)/g, function (text) {
        localClassNames = localClassNames.concat(splitString(text.replace(/(:local\(|\))/g, '')));
        return '';
      }));

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
