const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The amix filter is what's causing issues.
// Let's replace the audio mixing part. Instead of mixing all audio into one stream using filter_complex,
// we will just -map all audio streams directly into the MP4 file as multiple audio tracks.
// Modern browsers and players can sometimes handle multiple audio tracks, but wait, usually they only play the first track.
// Actually, earlier we saw that amix fails with "Invalid data found when processing input" which usually means one of the audio files is corrupt or zero bytes.
// Let's add a check in server.ts to ensure all audio files are valid before passing to ffmpeg.
// Also we can just use simple -map if we don't have multiple audio tracks.

// To be safe, if we have multiple audio tracks, let's keep amix but ensure files exist and are not empty.
const regex = /filterComplex \+= \`\\\$\{mixInputs\}amix=inputs=\\\$\{inputCount\}:duration=first\[aout\]; \`;/;
code = code.replace(
    regex,
    `if (inputCount > 1) { filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}:duration=first[aout]; \`; } else { filterComplex += \`\${mixInputs}anull[aout]; \`; }`
);

fs.writeFileSync('server.ts', code);
