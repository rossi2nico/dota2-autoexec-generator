# Dota 2 Autoexec File Generator
Interactive CLI tool to generate a custom Dota 2 autoexec.cfg with optimized settings and keybinds inspired by professional players. Quickly apply performance tweaks, UI enhancements, and personalized controls all from the terminal.

<img width="1265" height="751" alt="image" src="https://github.com/user-attachments/assets/e2c06508-6392-47f7-b151-cad60bc2b7d6" />

## 🗂️ File Locations  
The tool automatically detects your Dota 2 installation and places the autoexec.cfg file in the correct location:
```bash
C:\Program Files (x86)\Steam\steamapps\common\dota 2 beta\game\dota\cfg\ # Windows
~/Library/Application Support/Steam/steamapps/common/dota 2 beta/game/dota/cfg/ # MacOS
~/.steam/steam/steamapps/common/dota 2 beta/game/dota/cfg/ # Linux
```
  
## 🚀 Quick Start

- [Node.js 14+](https://nodejs.org/en/download) must be installed on your computer  
### Install Node in terminal:
```bash
docker pull node:22-alpine
docker run -it --rm --entrypoint sh node:22-alpine
```

### Generate custom autoexec file:
```bash
npm i dota2-autoexec-generator
npx dota2-autoexec-generator
```










