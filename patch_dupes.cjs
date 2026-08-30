const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove redundant srtFile
code = code.replace(`    const srtFile = files.find(f => f.fieldname === 'srt');\n    \n    let videoPath = '';\n    const videoFileId = req.body.videoFileId;`, `    let videoPath = '';`);

// Find the metadataStr
code = code.replace(`    const metadataStr = req.body.metadata;\n    let audioMetadata: any[] = [];\n    if (metadataStr) {`, `    let audioMetadata: any[] = [];\n    if (metadataStr) {`);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts duplicate declarations");
