const defaultPrefer = 'local'
const defaultStyleFileReg = [/\.(css|scss|sass|less)$/]

module.exports = function({ types: t, template }) {
  const classNameDecorator = {
    JSXAttribute: {
      enter(path) {
        if (path.node.name.name !== 'className') {
          return
        }

        const expression = t.callExpression(this.matcherIdentifier, [
          path.node.value.expression || t.stringLiteral(path.node.value.value)
        ])

        path.node.value = t.jSXExpressionContainer(expression)
      }
    }
  }

  return {
    visitor: {
      Program: {
        enter(
          path,
          {
            opts: { prefer = defaultPrefer, styleFileReg = defaultStyleFileReg }
          }
        ) {
          // 筛出样式文件的引入语句
          const styleImportDeclarations = path.node.body.filter(
            node =>
              t.isImportDeclaration(node) &&
              styleFileReg.some(reg => reg.test(node.source.value))
          )

          // 若无样式导入则不执行余下步骤
          if (styleImportDeclarations.length === 0) {
            return
          }

          // 汇总出样式引入的默认导出名，若无默认导出则自动添加
          const defaultStyleIdentifiers = styleImportDeclarations.map(node => {
            const existingDefaultSpecifier = node.specifiers.find(node =>
              t.isImportDefaultSpecifier(node)
            )

            if (!!existingDefaultSpecifier) {
              return existingDefaultSpecifier.local
            }

            const defaultIdentifier = path.scope.generateUidIdentifier('style')

            node.specifiers.push(t.importDefaultSpecifier(defaultIdentifier))

            return defaultIdentifier
          })

          // 合并样式引入的默认导出，并在最后一条样式引入后增加辅助代码
          const mergedStyleIdentifier = path.scope.generateUidIdentifier(
            'styles'
          )
          const matcherIdentifier = path.scope.generateUidIdentifier('matcher')
          const lastStyleImportDeclaration =
            styleImportDeclarations[styleImportDeclarations.length - 1]
          const lastStyleImportDeclarationPath = path.get(
            `body.${path.node.body.indexOf(lastStyleImportDeclaration)}`
          )
          const getMatcherIndentifier = path.scope.generateUidIdentifier('getMatcher')

          lastStyleImportDeclarationPath.insertAfter(
            template(`
              import { ${getMatcherIndentifier.name} } from 'jsx-css-modules/helpers
              const ${
                mergedStyleIdentifier.name
              } = Object.assign({}, ${defaultStyleIdentifiers
              .map(node => node.name)
              .join(', ')});

              const ${matcherIdentifier.name} = ${getMatcherIndentifier.name}(${mergedStyleIdentifier.name}, '${prefer}')
            `)()
          )

          // 遍历替换文件中的 className
          path.traverse(classNameDecorator, {
            matcherIdentifier
          })
        }
      }
    }
  }
}
