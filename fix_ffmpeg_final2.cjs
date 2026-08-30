const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /filterComplex \+= \`\\\$\{mixInputs\}amix=inputs=\\\$\{inputCount\}:normalize=0\[aout\]; \`;/;
code = code.replace(regex, 'filterComplex += `${mixInputs}amix=inputs=${inputCount}:duration=first:dropout_transition=2[aout]; `;');

fs.writeFileSync('server.ts', code);
