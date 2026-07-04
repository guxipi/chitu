# 赤兔 · 随手记(capture)

让勾哥随时记想法/笔记/随想,赤兔按**时间 / 主题 / 项目**归类,日后可查。
数据在大脑里 `~/.chitu/notes/`:`inbox/`(待整理)、`<YYYY>/`(按年归档)、`index.md`(主题/项目索引)。

三种用法(看 `$ARGUMENTS`):

## A. 直接录入(他在对话里说"记笔记 …/想法 …")
- 把内容写成一条带 frontmatter 的笔记:`~/.chitu/notes/<YYYY>/<YYYY-MM-DD>-<短标题>.md`
  ```
  ---
  created: 2026-05-31T14:20
  topic: <你判断的主题>
  project: <相关项目或 none>
  tags: [..]
  source: chat
  ---
  <原文 + 必要的一句澄清>
  ```
- 在 `notes/index.md` 加一行索引。简短确认。

## B. 整理 inbox(扔进来的原始笔记)
> 笔记怎么进来(赤兔大脑本地,默认直接落本地 inbox):
> - **本地(默认)**:直接往 `~/.chitu/notes/inbox/` 丢 `.md`/`.txt`。
> - **可选手机通道**:若勾哥另配了外部 inbox(如 Telegram bot / 某个中转文件夹,见 `integrations/telegram/SETUP.md`),路径存指针 `~/.chitu-inbox-location`;不用就忽略。
1. **(若配了外部 inbox)先搬进大脑**:读 `~/.chitu-inbox-location` 拿路径 → 把里面 `.md`/`.txt` 搬进 `~/.chitu/notes/inbox/`,搬完在源侧移到 `_pulled/`(避免重复搬)。没指针 / 不可达 → 跳过,只理已在 inbox 的。
2. 读 `~/.chitu/notes/inbox/` 下所有文件。
3. 每条:判断主题、关联项目、抽 tags、定时间(文件时间或内容里的日期)。
4. 归档到 `~/.chitu/notes/<YYYY>/`,写好 frontmatter;更新 `notes/index.md`(按主题/项目分组)。
5. 处理完把原始件移到 `notes/inbox/_done/`(软删,保留),报告"整理了 N 条,涉及主题/项目 …"。
   (赤兔大脑本地落盘,无需同步收尾。)

## C. 查询("问赤兔:关于 X 我记过什么")
- 在 `~/.chitu/notes/` 里按关键词/主题/项目/时间检索(grep/读 index),把相关笔记汇总回答,附文件路径方便他翻原文。

## 原则
- 不丢原文、不擅自改写他的想法(可补澄清,但保留原话);分类拿不准就标 `topic: 待定` 而不是瞎归。
- 归档结构是纯 markdown,任何工具(Obsidian/编辑器)都能直接看。
