const { execSync } = require('child_process');
const pids = execSync('pgrep -f "node dist/server.cjs" || true').toString().trim().split('\n');
for (const p of pids) {
  if (!p) continue;
  try {
    console.log(execSync(`tail -n 200 /proc/${p}/fd/2`).toString());
  } catch (e) {}
}
