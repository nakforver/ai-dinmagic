const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("dotenv")) {
    code = `import * as dotenv from 'dotenv';\ndotenv.config();\n` + code;
    fs.writeFileSync('server.ts', code);
    console.log('Added dotenv to server.ts');
}
