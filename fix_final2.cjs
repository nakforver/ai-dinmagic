const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let startIdx = lines.findIndex(l => l.includes('if (srtFile) {'));
let endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes('// Clean up trailing semicolon')) {
    endIdx = i;
    break;
  }
}
if (startIdx !== -1 && endIdx !== -1) {
  const replacement = [
    "    if (srtFile) {",
    "       const newSrtPath = srtFile.path + '.srt';",
    "       fs.renameSync(srtFile.path, newSrtPath);",
    "       srtFile.path = newSrtPath;",
    "       const escapedSrtPath = srtFile.path.replace(/\\\\/g, '/').replace(/'/g, \"\\\\'\").replace(/:/g, \"\\\\:\");",
    "       if (audioFiles.length > 0) {",
    "          filterComplex += `[0:v]subtitles='${escapedSrtPath}'[vout]`;",
    "          mapV = `[vout]`;",
    "       } else {",
    "          ffmpegCmd += ` -vf \"subtitles='${escapedSrtPath}'\"`;",
    "       }",
    "    }",
    "    "
  ].join('\n');
  lines.splice(startIdx, endIdx - startIdx, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'));
}
