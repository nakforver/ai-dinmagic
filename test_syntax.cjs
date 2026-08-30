const { execSync } = require('child_process');
try {
  execSync(`ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -y -f lavfi -i anullsrc=r=44100:cl=stereo -filter_complex "[0:a]volume=0.1[a0]; [1:a]adelay=1000|1000[a1]; [a0][a1]amix=inputs=2:normalize=0[aout]" -map "[aout]" -c:a aac -preset veryfast -crf 28 "out.mp4"`, {stdio: 'pipe'});
  console.log("SUCCESS");
} catch(e) {
  console.log("FAIL");
  console.log(e.stderr.toString());
}
