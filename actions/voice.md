# 赤兔 · 语音喂 prompt（voice）

解决:在 Rider 终端跑 Claude Code/赤兔时懒得打字。**按全局热键说中文 → 实时转写 → 自动键入当前光标处(Claude Code 输入框)**,你审一眼再回车。

> 下文路径里的 `<赤兔根>` = 赤兔插件根目录的绝对路径(SessionStart 简报开头那行"赤兔插件根:"给了,照抄它的正斜杠写法)。**先替换成真实绝对路径再执行**——它不是环境变量。

> 复用 playtest 那套 Google Cloud STT(Chirp 3 流式,`<赤兔根>/integrations/playtest-capture/stt_google.py`),只是把出口从"喂 Unity"改成"喂终端光标"。**面向 Windows**(自动键入用 SendInput)。

## 这个动作干什么
用户说"赤兔 语音 / voice / 听写 / 口述"时:不是赤兔自己录音,而是**引导/启动那个常驻热键守护进程**,并按需自检。赤兔要做的:

1. **首次没配**:照 `<赤兔根>/integrations/voice-prompt/SETUP.md` 引导(装 `pynput google-cloud-speech sounddevice` + gcloud ADC 认证),别假装能用。先让用户跑自检:
   ```
   python "<赤兔根>/integrations/voice-prompt/chitu_voice.py" --check
   ```
2. **启动常驻**(让用户自己在终端跑或双击 .bat,赤兔不替他常驻):
   ```
   python "<赤兔根>/integrations/voice-prompt/chitu_voice.py"
   ```
   或双击 `<赤兔根>\integrations\voice-prompt\chitu-voice.bat`(资源管理器里打开插件目录找它)。
3. **用法**一句话讲清:光标停在 Claude Code 输入框 → 按 **Ctrl+F9** 说中文 → 再按一次停(或停顿 ~6s 自动停)→ 中文自动键入 → 自己回车。

## 规则
- **不冒充已验证**:全局热键捕获 / 麦克风 / Google 出中文 / SendInput 打进 Claude Code 这四环要用户真 Windows 端到端验一次(见 SETUP「验证边界」)。赤兔报的是"代码就绪",不是"已在你机器上跑通"。
- **降级诚实**:STT 起不来就报原因、照常打字,别硬编。
- 热键被占 → 改 `CHITU_VOICE_HOTKEY`;想键入后自动回车 → `CHITU_VOICE_SUBMIT=1`。
- 这是终端工具,**不进项目证据,不进 ~/.chitu 大脑**;算插件能力的一部分。
