# 赤兔 更新记录 Changelog

> 精选高亮日志(非逐版本穷举)。最新在上。

### v0.51.0 — 2026-07-04 从翼德架构 fork 为公司版赤兔
赤兔复用翼德成熟的上下文中枢 + Unity 把关引擎(SessionStart 简报、PreToolUse 硬拦截 + 自动放行、PostToolUse 把关、教训库、记忆整理、doctor 体检、resolve/migrate 更新闭环、角色镜头、mockup/plan/qa/playtest 等动作),并做公司团队场景的客制化:

- **去个人化**:移除翼德个人人格、gamification 引擎(进度打卡/连斩彩蛋:`progress.js` + `zhanji` 动作)、原项目专属注入层与专有语言/彩蛋措辞。
- **团队协作红线(新增 8 条)**:在 6 条默认工程红线上加 —— git 只可 commit(保留 Co-Author 透明标记)、`push`/`merge`/建远端分支绝对禁(由勾哥手动合入);复用优先不造轮子;不越权破坏 MVC/ECS 与热更边界;不擅动底层网络同步/反作弊/结算;移动端热路径 GC 纪律;不重写协作序列化产物(.prefab/.unity/.asset);核心脚本不外传外部云(数据本地化);交可审的活 + 交接上下文外化。
- **push/merge 机制化硬拦截**:发货 `hook-rules.json` 预置 `git push`/`git merge` 的 PreToolUse deny(数据驱动,commit 不拦);留公司可扩展槽(secret 明文 / 核心目录外传 / 序列化写守卫,不预置公司专有路径)。
- **团队协作心智**:charter 加"团队协作视角"(下游意识:QA 出包/美术节点/热更边界/reviewer)。
- **大脑本地化**:赤兔大脑只存公司电脑本地、不同步、不 clone 远端、不与其他大脑共享;`install-brain` 去掉 git-clone/同步盘认领,onboard/doctor 去掉同步 nudge。
- **skills**:保留 8 个项目无关 method/tool skill(feature-development、playmode-verify-iterate、unstuck-playbook、ui-placement、cloud-code-deploy、todo-to-planyway、figma-ugui-bridge、server-service-pattern);剪掉 8 个原项目专属 content/art skill(arena boss/minion、campaign 地图、planet dressing、gaoguang-3d、tripo、vfx、ui-visual)。
- 自检套件 `node test/run.js` 全绿(含新增 push/merge 硬拦截用例);`validate-skills`、`audit-injection` 通过。
