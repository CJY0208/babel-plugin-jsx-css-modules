# babel-plugin-jsx-css-modules

通过 `Babel` 实现 `JSX` 中**无感知**使用 [CSS Modules](https://github.com/css-modules/css-modules)

不需要显式调用 `styles` 变量或自定义 `props` 如 `styleName`

**需确保已启用 CSS Modules 功能**

**Babel 6/7 均可用**

- - -

## 使用方法

1. 安装插件

    ```bash
    npm install babel-plugin-jsx-css-modules --save
    ```

2. 配置 `.babelrc` 文件

    ```json
    {
      "plugins": [
        "jsx-css-modules"
      ]
    }
    ```
3. 调整构建配置以启用 `cssModules` 功能

    启用方式可参考：

    - https://github.com/css-modules/css-modules#implementations    
    - https://github.com/webpack-contrib/css-loader#modules
    - https://github.com/css-modules/postcss-modules

    **注意：未启用 `cssModules` 功能的样式文件不会有效果**

- - -

## 示例

```javascript
import './styles.module.scss'

const Example = ({ customerClassName }) => (
  <div>
    <div className="module-class-name">Example</div>
    <div className={customerClassName}>Example</div>
  </div>
)
```

将转化为

```javascript
import styles from  './styles.module.scss'
const matcher = classNames => 
  classNames.split(' ').map(className => styles[className] || className).join(' ')

const Example = ({ customerClassName }) => (
  <div>
    <div className={matcher('module-class-name')}>Example</div>
    <div className={matcher(customerClassName)}>Example</div>
  </div>
)
```

以上是对该插件运作方式的简单解释，实际上，`matcher` 函数还可完成对全局样式的甄选，参考如下说明

- - -

## 区分全局、局部样式

依照 [cssModules 规则](https://github.com/css-modules/css-modules#exceptions)，在类名上拓展了 `:global` / `:local` 修饰器语法，以区分全局、局部样式

未添加修饰器的类名默认属于 `:local` 样式，此行为通过 `prefer` 参数修改

```javascript
import './styles.module.scss'

const Example = () => (
  <div className={`
      :global(global_1 global_2) 
      :local(module_1 module_2) 
      rest_1 rest_2
    `}>
    Example
  </div>
)
```

**注意：不支持嵌套使用修饰器**，不支持形如 `:global(xxx :global(yyy zzz) aaa)` 的使用方式

- - -

## 配置项

```json
{
  "plugins": [
    ["jsx-css-modules", {
      "styleFileReg": [
        "\\.(css|scss|sass|less)$"
      ],
      "prefer": "local",
      "helperImportType": "cjs"
    }]
  ]
}
```

| 名称 | 类型 | 默认值 | 描述
| - | - | - | -
| styleFileReg | `Array` of `RegExp` | `[/\.(css\|scss\|sass\|less)$/]` | 用以匹配需要处理的 css 模块文件
| prefer | `String` | `'local'` | 声明未修饰的类名归属于何种类型，取值为 `'local'` 或 `'global'`
| helperImportType | `String` | `'cjs'` | 声明辅助函数的导入方式，取值为 `'cjs'` 或 `'esm'`

- - -

## 注意事项

当存在多个 `cssModules` 样式文件时，若文件内存在同名模块，则只会保留最后被引用文件内的模块

```scss
// style1.module.scss
.test {
  color: red;
}

// style2.module.scss
.test {
  color: blue;
}
```
```javascript
import './style1.module.scss'
import './style2.module.scss'

const Example = () => (
  <div className="test">我将会是蓝色的</div>
)
```

- - -

### 可选待办事项

考虑到插件功能关注点不同，目前不太清楚是否有必要支持如下两种、或更多可能性的书写方式，可以在 issue 中交流

若添加如下特性，插件有可能需要进行更名，含义类似于 `className-all-in-one` 或 `jsx-className-expansion`

- [x] ~~无感知使用 `CSS Modules`~~
- [ ] 兼容 `styleName`（`prefer` 选项固定为 `'global'`）
- [ ] 无感知集成 [classnames](https://github.com/JedWatson/classnames) 功能，示例如下

    ```javascript
    const Example = () => (
      <div>
        <span
          className={{
            xxx: true,
            yyy: false
          }}
        />
        <span
          className={[
            'zzz',
            {
              xxx: 1,
              yyy: 0
            }
          ]}
        />
      </div>
    )
    ```

- - -

### 参考资料或辅助工具

- [手把手教你开发一个 babel-plugin](https://segmentfault.com/a/1190000016459270)
- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- [@babel/types](https://babeljs.io/docs/en/babel-types)
- [AST Explorer](https://astexplorer.net/)

