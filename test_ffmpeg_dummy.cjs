const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

// Create dummy video
const dummyVideo = path.join(os.tmpdir(), 'dummy.mp4');
execSync(`ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -c:v libx264 -preset ultrafast -y "${dummyVideo}"`);

// Create dummy srt
const dummySrt = path.join(os.tmpdir(), 'dummy.srt');
fs.writeFileSync(dummySrt, `1
00:00:00,000 --> 00:00:01,000
Hello World`);

const escapedSrtPath = dummySrt.replace(/\\\\/g, '/').replace(/'/g, "\\\\'").replace(/:/g, "\\\\:");

const cmd = `ffmpeg -hide_banner -loglevel error -i "${dummyVideo}" -vf "subtitles='${escapedSrtPath}'" -c:v libx264 -preset ultrafast -y "${dummyVideo}.out.mp4"`;
console.log("Running:", cmd);
try {
  execSync(cmd, {stdio: 'inherit'});
  console.log("SUCCESS");
} catch(e) {
  console.error("FAIL", e.message);
}
