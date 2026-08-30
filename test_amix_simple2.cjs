const { execSync } = require('child_process');
try {
  execSync(`ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -c:a aac -y v.mp4`);
  for (let i = 1; i <= 4; i++) {
    execSync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -y a${i}.wav`);
  }
  const cmd = `ffmpeg -nostdin -hide_banner -loglevel error -i v.mp4 -i a1.wav -i a2.wav -i a3.wav -i a4.wav -filter_complex "[0:a]volume=0.1[a0]; [1:a]adelay=0|0[a1]; [2:a]adelay=3000|3000[a2]; [3:a]adelay=7500|7500[a3]; [4:a]adelay=15500|15500[a4]; [a0][a1][a2][a3][a4]amix=inputs=5[aout]; [0:v]subtitles='test.srt'[vout]" -map "[vout]" -map "[aout]" -c:a aac -c:v libx264 -preset veryfast -crf 28 -y "out.mp4"`;
  console.log(execSync(cmd, {stdio: 'pipe'}).toString());
  console.log("SUCCESS");
} catch(e) {
  console.log("ERROR:\n", e.stderr ? e.stderr.toString() : e.message);
}
