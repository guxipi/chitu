# 赤兔 · 整理记忆(consolidate)

目标:防止"记忆腐烂"。这是大脑长期可用的关键维护步骤(事件驱动:每次开会话若距上次 >24h 会被提醒)。

> 下文命令里的 `<赤兔根>` = 赤兔插件的根目录绝对路径(SessionStart 简报开头那行"赤兔插件根:"给了,照抄它的正斜杠写法;走 /chitu 技能进来的,就是技能自我介绍里那个目录)。**先替换成真实绝对路径再执行**——它不是环境变量,原样丢给 shell 会展开成空,报 Cannot find module。

## 步骤

1. **盘点**:读取 `~/.chitu/INDEX.md` 和 `lessons/` 下所有 `L-*.md`。

   `notes/inbox/` **不归这里消费**——那是随手记,归 note 动作(它整理完会把原件移进 `notes/inbox/_done/`,收件箱计数才会归零)。consolidate 只瞄一眼有没有积压:有就提醒勾哥"随手记还压着 N 条,要不要顺手跑一次笔记整理(读 `<赤兔根>/actions/note.md`)",**别在这里另起一套读它**,否则两个动作抢同一批笔记、计数还永远清不掉。

   同时用 Bash 跑一次冲突副本巡检:
   `node "<赤兔根>/scripts/conflict-scan.js"`
   赤兔大脑在本机本地时它会打一行 `SKIP` 直接跳过(**这是正常的,不是坏了**);只有大脑被放进 Google Drive / Dropbox 才真扫。
   输出 `CONFLICTS` 就把清单**念给勾哥裁决**(留哪份/删哪份),别自作主张删。

2. **两阶段对账**(借鉴 mem0 的 ADD/UPDATE/DELETE/NOOP)。对每条候选/已有记忆判定:
   - **ADD**:新的、不重复 → 保留/新建。
   - **UPDATE**:与已有同主题但更新更准 → 合并,旧的标 `status: superseded`(软删除,保留历史)。
   - **DELETE/ARCHIVE**:已过时或明确错误 → 标 `status: archived`,从 INDEX 移除。
   - **NOOP**:重复且无新信息 → 丢弃候选。

3. **去重合并**:同一主题的多条 lesson 合并成一条更一般化的规则(Reflexion 式归纳),保留最高 severity。

4. **升级反复犯的**:同类错误出现 ≥2 次 → 提升 severity,必要时并入 `core/hard-rules.md`,能硬拦截的加进 `.meta/hook-rules.json`(保守:正则要能精确命中)。

5. **冲突不自作主张**:新信息与旧记忆矛盾、又拿不准时,**不要擅自改**,写进 `~/.chitu/.meta/conflicts.md` 等用户裁决。

6. **修订索引**:更新 `INDEX.md` 使其与现状一致;确认它仍在 ≤200 行的预算内。

7. **归档与重建索引**:把 `status: archived/superseded` 的 lesson 移到 `~/.chitu/lessons/archive/`(运行时不再扫,保持活跃集精简;**目录不在就先建**,老大脑里没有这一层);然后运行
   `node "<赤兔根>/scripts/build-index.js"` 重建编译索引。

8. **打整理时间戳**:用 Bash 工具运行
   `node "<赤兔根>/scripts/stamp-consolidate.js"`
   (写入 `~/.chitu/.meta/last-consolidate.txt`,这样 SessionStart 的"整理到期"会重置 24 小时。)

9. **汇报**:简短列出本次做了什么(合并 N 条、归档 M 条、升级 K 条、待裁决 J 条),并把 conflicts 念给用户。

> 赤兔大脑只在本机本地落盘,无需同步收尾。

## 原则
- 软删除优先于硬删(标 status,不物理删除),保留可追溯历史。
- 拿不准就攒着问,绝不替用户做矛盾裁决(对应红线:不编造、不擅自大改)。
- 保持 core 精简,别让红线膨胀到 LLM 服从性下降(≤15 条)。
