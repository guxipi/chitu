# 赤兔 更新记录 Changelog

> 精选高亮日志(非逐版本穷举)。最新在上。

### v0.1.2 — 2026-07-06 反 AI 撒谎三件套(诚实性机制化)+ 版本号重置
- **版本号重置**:此前沿用翼德 fork 时的 0.5x 序列,自本版起赤兔按自己的节奏从 0.1.x 计。已装 0.52.0 的机器升级后 SessionStart 走"大脑戳领先→只打戳"分支跳过 migrate,本版改动全在插件侧脚本,拉新即生效,无大脑迁移需求。
- **背景**:AI 执行时会假装接通服务端、写欺骗性注释("// simulate for now")、catch 吞错伪装成功;prompt 红线拦不住训练出的完成压力,把验收信道从"模型自述"切到"运行时证据"。移植自翼德 v0.54.0,逻辑一字不动,品牌换赤兔。
- **① executor 证据契约**(`agents/executor.md`):汇报固定四段(结论/改动清单/验收逐条带输出原文/偏离与欠账)+ 诚实契约(UNVERIFIED/BLOCKED 是合格出口,伪造成功是最高违规)。
- **② honesty lint**(`lint-unity.js`,PostToolUse):`honesty-fake-comment` + `honesty-swallowed-catch` 两条欺骗指纹规则,`always:true` 不受 expertLevel 过滤,test/mock/coplaytemp 路径跳过防误报。
- **③ Stop/SubagentStop 收尾审计**(`scripts/stop-audit.js` 新建 + hooks.json 注册):最终汇报含完成/通过声明但通篇零验证工具调用 → block 一次质询;`(?<!un)verified` 放过合规 UNVERIFIED 标注,`stop_hook_active` 防死循环,异常一律静默放行。
- 测试 51→64 全绿。

### v0.52.0 — 2026-07-04 提速但不降质
让套着赤兔的 Claude Code 在不损害把关质量的前提下更快完成任务。

- **PowerShell 只读自动放行**:`pre-tool-use.js` 新增 `isSafePwsh`——只读/导航 cmdlet 与别名(`Get-ChildItem`/`Get-Content`/`Test-Path`/`ls`/`cat`…)、PS 下 `git`/`adb` 查询免审批,治"每条只读 PS 命令都要人工点一下"。安全模型同 Bash:`>` 重定向 / `$()` 子表达式 / `{}` scriptblock / 反引号 / `iex`·`Invoke-Expression`·`Invoke-Command` 一票否决,段首 `&`/`.`(call/dot-source)拒,拿不准就 defer;deny 硬拦截仍先行。默认白名单可被 `.meta/allow-rules.json` 覆盖(`psSafe` 键)。git/adb 子命令校验抽成共用函数,Bash/PS 复用。
- **两个提速子代理**(插件根 `agents/`,自动发现):`executor`(执行者,派边界清晰的自包含活:照 spec 写代码/批量改文件/跑测试修编译错/机械重构;继承主循环模型)、`scout`(调研兵,只读 `disallowedTools: Write/Edit/NotebookEdit`,多个并行扫代码找答案、回报带 file:line、API 结论标注"主循环需复核源码")。
- **charter 加第 7 条"速度纪律"**(不牺牲质量走最快路径):并行发独立读/查、机械活派 executor、批量搜索派多个 scout;按事切量(琐碎改动不走仪式);不重复劳动(不回读刚写的文件、不重验已验证事实、小改动攒批验一次);不原地打转(同招失败两次换思路或摊给勾哥)。charter 由 `resolve` 直接读插件模板,插件更新即对所有老用户生效(无需手动加或 migrate)。
- **doctor 加两条提速提示**:Opus 用户交互开发开 `/fast`(无持久化键,每会话手动);大批机械改动可临时切 Sonnet(`/model` 或 settings.json `"model"` 键)干完切回。`SLASH_COMMAND_TOOL_CHAR_BUDGET` 检查此前已有。
- **常驻注入瘦身**:压 `hard-rules.md`/`charter.md` 措辞(不删规则、不丢限定语义、`(防…)` 键原样保留),模板基线 1460 → 1445 tokens(第 7 条"速度纪律"新增约 300 字,吃掉大部分压缩空间;继续压需动语义或 dedup 键,止于无损)。
- 自检 `node test/run.js` 全绿(新增 `isSafePwsh` 放行/拒绝用例 + 子代理存在性用例);`audit-injection`、`validate-skills` 通过。

### v0.51.0 — 2026-07-04 从翼德架构 fork 为公司版赤兔
赤兔复用翼德成熟的上下文中枢 + Unity 把关引擎(SessionStart 简报、PreToolUse 硬拦截 + 自动放行、PostToolUse 把关、教训库、记忆整理、doctor 体检、resolve/migrate 更新闭环、角色镜头、mockup/plan/qa/playtest 等动作),并做公司团队场景的客制化:

- **去个人化**:移除翼德个人人格、gamification 引擎(进度打卡/连斩彩蛋:`progress.js` + `zhanji` 动作)、原项目专属注入层与专有语言/彩蛋措辞。
- **团队协作红线(新增 8 条)**:在 6 条默认工程红线上加 —— git 只可 commit(保留 Co-Author 透明标记)、`push`/`merge`/建远端分支绝对禁(由勾哥手动合入);复用优先不造轮子;不越权破坏 MVC/ECS 与热更边界;不擅动底层网络同步/反作弊/结算;移动端热路径 GC 纪律;不重写协作序列化产物(.prefab/.unity/.asset);核心脚本不外传外部云(数据本地化);交可审的活 + 交接上下文外化。
- **push/merge 机制化硬拦截**:发货 `hook-rules.json` 预置 `git push`/`git merge` 的 PreToolUse deny(数据驱动,commit 不拦);留公司可扩展槽(secret 明文 / 核心目录外传 / 序列化写守卫,不预置公司专有路径)。
- **团队协作心智**:charter 加"团队协作视角"(下游意识:QA 出包/美术节点/热更边界/reviewer)。
- **大脑本地化**:赤兔大脑只存公司电脑本地、不同步、不 clone 远端、不与其他大脑共享;`install-brain` 去掉 git-clone/同步盘认领,onboard/doctor 去掉同步 nudge。
- **skills**:保留 8 个项目无关 method/tool skill(feature-development、playmode-verify-iterate、unstuck-playbook、ui-placement、cloud-code-deploy、todo-to-planyway、figma-ugui-bridge、server-service-pattern);剪掉 8 个原项目专属 content/art skill(arena boss/minion、campaign 地图、planet dressing、gaoguang-3d、tripo、vfx、ui-visual)。
- 自检套件 `node test/run.js` 全绿(含新增 push/merge 硬拦截用例);`validate-skills`、`audit-injection` 通过。
