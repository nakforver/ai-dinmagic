const { execSync } = require('child_process');
try {
  let cmd = `ffmpeg -hide_banner -loglevel error -f lavfi -i anullsrc -f lavfi -i anullsrc -filter_complex "[0:a]volume=0.1[a0]; [1:a]adelay=100|100[a1]; [a0][a1]amix=inputs=2:duration=longest,volume=2[aout]" -map "[aout]" -t 1 -y dummy2.m4a`;
  execSync(cmd);
  console.log("Success");
} catch(e) {
  console.error("Failed:", e.message, e.stderr?.toString());
}
