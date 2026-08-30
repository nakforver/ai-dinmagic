const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const mixResult = await execAsync(mixCmd);
           if (mixResult.stderr) console.error('FFmpeg mix stderr:', mixResult.stderr);`;

const replacement = `let mixResult;
           try {
               mixResult = await execAsync(mixCmd);
               if (mixResult.stderr) console.error('FFmpeg mix stderr:', mixResult.stderr);
           } catch(e) {
               console.error('FFmpeg mix ERROR:', e.stderr || e.message);
               throw new Error('FFmpeg error: ' + (e.stderr || e.message).substring(0, 500));
           }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched execAsync to throw better errors");
} else {
    console.log("Target not found");
}
