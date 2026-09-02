' 赤兔语音 · 静默后台启动(不弹黑窗)。把本文件的**快捷方式**放进 shell:startup 即可开机常驻。
' 走同目录的 chitu-voice.bat,好继承它设的 CHITU_VOICE_PY / CHITU_VOICE_HOTKEY / CHITU_VOICE_SUBMIT 默认值。
Dim sh, here
Set sh = CreateObject("WScript.Shell")
here = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
sh.Run "cmd /c """ & here & "chitu-voice.bat""", 0, False
