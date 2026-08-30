const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The best way to avoid amix errors is not to use it at all and just map streams, 
// OR handle the case where video is short and audio keeps going.
// Let's replace the whole amix string entirely to just use -map for everything.

const regex = /filterComplex \+= \`\\\$\{mixInputs\}amix=inputs=\\\$\{inputCount\}\[aout\]; \`;/;
code = code.replace(regex, '');

const mapRegex = /mapA = \`\\\[aout\\\]\`;/;
code = code.replace(mapRegex, 'for(let i=0; i<inputCount; i++){ mapA += ` -map "[a${hasOriginalAudio && i===0 ? "0" : (hasOriginalAudio ? i : i+1)}]"`; }');

fs.writeFileSync('server.ts', code);
