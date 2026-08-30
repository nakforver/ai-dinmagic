const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import * as crypto")) {
    code = code.replace("import express from 'express';", "import express from 'express';\nimport * as crypto from 'crypto';");
    fs.writeFileSync('server.ts', code);
    console.log("Patched crypto import");
} else {
    console.log("Already has crypto");
}
