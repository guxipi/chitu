---
name: ui-placement
description: Placing, aligning, restyling, or building Unity uGUI UI — RectTransform layout, anchors, panels, HUD, popups, tabs, item slots, multi-resolution / safe-area fitting. Trigger — "摆一下UI" / "摆UI" / "摆一下界面" / "摆界面" / "调一下界面" / "做个界面" / "改UI" / "弄个面板/弹窗/HUD" / 涉及 UI、界面、面板、暂停界面、掉落/奖励格子、item slot、安全区、对齐 的任何摆放任务. Coplay/Unity-MCP capture tools are BLIND to screen-space UI — verify via an in-Play ScreenCapture PNG + numeric geometry. Invoke BEFORE touching any .unity/.prefab UI or UI layout code.
---

# UI Placement

uGUI 摆位 / 对齐 / 搭建的**执行工作流 + 纪律**。数值真源是你项目自己的 UI kit 与设计文档;本 skill 不重新定规范,只讲**怎么落地、怎么验、别踩哪些坑**。位置法律的推导法与填表模板见同目录 `UI_Placement_Rules.md`。

## Source of truth — 读,别重复造
- **你项目的 UI kit prefab** = 尺寸/anchor/casing 的真源。摆元素时照 kit prefab 自己的值来,别眼估、别重缩(法律与量法见 `UI_Placement_Rules.md`)。
- **你项目的 UI 设计文档**(tokens / 8px grid / 色板 / 字阶 / 安全区 / 竖屏分区 / 动效时序 / 组件选型矩阵 / 各屏 layout)——有就读、以它为准,没有就先跟 kit 对齐并记一条待补。
- **记下项目约定**:`CanvasScaler` reference 与 Match、字体、canvas layer 管理器的层级顺序——一次查清,写进项目记忆或 `UI_Placement_Rules.md` 的填表区。

## 先从 YAML 诊断(只读,最快定位)
手编 `.prefab`/`.unity` 仍禁止——但**用 Grep/Read 读它们是最快的定位通道**:很多 layout bug 在碰 Unity 之前就能从 prefab 文本里完全钉死(如某排 item 被挤=容器左锚点 + 非均匀 scale + LayoutGroup spacing 太小,读文本即知)。
- 按 fileID 走树:RectTransform 上的 `m_Children`/`m_Father`;读 anchors/pivot/`m_LocalScale`/`m_SizeDelta` 加 LayoutGroup 块(`m_Spacing`、`m_ChildAlignment`、`m_ChildControl*`)。
- 嵌套 prefab 是 `PrefabInstance` 块——per-instance 的 size/active override 藏在它的 `m_Modifications`(如隐藏的"+"按钮 = 某子 fileID 上 `m_IsActive 0`)。
- **改 prefab 前,先 grep 场景里有没有 `target: {fileID: <该 RT fileID>, guid: <prefab guid>`**——场景 override 同属性会盖掉你的 prefab 改动。无命中 = prefab 改动会生效。

## 看结果 — MCP 的 capture 工具对屏幕空间 UI 是瞎的
`capture_ui_canvas` / `capture_scene_object` 走离屏相机/RT 渲染,**照不到 Screen Space(Overlay & Camera)canvas → 黑/灰图**。别靠它们验 UI。改用:

**A. 看像素 = 从游戏循环里调 `ScreenCapture.CaptureScreenshot` → `Read` 那张 PNG。**
- 抓的是最终合成帧(所有 UI 层)落盘,bridge 独立(Play 时 MCP 断了也读得到)。
- **只有从游戏循环(Play 中的 MonoBehaviour)调才写盘**——从 `execute_script`(editor 上下文)调静默不写;也需要真渲了一帧(Boot/loading 里不写)。
- 建议给项目加一个 Dev-only 的截图组件(按个键 → `ScreenCapture.CaptureScreenshot("shot.png")`),把 UI 摆上屏 → 触发 → `Read` 最新 PNG。这就是**可视通道**。

**A2. Screen Space - Camera canvas 可不靠上面那条、直接截**:Play 中从 `execute_script` 把该 canvas 的真实相机渲到 RenderTexture——`cam = rootCanvas.worldCamera; cam.targetTexture = rt; cam.Render(); ReadPixels → File.WriteAllBytes`。editor 上下文也能用;只有 Overlay canvas 必须走上面的游戏循环截图。注意:execute_script 动态编译加进去的 MonoBehaviour 不会被调 `Update()`——检查/截图要**同步**做,别指望 spawn 出来的 helper 组件跑起来。

**B. 数值核几何/状态 = Play 中 `execute_script` 读真值。**
- 读 ground truth:`Time.timeScale`、widget 标志、`CanvasGroup.alpha/blocksRaycasts`、每个关键元素的 `RectTransform.position`(world)。
- **在屏测试**:显示的元素须满足 `0 < screenPos.x < Screen.width` 且 `0 < screenPos.y < Screen.height`。跑偏出右边的元素正是 flow/timeScale 测试**抓不到**的那类 bug。**Camera-mode canvas 用世界单位 ≠ 像素**——先用 `RectTransformUtility.WorldToScreenPoint(canvas.worldCamera, corner)` 转角点,再 bounds-test。
- 截不了图时这条是决定性的。**判"fixed"前必做**;flow 测试(timeScale 开关)过了**不代表**面板渲染正确。
- 行/网格:dump 每个子的 `GetWorldCorners` → `WorldToScreenPoint`,断言**等间距 + 目标边距**——数值 pass/fail 胜过盯 PNG。

## 改动走 `execute_script`(最稳),别用 20 个碎 MCP 调用
超出单属性微调的,写个 C# 文件用 `execute_script` 跑——原子、可复现,能搞定碎调用会搞砸的事。**入口契约:一个带 `public static Execute()` 方法的类**(Coplay 只找这个方法名,别的名 → "no entry point");文件走 `filePath` 参数传。
- **稳地找对象**:`FindObjectOfType(type)`(只 ACTIVE)或走 `SceneManager.GetActiveScene().GetRootGameObjects()`(含 INACTIVE 根)。`GameObject.Find(path)` 对 inactive/错路径会失败——隐藏面板别信它。
- **解析游戏类型**:循环 `AppDomain.CurrentDomain.GetAssemblies()` + `asm.GetType("Namespace.Type")`——别假设都在 `Assembly-CSharp`。
- **接 `[SerializeField]` 私有字段**:`var so = new SerializedObject(comp); so.FindProperty("_field").objectReferenceValue = target; so.ApplyModifiedPropertiesWithoutUndo();`。
- **Prefab 改**:简单属性(float/bool)用 MCP `set_property` + `prefab_path`;`PrefabUtility.ApplyObjectOverride(comp, prefabPath, InteractionMode.AutomatedAction)` 把实例组件值压回 prefab。结构性/多属性改的稳妥法:`LoadPrefabContents(path)` → 改 → `SaveAsPrefabAsset(root, path)` → `finally` 里 `UnloadPrefabContents`(prefab 内含嵌套 prefab 实例也安全;"Can't save a Prefab instance" 那个报错来自传了场景实例,不是 loaded contents)。存完再 `Read` 磁盘上的 `.prefab` 确认落盘。
- 一次性探针 `.cs` 放**项目根 `Temp/`**(别放 Assets 下——免 domain reload),跑完删;要留作工具的 builder → `Assets/Editor/CoplayTemp/`。

## RectTransform — 咬过人的坑
- **绝不给 stretch RectTransform 设 `localPosition`。** 它会污染 `anchoredPosition`、把整棵子树推出屏(曾把暂停面板顶到右上角、CONTINUE 按钮跑出屏)。要填满父级:`anchorMin=(0,0); anchorMax=(1,1); pivot=(0.5,0.5); offsetMin=offsetMax=Vector2.zero;`——localPosition 别碰。
- **面板默认发货即隐藏**:序列化 `CanvasGroup` alpha=0、interactable=false、blocksRaycasts=false。别**只**靠运行时 `HideImmediate`——它跑之前的任一帧(或某次没跑)就会漏面板到屏上。
- **重父级只在新父 rect 匹配时保住世界布局。** 把根挪进某层后,重置为填满(见上)并确认子的 worldPos 在屏内。
- "active" ≠ "可见/正确"——确认 worldPos 在屏幕范围内,不只是 GameObject 是 active。

## Anchors & layout — 用结构化操作,别手算
- **居中 / 贴边**:用 anchor preset,不是算出来的 anchoredPosition。
- **行 / 网格 / 列表**:`Horizontal/Vertical/GridLayoutGroup` + `ContentSizeFitter`。静态布局优先固定 RectTransform(Layout Group 会在子变化时 rebuild);动态内容才用 group。
- **单帧 layout 抖动**(嵌套 Group/ContentSizeFitter 在你读/截的那帧还没 settle,尤其填完列表或 `SetActive(true)` 后):别信"下一帧会自己好"——内容变化后立刻 `LayoutRebuilder.ForceRebuildLayoutImmediate(rectTransform)` 确定性强推。这就是"截图里错、回放却对"的解药(那是没 settle 的 rebuild,不是 flake)。
- **每个元素锚到它自己的屏幕角/边**,跨比例才不飘。
- **"Edit Mode 里好、每次运行又挤回去"** = 有人在 LayoutGroup 里手拖了子;拖出来的位置是序列化的谎,下次 rebuild(Play 必 rebuild)就弹回 group 配置。修**GROUP**(spacing/alignment/容器 anchor),别再拖它的子。
- **溢出的子视觉会破坏 LayoutGroup 的 spacing 数学。** 锚在 rect 边缘的 icon/按钮常戳出 rect 外(icon 锚 x=0 居中在边上 → 约半个宽度往左溢;"+" 按钮锚 x=1 → 半个往右溢)。Layout Group 只看 rect 宽,真正的碰撞线是 `spacing ≥ 前者右溢 + 后者左溢 + 可见间距`——从 prefab YAML 量溢出量,别眼估。
- **贴边行配方**(如右边缘的货币行):容器 `anchorMin=anchorMax=(1, y)`、`pivot.x=1`、`anchoredPosition.x = −margin`、HLG `childAlignment=MiddleRight`——每个比例都贴边,不用算 x。
- **UI 容器上非均匀 `localScale`(如 0.6 / 0.6225)= 手调的味道**——细微变形;顺手归一到均匀。
- Coplay 工具(简单操作用):`set_rect_transform`、`set_ui_layout`、`set_property`、`create_ui_element`、`set_ui_text`、`set_sibling_index`、`add_component`、`parent_game_object`。

## 接线行为 — 跟你项目已有的 event/mediator 约定,别自己发明 MVVM
先摸清项目已有的解耦 pattern(**UI 靠事件反映状态;UI 不轮询游戏逻辑去推更新,游戏逻辑也不伸手进 UI**),照它做,别手搓一层新 binding。
- **订阅,别轮询。** widget 监听事件、在 handler 里刷自己。来源优先级:拥有它的 **service 自己的事件** → 再到**全局事件总线**。
- **订阅/退订成对。** 在 `Start`/`OnEnable` 订阅,**`OnDestroy` 里必 `-=`**(`transform.DOKill()` / tween `.Kill()` 也在那)。destroyed widget 上的泄漏监听 = "改了 A、B 坏了"那类 bug。
- **异步生成的依赖**:service/单例在你 `Start` 跑时可能还不存在。晚绑定:每帧试订阅直到解析到,别在 `Start` 缓存后就假设它在。
- **子面板通过面板根 mediator 说话,不直接找彼此。** 子面板向上抛意图事件,根路由给 service 并编排 show/hide。别让子面板伸手进兄弟或 service。
- **唯一被认可的"轮询"**:从单一真源自愈的门(如按 `Time.timeScale` 使能按钮)。那是刻意的,别拿它当通用状态同步抄。

## Play Mode 现实
- 按 Play 通常从项目的 **Boot/启动场景**进,不直接进某个玩法状态——摸清你项目的启动流程;某场景的 widget 在你真进那个场景/状态前是缺席/inactive 的。
- **改完立刻存场景**——没存的改动会在 Play 载入别的场景时被冲掉。
- 改 `.cs` 触发 domain reload——在 Edit Mode 做。用户随时可能进 Play:`open_scene` 前先查 `get_unity_editor_state.playMode`(Play 中它会报错)。
- Play Mode 用来**看/验(只读)**;Play 里做的摆位改动会被丢弃。(Prefab **资产**改动持久——但也在 Edit Mode 做,再进 Play 验。)
- **把"操作"和"测量"拆到不同 `execute_script` 调用**(如调用1切 tab、调用2 截图+测量):调用间有帧过去,layout 自然 settle,每个脚本保持纯同步。
- **驱动真流程,别 SetActive**:通过项目的导航管理器切到目标屏;有弹窗(每日登录等)挡住你的截图 → 找它真的关闭按钮 `onClick.Invoke()`。

## 多分辨率
- 记下项目约定:`CanvasScaler` = Scale With Screen Size、reference resolution、Match(竖屏常 ≈ 0.5,有些 canvas 用 0——逐 canvas 确认)。
- 选一个基准比例,沿单轴扩展;用几个竖屏比例(9:16、9:19.5、平板 3:4)截图核。
- **画布单位宽度在更高的手机上会缩小**(reference + Match 0.5 时)。提交贴边行前先算:整排可视跨度(内容 + 溢出,× scale)要能塞进**最窄**的宽度而不撞另一侧内容——9:16 塞得下的可能在 21:9 撞车。

## 安全区(刘海 / 挖孔 / 手势条)
- 别硬编码像素偏移。用一个由 `Screen.safeArea` 驱动的 SafeArea 组件(`[ExecuteAlways]`)。canvas 下加一个全屏 SafeArea 子物体,把屏幕 UI 挂它下面;关闭/返回按钮 + tab bar 放里面。纵向 conform = 顶刘海 + 底手势条;横向 conform = 曲面/横屏才要。缩进到设备**实际**安全区(设计稿的 44/34 是设计 padding,另算)。逐层包裹(HUD/Overlay/Main 各自一个 SafeArea 容器);Background 全出血、别缩进。

## Juice = 美术,不是生成代码
gradient / metallic / glow 来自 kit 的 9-slice 精灵,不是代码画的(uGUI 没原生 box-shadow / gradient)。你管:layout、层级、state swap(normal/pressed/disabled)、DOTween 动效。效果精灵从项目 kit 里拿。

## 间距 & tokens
按项目的 8px 尺度(xs4 / sm8 / md16 / lg24 / xl32 / 2xl48)+ 文档的色板/字阶。不留手捏的间隙。等距用 Layout Group。

## Hard rules(始终)
- 竖屏 · Edit Mode 里摆 · **改完立刻存场景** · 不文本编辑 `.unity`/`.prefab`(用 execute_script / MCP)· **判"fixed"前:数值 worldPos 在屏内 或 一张 Play 截图 PNG——绝不信 MCP 的 capture 工具或只跑 flow 的测试。**
