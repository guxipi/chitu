# 赤兔 · Onboarding 访谈

目标:在**公司电脑本地**为用户建立 `~/.chitu/` 大脑,并通过简短访谈填充核心身份、风格与红线。
> 赤兔的大脑**只存本地、不同步、不与其他大脑或机器共享**(公司数据留本地)。

## 步骤

0. **自我介绍**:先把赤兔介绍给用户(谁做的、能在哪三方面帮他、大脑结构、接下来要几分钟选择题磨合)。语气友好、简短。用户说"好/开始"再继续。

1. **选大脑放哪(本地;选择题,别让用户敲命令行)**:
   - 用 **AskUserQuestion** 给两个选项:**本地默认 `~/.chitu`(推荐)** / **自定义本地路径**(想放某个盘,如 `D:\chitu-brain`,让他粘一个**本地**路径)。**不放同步盘 / 不进 git**——公司数据留本地。
   - 建大脑(跨平台):默认 → 无参数 `node "<赤兔根>/scripts/install-brain.js"`;自定义 → `node "<赤兔根>/scripts/install-brain.js" "<本地文件夹>/chitu-brain"`。
   - 输出 `CREATED\t...` → 已建好(位置写进指针 `~/.chitu-location`),继续访谈;`EXISTS\t...` → 已存在,直接进访谈补充;`ERROR\t...` → 念给用户。
   (脚本用 Node `fs.cpSync` 不依赖 `cp`/`ls`;无需环境变量。)

2. **访谈 —— 用选择题(务必用 AskUserQuestion 工具,不要开放式提问)**。
   分 2-3 批,每批 3-4 题,每题给 2-4 个选项(用户也可选 Other 自填)。能自动探测的先探测、别问:
   - 当前若在 Unity 项目里,先读 `ProjectSettings`/`Packages/manifest.json` 拿到 **Unity 版本、渲染管线、Input System、Addressables**(SessionStart 的探测逻辑已具备),这些就不要再问。
   - 操作系统用 `process.platform` 推断。

   参考选项(按需增减):
   - **目标帧率**:30 / 60 / 不锁帧
   - **渲染管线**(探测不到时才问):Built-in / URP / HDRP
   - **IDE**:Rider / Visual Studio / VS Code
   - **回复语言**:中文 / 英文 / 中英混(术语英文)
   - **回答结构**:先结论再过程 / 先过程再结论
   - **指错方式**:直接点出 / 先肯定再建议
   - **要不要 file:line 引用**:要 / 不用
   - **日志**:封装 Logger / Debug.Log / 看情况
   - **注释密度**:关键处即可 / 多 / 少
   - **测试习惯**:手测为主 / PlayMode / EditMode 单测
   - **团队/工程约束**(多选,公司项目尤其问):热更框架 / MVC-ECS 分层约定 / 别碰的底层模块(网络同步·反作弊·结算) / 美术-UI 序列化产物归属 / 别改第三方插件 / 别动构建配置 / 无额外(可 Other 自填)

   规则:能从默认模板或已答推断的就别重复问;Unity best practice 已内置 unity.md,不必逐条问。

3. **写入**:把答案分别填进
   - `~/.chitu/core/identity.md`
   - `~/.chitu/style/communication.md`、`style/coding.md`、`style/writing.md`
   - 新增红线追加到 `~/.chitu/core/hard-rules.md`(正向、具体、带 `**[sev:N]** IMPORTANT`)。
   - Unity best practice 已内置在 `style/unity.md`,无需重填。

4. **核对**:把填好的 `identity.md` 和 `hard-rules.md`(含团队协作红线)念给用户确认,有错当场改。

4.5 **免权限弹窗(选择题,征得同意再做)**:问用户"要不要让我免去以后每次跑脚本的权限弹窗?"
   - 同意 → 用 Edit 在用户设置 `~/.claude/settings.json` 的 `permissions.allow` 数组里加一条**窄规则**(只允许赤兔脚本,不是所有 node):
     `"Bash(node:*chitu*scripts*)"`
   - 文件不存在就创建 `{"permissions":{"allow":["Bash(node:*chitu*scripts*)"]}}`;已存在就只往 allow 追加这一条、别动其他。
   - 解释:这只放行"赤兔 scripts 目录下的 node 脚本",比放行全部 node 安全。

5. **收尾**:告诉用户——以后每开一个 Claude Code 会话,赤兔会自动注入这份简报、读你的 Unity 项目档案、写 .cs 时自动把关(含团队协作红线:push/merge 由你手动、复用优先、不越权破坏分层等);发现问题时说"赤兔 记一下…";要贴给其他 AI 时说"赤兔 简报"(也可打 `/chitu:chitu record` / `/chitu:chitu brief`)。
   大脑位置已记在指针文件 `~/.chitu-location`,是本机本地目录,不会同步出去。

## 原则
- 遵守用户已有的 hard-rules(尤其:不编造、不过度工程、只做被要求的事)。
- 访谈要轻,别让用户一次回答太多。能从默认模板带过的就别重复问。
