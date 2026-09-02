' Chitu voice - silent background launcher (no console window).
' Put a SHORTCUT to this file into shell:startup to auto-start on login.
' (Runs chitu_voice.py in the same folder. If you use a venv, replace "python" below.)
Dim sh, here
Set sh = CreateObject("WScript.Shell")
here = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
sh.Run "python """ & here & "chitu_voice.py""", 0, False
