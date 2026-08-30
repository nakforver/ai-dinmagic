const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        if (audioFiles.length > 0) {
           videoCmd += \` -c:a copy\`;
        } else if (hasOriginalAudio) {
           videoCmd += \` -c:a copy\`;
        }`;

const replacement = `        if (audioFiles.length > 0 || hasOriginalAudio) {
           videoCmd += \` -c:a aac -b:a 192k\`;
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched videoCmd audio codec");
} else {
    console.log("Target not found");
}
