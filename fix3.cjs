const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/const escapedSrtPath.*/, "       const escapedSrtPath = srtFile.path.replace(/\\\\\\\\/g, '/').replace(/'/g, \"\\\\\\\\'\").replace(/:/g, \"\\\\\\\\:\");");
fs.writeFileSync('server.ts', code);
