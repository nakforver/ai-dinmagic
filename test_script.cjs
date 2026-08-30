const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const startIndex = code.indexOf(`app.post('/api/export-video'`);
const endIndex = code.indexOf(`app.get('/api/export/status/:jobId'`);
console.log(code.substring(startIndex, endIndex));
