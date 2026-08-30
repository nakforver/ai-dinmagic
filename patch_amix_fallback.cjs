const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = "if (inputCount === 1) { filterComplex += `${mixInputs}volume=1[aout]; `; } else { filterComplex += `${mixInputs}amix=inputs=${inputCount}:duration=first[aout]; `; }";
const replacementStr = "if (inputCount === 1) { filterComplex += `${mixInputs}volume=1[aout]; `; } else { filterComplex += `${mixInputs}amix=inputs=${inputCount}:duration=longest[aout]; `; }";

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('server.ts', code);
    console.log("Patched duration=longest");
}
