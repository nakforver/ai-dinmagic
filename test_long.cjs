const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Create dummy video
  execSync('ffmpeg -f lavfi -i color=c=black:s=1280x720:d=10 -c:v libx264 -y dummy_long.mp4', {stdio: 'ignore'});
  
  // Create dummy srt
  let srt = '';
  for(let i=0; i<300; i++) {
    srt += `${i+1}\n00:00:01,000 --> 00:00:05,000\nHello World\n\n`;
  }
  fs.writeFileSync('dummy_long.srt', srt);
  
  // Run ffmpeg
  const cmd = `ffmpeg -nostdin -hide_banner -loglevel error -i "dummy_long.mp4" -filter_complex "[0:v]subtitles='dummy_long.srt'[vout]" -map "[vout]" -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -y output_long.mp4`;
  console.log('Running cmd');
  execSync(cmd);
  console.log('Success');
} catch(e) {
  console.error('Failed:', e.stderr ? e.stderr.toString() : e.message);
}
