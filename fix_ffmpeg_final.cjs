const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The main issue might be how adelay is formatted or that it doesn't like 6 streams.
// A safe FFmpeg command structure is:
// ffmpeg -nostdin -y -i video.mp4 -i a1.wav -filter_complex "[1:a]adelay=3500|3500[a1]; [0:a][a1]amix=inputs=2[aout]" -map 0:v -map "[aout]" out.mp4

code = code.replace(
  /const escapedSrtPath = srtFile\.path\.replace\(\/\\\\\\\\\/g, '\/'\)\.replace\(\/'\/g, "\\\\\\\\\\\\'"\)\.replace\(\/:\\\/g, "\\\\\\\\\\:"\);/,
  `const escapedSrtPath = srtFile.path.replace(/\\\\\\\\/g, '/').replace(/'/g, "\\\\\\\\'").replace(/:/g, "\\\\\\\\:");`
);

// We should also handle the case where the user sends a video with NO audio stream, but we still try to mix it.
// Actually, earlier we checked `hasOriginalAudio`. Let's make sure the audio mixing is robust.

fs.writeFileSync('server.ts', code);
