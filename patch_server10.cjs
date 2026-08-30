const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The amix fix duration=first was applied correctly.
// Let's also patch the error handler in case it was missed, so we see what's actually failing in the user's run.
// The regex in patch 9 probably missed because the replacement target string wasn't exactly right.
code = code.replace(
    /exportJobs\.set\(jobId, \{ status: 'error', error: .* \}\);/g,
    "exportJobs.set(jobId, { status: 'error', error: `FFMPEG_ERROR: ${err.stderr ? err.stderr.toString() : err.message}` });"
);

fs.writeFileSync('server.ts', code);
