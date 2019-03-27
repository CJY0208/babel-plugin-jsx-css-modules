'use strict';

var defaultPrefer = 'local';
var defaultStyleFileReg = [/\.(css|scss|sass|less)$/];

module.exports = function (_ref) {
  var t = _ref.types,
      template = _ref.template;

  var classNameDecorator = {
    JSXAttribute: {
      enter: function enter(path) {
        if (path.node.name.name !== 'className') {
          return;
        }
        path.node.value = t.jSXExpressionContainer(t.callExpression(this.matcher, [path.node.value.expression || t.stringLiteral(path.node.value.value)]));
      }
    }
  };

  return {
    pre: function pre(_ref2) {
      var _ref2$opts = _ref2.opts,
          _ref2$opts$prefer = _ref2$opts.prefer,
          prefer = _ref2$opts$prefer === undefined ? defaultPrefer : _ref2$opts$prefer,
          _ref2$opts$styleFileR = _ref2$opts.styleFileReg,
          styleFileReg = _ref2$opts$styleFileR === undefined ? defaultStyleFileReg : _ref2$opts$styleFileR;

      this.prefer = prefer;
      // 初始化检测样式文件的正则表达式
      this.styleFileReg = styleFileReg.map(function (reg) {
        if (Object.prototype.toString.call(reg) === '[object RegExp]') {
          return reg;
        }

        if (typeof reg === 'string') {
          return new RegExp(reg);
        }

        return undefined;
      }).filter(function (reg) {
        return !!reg;
      });
    },

    visitor: {
      Program: {
        enter: function enter(path) {
          var _this = this;

          // 筛出样式文件的引入语句，若无样式导入则不执行余下步骤
          var styleImports = path.node.body.filter(function (node) {
            return t.isImportDeclaration(node) && _this.styleFileReg.some(function (reg) {
              return reg.test(node.source.value);
            });
          });
          if (styleImports.length === 0) {
            return;
          }

          // 汇总出样式引入的默认导出名，若无默认导出则自动添加
          var defaultStyles = styleImports.map(function (node) {
            var existingDefaultSpecifier = node.specifiers.find(function (node) {
              return t.isImportDefaultSpecifier(node);
            });
            if (!!existingDefaultSpecifier) {
              return existingDefaultSpecifier.local;
            }

            var defaultStyle = path.scope.generateUidIdentifier('style');
            node.specifiers.push(t.importDefaultSpecifier(defaultStyle));
            return defaultStyle;
          });

          // 合并样式引入的默认导出，并在最后一条样式引入后增加辅助代码
          var mergedStyle = path.scope.generateUidIdentifier('styles');
          var getMatcher = path.scope.generateUidIdentifier('getMatcher');
          var matcher = path.scope.generateUidIdentifier('matcher');

          var lastStyleImportDeclaration = styleImports[styleImports.length - 1];
          var lastStyleImportDeclarationPath = path.get('body.' + path.node.body.indexOf(lastStyleImportDeclaration));
          lastStyleImportDeclarationPath.insertAfter(template('\n              const ' + getMatcher.name + ' = require(\'babel-plugin-jsx-css-modules/helpers\').getMatcher;\n              const ' + mergedStyle.name + ' = Object.assign({}, ' + defaultStyles.map(function (node) {
            return node.name;
          }).join(', ') + ');\n              const ' + matcher.name + ' = ' + getMatcher.name + '(' + mergedStyle.name + ', \'' + this.prefer + '\');\n            ')());

          // 遍历替换文件中的 className
          path.traverse(classNameDecorator, {
            matcher: matcher
          });
        }
      }
    }
  };
};
