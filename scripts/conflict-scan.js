#!/usr/bin/env node
// 赤兔 · 冲突副本巡检。大脑若被放在 Google Drive / Dropbox / OneDrive,多机同天写同一文件会留下
// "conflicted copy / 的冲突副本 / name (1).ext" 之类的副本 —— 静默堆积会污染大脑。
//
// 设计取舍:**永远真扫**,不做"本地大脑就跳过"的早退。判"在不在同步盘"只用来决定**措辞**和要不要
// 报可疑项 —— 判错了顶多话说得不准,不会漏报;早退一旦判错(junction 进 Drive、Dropbox (Team)、
// OneDrive - <租户> 这些名字都不在白名单里)就是真副本一条不报,漏判比误报危险得多。
//
// 两级结果:
//   sure    带客户端标记(conflicted copy / 的冲突副本 / 括号里带 conflict)的文件或目录,
//           以及 "name (N).ext" 且**同目录原件还在** —— 请勾哥裁决。
//   suspect "name (N).ext" 但原件已不在(可能是副本变孤儿,也可能只是勾哥自己这么命名的笔记)。
//           只在大脑确实位于同步盘时才提,免得本地大脑里的"想法 (2).md"天天被当成事故。
// 仅用 Node 内置模块。
'use strict';
const fs = require('fs');
const path = require('path');
const { brainDir } = require(path.join(__dirname, 'lib.js'));
const { candidates } = require(path.join(__dirname, 'detect-sync.js'));

// 客户端自己打的冲突标记(英文/中文),文件名与目录名同样适用。
// 注意别放 /\bconflict\b/ 这种宽正则:正常的 "merge-conflict-notes.md" 会被误判成事故。
const MARKED_RE = [
  /conflicted copy/i,
  /冲突副本/,
  /\([^)]*conflict[^)]*\)/i,   // "(conflicted 2026-07-02)" 这类括号标记
];
// Drive 的数字去重副本:"note (1).md"。光看文件名会误伤正常笔记,得看原件在不在。
const NUM_DUP_RE = /^(.+) \((\d+)\)(\.[^.\\/]+)?$/;

function isConflictName(name) { return MARKED_RE.some(re => re.test(name)); }
// "note (1).md" → "note.md";不是这个形状返回 null。
function numberedDupOrigin(name) { const m = NUM_DUP_RE.exec(name); return m ? m[1] + (m[3] || '') : null; }

// dir 是否落在某个同步盘根下。只影响措辞与可疑项显示,不影响扫不扫。
// 先 realpath(junction/symlink 指进 Drive 的情况),再比对候选根,最后按目录名兜一层(团队版/租户版名字)。
function isSyncedPath(dir) {
  let d;
  try { d = path.resolve(dir); } catch { return false; }
  try { d = fs.realpathSync(d); } catch {}
  d = d.toLowerCase();
  for (const [, root] of candidates()) {
    let r;
    try { r = path.resolve(root).toLowerCase(); } catch { continue; }
    if (d === r || d.startsWith(r.endsWith(path.sep) ? r : r + path.sep)) return true;
  }
  // "Dropbox (Acme Corp)" / "OneDrive - Contoso" / "GoogleDrive-xxx" / "我的云端硬盘" 等段名变体
  return d.split(/[\\/]/).some(seg =>
    /^(dropbox|onedrive|google ?drive|my drive|我的云端硬盘)\b/i.test(seg));
}

// 递归扫描 dir。跳过 .git / node_modules / archive(归档区不算活跃污染)。
// 返回 { sure: [...绝对路径], suspect: [...绝对路径] }。
function scan(dir) {
  const sure = [], suspect = [];
  const SKIP = new Set(['.git', 'node_modules', 'archive', 'shipped-base']);
  function walk(d) {
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        // Drive 也会整目录复制一份 "lessons (conflicted copy)":报出来,里面不再往下扒。
        if (isConflictName(e.name)) { sure.push(full); continue; }
        if (SKIP.has(e.name)) continue;
        walk(full);
        continue;
      }
      if (isConflictName(e.name)) { sure.push(full); continue; }
      const origin = numberedDupOrigin(e.name);
      if (!origin) continue;
      if (fs.existsSync(path.join(d, origin))) sure.push(full);
      else suspect.push(full);
    }
  }
  try { if (fs.existsSync(dir)) walk(dir); } catch {}
  return { sure, suspect };
}

// 老接口:只给确定的那批(doctor / 测试沿用)。
function findConflicts(dir) { return scan(dir).sure; }

module.exports = { scan, findConflicts, isConflictName, numberedDupOrigin, isSyncedPath };

if (require.main === module) {
  const dir = process.argv.slice(2).filter(a => !a.startsWith('--'))[0] || brainDir();
  const synced = isSyncedPath(dir);
  const { sure, suspect } = scan(dir);
  if (sure.length) {
    process.stdout.write(`CONFLICTS\t${sure.length}\t发现同步盘冲突副本,请裁决(留哪份/删哪份):\n`);
    for (const h of sure) process.stdout.write('  - ' + h + '\n');
  } else {
    process.stdout.write(`CLEAN\t未发现冲突副本${synced ? '(大脑在同步盘,值得定期看)' : '(大脑在本机本地,本来也不该有)'}。\n`);
  }
  // 可疑项只在同步盘大脑里提:本地大脑的 "想法 (2).md" 就是正常笔记,别拿它烦人。
  if (synced && suspect.length) {
    process.stdout.write(`SUSPECT\t${suspect.length}\t名字像副本但原件已不在,可能是副本变孤儿,也可能是你自己这么起的名:\n`);
    for (const h of suspect) process.stdout.write('  - ' + h + '\n');
  }
}
