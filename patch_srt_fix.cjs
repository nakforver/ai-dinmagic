const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I'll just restore from git or just fix the mess manually using node
// Or better, let's clean up lines 311-314
code = code.replace(/    } else {\s*ffmpegCmd \+= ` -vf "subtitles='\$\{escapedSrtPath\}'"`;\s*}\s*}/, "");
fs.writeFileSync('server.ts', code);
