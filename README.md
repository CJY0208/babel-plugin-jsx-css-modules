# babel-plugin-jsx-css-modules

通过 `Babel` 实现 `jsx` 中无感知使用 [cssModules](https://github.com/css-modules/css-modules)

不需要显示调用 `styles` 变量或自定义 `props` 如 `styleName`

**目前仅支持 Babel 6**

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

- - -

## 基础示例

```javascript
import './styles.module.scss'

const Example = ({ customerClassName }) => (
  <div>
    <div className="module-class-name">Example</div>
    <div className={customerClassName}>Example</div>
  </div>
)
```

以上将转化为

```javascript
import styles from  './styles.module.scss'
const matcher = classNames => 
  classNames.split(' ').map(className => styles[className] || className).join(' ')

const Example = () => (
  <div>
    <div className={matcher('module-class-name')}>Example</div>
    <div className={matcher(customerClassName)}>Example</div>
  </div>
)
```

以上是对该工具运作方式的简单解释，实际上，`matcher` 函数还可辅助完成对全局样式的挑选，参考如下示例

- - -

## 使用 `:global` / `:local` 修饰符以区分全局、局部样式

依照 [cssModules 规则](https://github.com/css-modules/css-modules#exceptions)，在类名上拓展了 `:global` / `:local` 修饰符语法，以区分全局、局部样式

未添加修饰符的类名默认属于 `:local` 样式，此行为通过 `prefer` 参数修改

```javascript
import './styles.module.scss'

const Example = ({ customerClassName }) => (
  <div>
    <div className=":global(global-class-1 global-class-2) :local(module-class-1 module-class-2) rest-class-1 rest-class-2">Example</div>
  </div>
)
```

**注意：不要嵌套使用修饰符**，不支持形如 `:global(xxx :global(yyy zzz) aaa)` 的使用方式

- - -

## 配置项

```json
{
  "plugins": [
    ["jsx-css-modules", {
      "styleFileReg": [
        "\\.(css|scss|sass|less)$"
      ],
      "prefer": "local"
    }]
  ]
}
```

| 名称 | 类型 | 默认值 | 描述
| - | - | - | -
| styleFileReg | `Array` of `RegExp` | `[/\.(css\|scss\|sass\|less)$/]` | 用以匹配需要处理的 css 模块文件
| prefer | `String` | `'local'` | 声明未修饰的类名归属于何种类型，取值为 `'local'` 或 `'global'`

