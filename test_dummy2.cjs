const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync(`ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -c:a aac -y /tmp/3c33cc6b54eef367288513148e49b2ed.mp4`);
  for (let f of ['1391d4b3e6fd6348022d6db5f506ca44', '2fdef58ae4a571146cf2bf6ca7478367', '37b5f3a73848a20d698efe501f0a58ad', '51cb7ca97b6fe34042b2007dd9a6798b']) {
    execSync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -y /tmp/${f}.wav`);
    execSync(`mv /tmp/${f}.wav /tmp/${f}`);
  }
  execSync(`mv /tmp/3c33cc6b54eef367288513148e49b2ed.mp4 /tmp/3c33cc6b54eef367288513148e49b2ed`);
  
  fs.writeFileSync('/tmp/d5a6a5f3bf32fdf13f83e4dd3ac6574c.srt', '1\n00:00:00,000 --> 00:00:01,000\nTest\n');
  
  const cmd = `ffmpeg -nostdin -hide_banner -loglevel error -i "/tmp/3c33cc6b54eef367288513148e49b2ed" -i "/tmp/1391d4b3e6fd6348022d6db5f506ca44" -i "/tmp/2fdef58ae4a571146cf2bf6ca7478367" -i "/tmp/37b5f3a73848a20d698efe501f0a58ad" -i "/tmp/51cb7ca97b6fe34042b2007dd9a6798b" -filter_complex "[0:a]volume=0.1[a0]; [1:a]adelay=0|0[a1]; [2:a]adelay=3000|3000[a2]; [3:a]adelay=7500|7500[a3]; [4:a]adelay=15500|15500[a4]; [a0][a1][a2][a3][a4]amix=inputs=5:duration=first:dropout_transition=2[aout]; [0:v]subtitles='/tmp/d5a6a5f3bf32fdf13f83e4dd3ac6574c.srt'[vout]" -map "[vout]" -map "[aout]" -c:a aac -c:v libx264 -preset veryfast -crf 28 -y "/tmp/output_1787910599813.mp4"`;
  
  console.log("RUNNING CMD...");
  console.log(execSync(cmd, {stdio: 'pipe'}).toString());
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:\n", e.stderr ? e.stderr.toString() : e.message);
}
