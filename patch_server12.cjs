const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I need to ensure audioFiles exist and are valid. 
// It could be that one of the audio generation steps failed and passed an empty file.
// Or EdgeTTS generates an invalid file.

code = code.replace(
    /exportJobs\.set\(jobId, \{ status: 'error', error: \`FFMPEG_ERROR: \$\{err\.stderr \? err\.stderr\.toString\(\) : err\.message\}\` \}\);/g,
    "exportJobs.set(jobId, { status: 'error', error: `FFMPEG_ERROR (cmd: ${ffmpegCmd}): ${err.stderr ? err.stderr.toString() : err.message}` });"
);

fs.writeFileSync('server.ts', code);
