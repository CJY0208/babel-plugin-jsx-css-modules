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

        var expression = t.callExpression(this.matcherIdentifier, [path.node.value.expression || t.stringLiteral(path.node.value.value)]);

        path.node.value = t.jSXExpressionContainer(expression);
      }
    }
  };

  return {
    visitor: {
      Program: {
        enter: function enter(path, _ref2) {
          var _ref2$opts = _ref2.opts,
              _ref2$opts$prefer = _ref2$opts.prefer,
              prefer = _ref2$opts$prefer === undefined ? defaultPrefer : _ref2$opts$prefer,
              _ref2$opts$styleFileR = _ref2$opts.styleFileReg,
              styleFileReg = _ref2$opts$styleFileR === undefined ? defaultStyleFileReg : _ref2$opts$styleFileR;

          // 筛出样式文件的引入语句
          var styleImportDeclarations = path.node.body.filter(function (node) {
            return t.isImportDeclaration(node) && styleFileReg.some(function (reg) {
              return reg.test(node.source.value);
            });
          });

          // 若无样式导入则不执行余下步骤
          if (styleImportDeclarations.length === 0) {
            return;
          }

          // 汇总出样式引入的默认导出名，若无默认导出则自动添加
          var defaultStyleIdentifiers = styleImportDeclarations.map(function (node) {
            var existingDefaultSpecifier = node.specifiers.find(function (node) {
              return t.isImportDefaultSpecifier(node);
            });

            if (!!existingDefaultSpecifier) {
              return existingDefaultSpecifier.local;
            }

            var defaultIdentifier = path.scope.generateUidIdentifier('style');

            node.specifiers.push(t.importDefaultSpecifier(defaultIdentifier));

            return defaultIdentifier;
          });

          // 合并样式引入的默认导出，并在最后一条样式引入后增加辅助代码
          var mergedStyleIdentifier = path.scope.generateUidIdentifier('styles');
          var matcherIdentifier = path.scope.generateUidIdentifier('matcher');
          var lastStyleImportDeclaration = styleImportDeclarations[styleImportDeclarations.length - 1];
          var lastStyleImportDeclarationPath = path.get('body.' + path.node.body.indexOf(lastStyleImportDeclaration));
          var getMatcherIndentifier = path.scope.generateUidIdentifier('getMatcher');

          lastStyleImportDeclarationPath.insertAfter(template('\n              const ' + getMatcherIndentifier.name + ' = require(\'babel-plugin-jsx-css-modules/helpers\').getMatcher;\n              const ' + mergedStyleIdentifier.name + ' = Object.assign({}, ' + defaultStyleIdentifiers.map(function (node) {
            return node.name;
          }).join(', ') + ');\n              const ' + matcherIdentifier.name + ' = ' + getMatcherIndentifier.name + '(' + mergedStyleIdentifier.name + ', \'' + prefer + '\');\n            ')());

          // 遍历替换文件中的 className
          path.traverse(classNameDecorator, {
            matcherIdentifier: matcherIdentifier
          });
        }
      }
    }
  };
};
