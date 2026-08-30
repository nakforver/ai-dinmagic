const { execSync } = require('child_process');
try {
  const cmd = `ffmpeg -nostdin -hide_banner -loglevel error -i "video_with_audio.mp4" -i a1.wav -i a2.wav -i a3.wav -i a4.wav -i a5.wav -filter_complex "[0:a]volume=0.1[a0]; [1:a]adelay=3500|3500[a1]; [2:a]adelay=7500|7500[a2]; [3:a]adelay=11800|11800[a3]; [4:a]adelay=17800|17800[a4]; [5:a]adelay=21300|21300[a5]; [a0][a1][a2][a3][a4][a5]amix=inputs=6:normalize=0[aout]; [0:v]subtitles='test.srt'[vout]" -map "[vout]" -map "[aout]" -c:a aac -c:v libx264 -preset veryfast -crf 28 -y "out.mp4"`;
  console.log("Running", cmd);
  const out = execSync(cmd).toString();
  console.log("SUCCESS");
} catch (e) {
  console.log("ERROR\n", e.stderr ? e.stderr.toString() : e.message);
}
