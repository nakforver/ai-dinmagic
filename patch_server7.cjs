const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replaceBlock = `           filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}[aout]; \`;`;
const replaceWith = `           filterComplex += \`\${mixInputs}amerge=inputs=\${inputCount}[aout]; \`;`;

if (code.includes('amix=inputs=${inputCount}[aout]; ')) {
    code = code.replace(replaceBlock, replaceWith);
}

fs.writeFileSync('server.ts', code);
