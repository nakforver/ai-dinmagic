const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /filterComplex \+= \`\\\$\{mixInputs\}amix=inputs=\\\$\{inputCount\}\[aout\]; \`;/;
code = code.replace(regex, '');

const mapRegex = /mapA = \`\\\[aout\\\]\`;/;
code = code.replace(mapRegex, 'mapA = ""; for(let i=0; i<inputCount; i++){ mapA += `" -map "[a${hasOriginalAudio && i===0 ? "0" : (hasOriginalAudio ? i : i+1)}]`; } mapA = mapA.substring(8);');

// Let's use amerge instead of amix. amerge is more stable in older ffmpeg versions.
const replaceBlock = `           filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}[aout]; \`;           mapA = \`[aout]\`;`;
const replaceWith = `           filterComplex += \`\${mixInputs}amerge=inputs=\${inputCount}[aout]; \`;           mapA = \`[aout]\`;`;

if (code.includes('amix=inputs=${inputCount}[aout]; ')) {
    code = code.replace(replaceBlock, replaceWith);
}

fs.writeFileSync('server.ts', code);
