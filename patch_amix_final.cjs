const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Filter valid audio files
code = code.replace(
  "const audioFiles = files.filter(f => f.fieldname.startsWith('audio_'));",
  "const audioFiles = files.filter(f => f.fieldname.startsWith('audio_') && fs.statSync(f.path).size > 100);"
);

// Fix amix if inputCount == 1 (it doesn't need mixing, just map it directly or use a volume filter)
code = code.replace(
  "filterComplex += `\\${mixInputs}amix=inputs=\\${inputCount}:duration=first[aout]; `;",
  "if (inputCount === 1) { filterComplex += `\\${mixInputs}volume=1[aout]; `; } else { filterComplex += `\\${mixInputs}amix=inputs=\\${inputCount}:duration=first[aout]; `; }"
);

fs.writeFileSync('server.ts', code);
