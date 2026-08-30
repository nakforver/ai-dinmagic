const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I made a mistake in previous patch, the mapA variable was overwritten later. 
// Let's replace the whole amix block to handle mixing properly and safely.

const blockToReplace = `           let inputCount = audioFiles.length;                      if (hasOriginalAudio) {               filterComplex += \`[0:a]volume=0.1[a0]; \`;               mixInputs += \`[a0]\`;               inputCount += 1;           }                      filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}[aout]; \`;           mapA = \`[aout]\`;`;

const newBlock = `           let inputCount = audioFiles.length;           if (hasOriginalAudio) {               filterComplex += \`[0:a]volume=0.1[a0]; \`;               mixInputs += \`[a0]\`;               inputCount += 1;           }           filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}:dropout_transition=2[aout]; \`;           mapA = \`[aout]\`;`;

if (code.includes('amix=inputs=${inputCount}[aout];')) {
  code = code.replace(blockToReplace, newBlock);
}

fs.writeFileSync('server.ts', code);
