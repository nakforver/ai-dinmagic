const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        if (srtFile) {
           const newSrtPath = srtFile.path + '.srt';
           fs.renameSync(srtFile.path, newSrtPath);
           srtFile.path = newSrtPath;
           
           const escapedSrtPath = srtFile.path.replace(/\\\\/g, '/').replace(/'/g, "\\\\\\'").replace(/:/g, "\\\\:");
           vFilter = \`subtitles='\${escapedSrtPath}'\`;
           mapV = \`[vout]\`;
           needsVideoReencode = true;
        }`;

const replacement = `        if (srtFile) {
           const escapedSrtPath = srtFile.path.replace(/\\\\/g, '/').replace(/'/g, "\\\\\\'").replace(/:/g, "\\\\:");
           vFilter = \`subtitles='\${escapedSrtPath}'\`;
           mapV = \`[vout]\`;
           needsVideoReencode = true;
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched SRT path");
} else {
    console.log("Target not found");
}
