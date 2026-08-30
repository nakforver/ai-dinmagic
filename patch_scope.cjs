const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The crash happens on line 346: ReferenceError: ffmpegCmd is not defined
code = code.replace(
  'error: `FFMPEG_ERROR (cmd: ${ffmpegCmd}): ${err.stderr ? err.stderr.toString() : err.message}`',
  'error: `FFMPEG_ERROR: ${err.stderr ? err.stderr.toString() : err.message}`'
);

fs.writeFileSync('server.ts', code);
