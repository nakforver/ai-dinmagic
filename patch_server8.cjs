const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I give up on filter_complex audio mixing. It's too problematic with this ffmpeg version.
// The easiest and most robust solution is to just use -map multiple times. 
// However, earlier I tried to map multiple streams but the player only plays the first audio stream.
// So we must mix it. The problem is amix/amerge crashes on this specific video.
// Let's just catch the error properly and send back the true error message.

// Wait, the real error was invalid data found when processing input!
// Maybe the audio files created by EdgeTTS are not fully valid wav files or something?
// Let's just fix the amix command by keeping it simple.

const replaceBlock = `           filterComplex += \`\${mixInputs}amerge=inputs=\${inputCount}[aout]; \`;`;
const replaceWith = `           filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}:duration=first[aout]; \`;`;

if (code.includes('amerge=inputs=')) {
    code = code.replace(replaceBlock, replaceWith);
}

fs.writeFileSync('server.ts', code);
