const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = 'audioFilter += `${mixInputs}amix=inputs=${inputCount}:duration=longest,volume=${inputCount}[aout]`;';
const replacement = 'audioFilter += `${mixInputs}amix=inputs=${inputCount}:duration=longest:normalize=0[aout]`;';

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched amix to use normalize=0");
} else {
    console.log("Target not found");
}
