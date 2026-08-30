const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = "filterComplex += `${mixInputs}amix=inputs=${inputCount}:duration=first[aout]; `;";
const replacementStr = "if (inputCount === 1) { filterComplex += `${mixInputs}volume=1[aout]; `; } else { filterComplex += `${mixInputs}amix=inputs=${inputCount}:duration=first[aout]; `; }";

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully");
} else {
    console.log("Could not find the target string!");
}
