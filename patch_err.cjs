const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'execSync(ffmpegCmd);',
  'execSync(ffmpegCmd, { stdio: "pipe" });'
);

code = code.replace(
  "exportJobs.set(jobId, { status: 'error', error: err.message || 'Failed to export video' });",
  "exportJobs.set(jobId, { status: 'error', error: (err.stderr ? err.stderr.toString() : err.message) || 'Failed to export video' });"
);

fs.writeFileSync('server.ts', code);
