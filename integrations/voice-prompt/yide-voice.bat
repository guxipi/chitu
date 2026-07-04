@echo off
REM 赤兔语音 · 一键启动常驻热键守护进程（Windows）
REM 双击或在终端跑都行。改下面这两行可改 python / 热键。
chcp 65001 >nul
setlocal

REM 跑 stt_google.py 用的 python（venv 就填 venv 里的 python.exe）
if "%CHITU_VOICE_PY%"=="" set CHITU_VOICE_PY=python

REM 全局热键（pynput 写法）；按一下开始说，再按一下停
if "%CHITU_VOICE_HOTKEY%"=="" set CHITU_VOICE_HOTKEY=^<ctrl^>+^<f9^>

REM 键入后是否自动回车提交：1=自动回车，0=只键入留你审（默认 0）
if "%CHITU_VOICE_SUBMIT%"=="" set CHITU_VOICE_SUBMIT=0

"%CHITU_VOICE_PY%" "%~dp0chitu_voice.py" %*
endlocal
