const { execSync } = require('child_process');
const fs = require('fs');

fs.writeFileSync('test.srt', `1\n00:00:00,000 --> 00:00:01,000\nTest\n`);
try {
  execSync(`ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -vf "subtitles='test.srt'" -c:v libx264 -y test_font.mp4`, {stdio: 'pipe'});
  console.log("SUCCESS");
} catch(e) {
  console.log("FAIL", e.stderr.toString());
}
