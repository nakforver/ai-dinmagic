const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Also catch the full error stack in the export loop
code = code.replace(
    /error: \(err\.stderr \? err\.stderr\.toString\(\) : err\.message\) \|\| 'Failed to export video'/g,
    "error: `FFMPEG_ERROR: ${err.stderr ? err.stderr.toString() : err.message}`"
);

fs.writeFileSync('server.ts', code);
