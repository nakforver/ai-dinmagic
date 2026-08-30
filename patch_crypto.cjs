const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import crypto from "crypto";')) {
    code = code.replace('import express from "express";', 'import express from "express";\nimport crypto from "crypto";');
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with crypto import");
}
