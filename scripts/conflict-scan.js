#!/usr/bin/env node
// 赤兔 · 同步盘冲突副本巡检。大脑若被放在 Google Drive / Dropbox,多机同天写同一文件会留下
// "conflicted copy / 的冲突副本 / name (1).ext" 之类的副本 —— 静默堆积会污染大脑。
// 赤兔大脑默认是**本机本地目录**,那种情况下不可能有同步盘副本:CLI 检测到大脑不在同步盘就直接跳过
// (不空转、不刷屏);想强扫加 --force。consolidate 时列出让勾哥裁决;doctor 也可复用。仅用 Node 内置模块。
'use strict';
const fs = require('fs');
const path = require('path');
const { brainDir } = require(path.join(__dirname, 'lib.js'));
const { candidates } = require(path.join(__dirname, 'detect-sync.js'));

// 命中即同步盘冲突副本:Drive/Dropbox 自己打的英文/中文标记。
const MARKED_RE = [
  /conflicted copy/i,
  /冲突副本/,
  /\bconflict\b/i,
];
// Drive 的数字去重副本:"note (1).md"。光看文件名会误伤正常笔记(勾哥完全可能把笔记叫"想法 (2).md"),
// 所以这类要额外要求**同目录里原件还在**才算副本。
const NUM_DUP_RE = /^(.+) \((\d+)\)(\.[^.\\/]+)?$/;

function isConflictName(name) { return MARKED_RE.some(re => re.test(name)); }
// "note (1).md" → "note.md";不是这个形状返回 null。
function numberedDupOrigin(name) { const m = NUM_DUP_RE.exec(name); return m ? m[1] + (m[3] || '') : null; }

// dir 是否落在某个同步盘根下(Google Drive / My Drive / Dropbox / iCloud;OneDrive 按名字兜一层)。
function isSyncedPath(dir) {
  let d;
  try { d = path.resolve(dir).toLowerCase(); } catch { return false; }
  for (const [, root] of candidates()) {
    let r;
    try { r = path.resolve(root).toLowerCase(); } catch { continue; }
    if (d === r || d.startsWith(r.endsWith(path.sep) ? r : r + path.sep)) return true;
  }
  return /[\\/](google drive|my drive|dropbox|onedrive)[\\/]/i.test(d + path.sep);
}

// 递归扫描 dir,返回疑似冲突副本的绝对路径清单。跳过 .git / archive(归档区不算活跃污染)。
function findConflicts(dir) {
  const hits = [];
  const SKIP = new Set(['.git', 'node_modules', 'archive', 'shipped-base']);
  function walk(d) {
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isDirectory()) {
        if (SKIP.has(e.name)) continue;
        walk(path.join(d, e.name));
        continue;
      }
      if (isConflictName(e.name)) { hits.push(path.join(d, e.name)); continue; }
      const origin = numberedDupOrigin(e.name);
      if (origin && fs.existsSync(path.join(d, origin))) hits.push(path.join(d, e.name));
    }
  }
  try { if (fs.existsSync(dir)) walk(dir); } catch {}
  return hits;
}

module.exports = { findConflicts, isConflictName, numberedDupOrigin, isSyncedPath };

if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dir = args.filter(a => a !== '--force')[0] || brainDir();
  if (!force && !isSyncedPath(dir)) {
    process.stdout.write(`SKIP\t大脑在本机本地(${dir}),不存在同步盘冲突副本,跳过。想强扫加 --force。\n`);
    process.exit(0);
  }
  const hits = findConflicts(dir);
  if (!hits.length) { process.stdout.write('CLEAN\t未发现同步盘冲突副本。\n'); }
  else { process.stdout.write(`CONFLICTS\t${hits.length}\t发现疑似同步盘冲突副本,请裁决(留哪份/删哪份):\n`); for (const h of hits) process.stdout.write('  - ' + h + '\n'); }
}
