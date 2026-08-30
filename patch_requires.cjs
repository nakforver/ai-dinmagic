const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix spawn import
code = code.replace(`import { exec } from 'child_process';`, `import { exec, spawn } from 'child_process';`);

// Fix require('child_process')
code = code.replace(/const \{ spawn \} = require\('child_process'\);/g, '');

// Fix require('path') and require('os')
code = code.replace(/require\('path'\)/g, 'path');
code = code.replace(/require\('os'\)/g, 'os');

fs.writeFileSync('server.ts', code);
console.log("Patched requires in server.ts");
