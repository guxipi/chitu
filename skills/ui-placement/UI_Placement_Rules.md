# UI Placement Method (位置法律的推导法)

> **这不是一套写死的数字**——每个项目的 UI kit 不同,数字必须**从你项目自己的 kit prefab 量出来**,不能凭眼睛猜。
> 本文给的是**可迁移的排布原则 + 怎么从你的 kit 推导出本项目的"位置法律"**,外加一张填表模板,量完填进去、以后照它摆(单一真源)。

## 0. 怎么定你的数字(核心方法)

- **真源 = 你项目 kit 的 prefab。** 摆一个元素时,照它在 kit demo prefab 里的 `sizeDelta` / anchor / 大小写(casing)来,**不要按眼睛重新缩放**。
- **参考画布:** 记下你项目 `CanvasScaler` 的 reference resolution 与 Match(如 1080×2340 Match 0.5 或 1440×2560 Match 0.5)。所有量出来的 px 都在这个坐标系里才有意义。
- **同时记比例(ratio):** 每个尺寸旁边记一个"占屏宽/高的百分比"。这样换分辨率、换画布时规则还能迁移(见 §5)。
- **notation:** `sd` = sizeDelta(w,h);anchor 用 preset 名;`aPos` = anchoredPosition;都从 live prefab 读。

## 1. 竖屏手游常见的五段脊柱(通用 pattern,数字自量)

大多数竖屏休闲手游主界面是这五段。这是**布局约定**,不是某套 kit 专属;每段的具体高度/anchor 从你的 kit 量:

| # | Band | 典型高度(占屏) | Anchor | 说明 |
|---|---|---|---|---|
| 1 | **顶部资源条** | ~5% | top-stretch, top-pin | 货币/能量 chip;边缘钉死,**绝不居中** |
| 2 | **主角 / feature 区** | ~30% | band1 下 top-pin | 角色立绘 + 浮动按钮 + banner |
| 3 | **内容 / 滚动区** | fill | 在 2 与 4 间 stretch | 列表/商店滚动 |
| 4 | **主行动按钮(hero CTA)** | ~8–11% | band5 上 bottom-pin | 一屏一个,落在拇指弧内 |
| 5 | **底部导航条** | ~7%(主导航)/ ~5%(子 tab+返回) | bottom-stretch, bottom-pin | 主 hub 用多图标导航;下钻页用"返回+子 tab" |

- Chrome 段(1、5)**边缘钉死,绝不居中**(top `aMin=(0,1)…` / bottom `aMin=(0,0)…`)。
- 不强求全局统一 tab bar:顶层 hub 与下钻页可用不同底栏,按屏的角色选。

## 2. 大小写法律(Casing follows ROLE —— 完全通用)

大小写跟**元素的角色**走,不跟 prefab 默认占位文字走(kit 的占位 "TEXT" 忽略掉):

| 元素 | Case |
|---|---|
| Hero CTA(大按钮 如 PLAY) | **UPPERCASE** |
| 选中/焦点 tab 标签 | **UPPERCASE** |
| HUD 工具按钮(如 AUTO) | **UPPERCASE** |
| 区块标题 / 屏幕标题 / 结算标题(SHOP/VICTORY) | **UPPERCASE** |
| Tag / badge 标签(BONUS) | **UPPERCASE** |
| 弹窗内行动按钮(Confirm/Continue) | **Title Case** |
| 浮动 / 导航 / 子 tab 标签(Friends/Daily) | **Title Case** |
| 物品 / 技能 / 玩家名(Dagger) | **Title Case** |
| 正文 / 描述 / 消息 | **Sentence case** |
| 数字 / 计时 / 货币(5/5, 2:45, 349,810) | **as-is** |

口诀:*吼*(hero CTA / 标题 / 结算 / tag)= UPPERCASE;*名字/命令*(弹窗按钮 / 导航 / 物品)= Title Case;*散文* = sentence case。

## 3. 按钮尺寸纪律

- **照你 kit 的按钮原生尺寸来**,别每屏重挑。圆钮常把直径写进 prefab 名(如 `*_Circle82` = 82px),是权威值。
- **最小可点** ≥ 你 kit 最小控件(手游一般 ~44–48dp);要更好点就**加大 hit area**,别把可视缩到这条线以下。
- 一组同类按钮用固定 spacing(从 kit 的 group 量)。

## 4. Anchoring(怎么钉,让它跨比例不飘 —— 通用)

| 元素 | Anchor preset |
|---|---|
| 资源条 / HUD 顶条 | top-stretch(`aMin=(0,1) aMax=(1,1)`) |
| 底栏 / 导航 | bottom-stretch(`aMin=(0,0) aMax=(1,0)`) |
| Hero CTA / 弹窗按钮 | center 或 bottom-pin(`aMin=aMax=(0.5,…)`) |
| 浮动按钮 | corner-pin(`aMin=aMax=(0,1)` 或 `(1,1)`) |
| Toast | mid-stretch(`aMin=(0,0.5) aMax=(1,0.5)`) |
| 网格 / 滚动内容 | top-stretch content, pivot top |

每个元素照它该待的屏幕边/角选 preset,别用算出来的 anchoredPosition 硬摆。

## 5. 多分辨率

- **画布单位宽度在更高的手机上会缩小**(reference + Match 0.5 时):越窄的比例(21:9)可用宽度越小。边缘钉死的一排提交前先算:整排可视跨度(内容 + 溢出,× scale)要能塞进**最窄**的宽度而不撞到另一侧内容。
- 选一个基准比例,沿单轴扩展;用几个竖屏比例(9:16、9:19.5、平板 3:4)截图核。
- 记比例(§0)就是为了这里能换算。

## 6. Hard rules(排布铁律)

1. **照你 kit prefab 的 size/anchor/casing**——kit 是标准,别眼估/别重缩。
2. 从**五段脊柱**(§1)搭;chrome 边缘钉死,绝不居中。
3. **一屏一个 hero CTA**,band4,UPPERCASE。
4. **大小写跟角色**(§2):吼=CAPS,名=Title,散文=sentence。
5. 网格/列表复用固定 cell 规格,别每屏重挑;banner 满内容宽、精选置顶;一卡一角标。
6. **判"done"前:数值 worldPos 在屏内 + 一张 Play 截图**(见 `ui-placement` 主 skill),别只信 flow 测试。

---

## 7. 本项目实测填表(量完填这里 = 你项目的位置法律)

> 第一次做 UI 时,从项目 kit 的 demo prefab 量出下面这些,填进来;之后照此摆、改了同步更新**本文件**(别改各屏 mockup)。

- **Canvas 参考:** reference `____×____`,Match `____`
- **五段高度(px / 占屏%):** 顶条 `__` · 主角区 `__` · 内容 fill · hero CTA `__` · 底栏 `__`
- **按钮原生尺寸:** hero CTA `__×__` · 标准 CTA `__×__` · 小/inline `__×__` · 弹窗按钮 `__×__` · 图标钮 `__×__` · 关闭/返回 `__×__`
- **最小可点:** `__`
- **字号:** hero CTA `__` · 标题 `__` · 顶栏标题 `__` · 按钮 `__` · 正文 `__` · 数字 `__`
- **网格 cell:** 掉落/奖励 `__×__` spacing `__` · 背包 `__×__` · 展示卡 `__×__`
- **弹窗:** 宽 ≈ 屏 `__%`,居中;关闭(X)右上内缩 `__`;主按钮底部居中
