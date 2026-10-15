# 赤兔 更新记录 Changelog

> 精选高亮日志(非逐版本穷举)。最新在上。

### v0.1.6 — 2026-10-15 会话按主要目标命名

会话标题从固定的"🐎 赤兔已就位 · 日期"改成"<目标名>_🐎 赤兔已就位 · 日期",底标和日期原样保留(新增 scripts/session-title.js)。首句先从 prompt 粗取一个名字,同时提醒模型按主要目标起 2-8 字正式名并跑 `session-title.js set`,下一句生效(Claude Code 只在 SessionStart / UserPromptSubmit 认 sessionTitle)。SessionStart 现在读 hook 输入里的 session_id;resume / compact 不再把标题打回当天日期。状态落 ~/.chitu-local/session-titles.json。

### v0.1.5 — 2026-09-02 收掉 v0.1.4 自己埋的漏判,并给"路径写错"这类问题上测试

对 v0.1.4 做对抗审计时抓出的问题,主要是上一版的自伤:

- **conflict-scan 的"本地大脑就跳过"是个坏设计,拆了**。它靠目录名白名单判大脑在不在同步盘,判错就整轮不扫:junction/symlink 挂进 Drive(path.resolve 不解 reparse point)、`Dropbox (Acme Corp)`、`OneDrive - Contoso` 全都漏——而这些恰恰是最会产生冲突副本的多机/多人场景。改成**永远真扫**,"在不在同步盘"只用来决定措辞;白名单顺带补了 realpath 与段前缀匹配(团队版/租户版/我的云端硬盘)。空转那点开销换不来漏判的风险。
- **结果分两级**:带客户端标记的、以及 `name (N).ext` 且原件还在的 → `CONFLICTS`,请裁决;`name (N).ext` 但原件已不在 → `SUSPECT`,只在同步盘大脑里提一句(本地大脑的"想法 (2).md"就是正常笔记)。这样既不像 v0.1.3 之前那样误报,也不会像 v0.1.4 那样把变成孤儿的真副本永久漏掉。
- **删掉 `/\bconflict\b/i`**:它不是任何客户端打的标记,却会把 `L-0031-merge-conflict.md` 这种正常教训报成事故、催勾哥删。改成只认 `conflicted copy` / `的冲突副本` / 括号里带 conflict 的形态。
- **整目录被复制也报**:Drive 会整个复制出 `lessons (conflicted copy)/`,以前只看文件名,这种静默双份从来没人管。

- **新测试 3.6b:文档里指向插件自身的路径必须真的存在**,启动器(.bat/.vbs)引用的同目录脚本也一样。语音那个错名撑过了三个版本、64 个绿测试都没拦住——现在把 `yide_voice.py` 改回去,测试立刻变红。1.5 也补上了同步盘识别的**正向**用例(上一版只测了否定方向,所以两个漏判 bug 照样全绿)。

- **清掉最后几处路径漏网**:`templates/brain/style/unity.md`(它是发货文件,每次升级都会刷进每个用户的大脑)、`android/SETUP.md` 的 `templates/qa/EvidenceCapture.cs`、`unity-smartmerge/SETUP.md` 里指错对象的 `templates/brain/style/unity.md`(用户该看的是自己大脑里的 `~/.chitu/style/unity.md`)、voice SETUP 的三条命令。
- **占位符统一成 `<赤兔根>`**:v0.1.4 在 SETUP.md 里新造的 `<插件目录>` 是第二套写法,并入前者,首次出现处括注"= 赤兔插件所在文件夹"。
- **`chitu-voice-silent.vbs` 改成转调 `chitu-voice.bat`**:原来它直接 `python chitu_voice.py`,把 .bat 里设的 `CHITU_VOICE_*` 默认值全丢了;SETUP §7 也改成推荐它,不再让人另配 pythonw + 计划任务。
- **consolidate 步骤 1 的自相矛盾**:一边让模型报"随手记压了 N 条",一边禁止它读 inbox。改成直接引用简报里已有的那个数;巡检说明也跟上新行为(`CLEAN` 是常态,`SUSPECT` 别当事故)。

测试 65 全绿(新增 3.6b)。

### v0.1.4 — 2026-09-02 清掉 fork 遗留的路径坑 + consolidate 的空转与越界

接着 v0.1.3 往下扫,五处都是同一类毛病:文档写的路径,模型或勾哥照着跑会扑空。

- **语音启动器双击必炸**:fork 时改了文件内容没改文件名——磁盘上还是 `yide_voice.py` / `yide-voice.bat` / `yide-voice-silent.vbs`,而 .bat、.vbs 和全部文档引用的都是 `chitu_voice.py`。三个文件改名归位,`voice.md` 的启动/自检命令与 SETUP 引用改成 `<赤兔根>` 绝对路径。
- **`node scripts/guid-find.js` 裸相对路径**:`actions/ui.md` 和 `skills/unstuck-playbook/SKILL.md` 各一份,在业务工程 cwd 下必然 Cannot find module。改成 `<赤兔根>` 绝对路径。(注意 skill 里的 `${CLAUDE_SKILL_DIR}` 指的是 skill 自己的目录、不是插件根,所以这里只能用 `<赤兔根>`。)
- **conflict-scan 在赤兔上纯空转、还会误报**:赤兔大脑本来就在本机本地,同步盘副本不可能存在,却每次 consolidate 都扫一遍;`name (N).ext` 那条正则更会把"想法 (2).md"这种正常笔记当成冲突。现在 CLI 先判大脑在不在同步盘(复用 detect-sync 的候选根),不在就打一行 `SKIP` 走人(`--force` 可强扫);数字副本要**同目录原件还在**才算副本。测试同步更新。
- **`lessons/archive/` 没人创建**:consolidate 步骤 7 让把归档挪过去,可模板里根本没这层。模板补 `lessons/archive/README.md`(git 不跟踪空目录),老大脑升级时 migrate 会自动补上;步骤 7 也补一句"目录不在就先建"。
- **consolidate 和 note 抢同一批笔记**:v0.1.3 把步骤 1 的 inbox 路径改对之后,consolidate 会读 `notes/inbox/` 却从不处置,而 note 动作整理完是要把原件移进 `_done/` 的——两边重复消费,"随手记有 N 条"还永远清不了零。现在划清:inbox 归 note,consolidate 只瞄一眼积压、提醒去跑 note。

顺手清同类:`plan.md` 跨动作跳转、各处 `见 integrations/*/SETUP.md`、`playtest.md` 的 `templates/qa/*.cs` 等 11 处面向模型的相对路径统一加 `<赤兔根>/`;7 份 SETUP.md 与 doctor.js 输出里给人看的相对路径标明"插件目录"。测试 64 全绿。

### v0.1.3 — 2026-09-02 修 consolidate 路径三连(每次会话都报"整理有问题"的根因)

症状:公司机器上赤兔几乎每次会话都说 consolidate 有问题。三个成因叠在一起:

- **① 注入只给相对路径**:SessionStart 的整理提醒写 `读 actions/consolidate.md`,而模型 cwd 是业务 Unity 工程,整份注入里一个绝对路径都没有 → 找不到动作文件。(翼德 0.57 因为 scope 契约那行带了绝对路径,侥幸没暴露。)现加 `ACT()`,整理 / 随手记 / 更新裁决三处提醒一律给完整绝对路径,简报开头也报一行插件根。
- **② `${CLAUDE_SKILL_DIR}` 不是环境变量**:Claude Code 只在 skill 模式下对 SKILL.md 正文做文本替换;动作文件是模型用 Read 读进来的,占位符原样保留,丢进 Bash 展开成空 → `Cannot find module 'F:\Apps\Git\scripts\stamp-consolidate.js'`。步骤 8 打不上戳 = 24h 判定永远到期 = 每次会话都催,正是本次报障的直接来源。actions/*.md 的 20 处统一换成字面占位符 `<赤兔根>`(SKILL.md 保留真占位符,并新增一句把两者对应起来)。
- **③ inbox 路径写错**:consolidate 步骤 1 读 `.meta/inbox/`,真实位置是 `notes/inbox/`(note 动作与 SessionStart 计数都用后者)。同一处错在 `templates/brain/README.md` 的目录树里也有,一并改。

- **注入路径统一正斜杠**:Windows 反斜杠替进 `node -e "require('<赤兔根>/scripts/lib.js')"` 会被 JS 当无效转义吃掉(mockup / storyboard 的"自动弹给勾哥看"必炸),故 `PLUGIN_ROOT` 先 `path.resolve` 再转正斜杠输出;playtest 的裸命令补引号(插件路径含空格会断)。
- 测试 64 全绿。实跑验证:三条 consolidate 命令按绝对路径全通、时间戳落盘后重开会话不再催、update 裁决分支注入也给绝对路径。常驻注入 1470 → 1512 tokens(本就超软预算,见 audit-injection)。

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
