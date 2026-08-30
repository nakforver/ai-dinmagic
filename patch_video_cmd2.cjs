const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        if (needsVideoReencode) {
           videoCmd += \` -c:v libx264 -preset ultrafast -threads 1 -crf 28 -pix_fmt yuv420p\`;
        }`;

const replacement = `        if (needsVideoReencode) {
           videoCmd += \` -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p\`;
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched videoCmd video codec");
} else {
    console.log("Target not found");
}
