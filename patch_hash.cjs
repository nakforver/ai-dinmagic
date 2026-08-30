const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the exportKey generation block
const targetBlockStart = `    const hash = crypto.createHash('sha256');`;
const targetBlockEnd = `    const exportKey = hash.digest('hex');`;

const newBlock = `
    const hash = crypto.createHash('sha256');
    hash.update(videoFileId);
    hash.update(metadataStr);
    hash.update(srtContent);
    // Include audio file sizes to detect if an audio file was regenerated
    const audioFilesForHash = files.filter(f => f.fieldname.startsWith('audio_'));
    audioFilesForHash.sort((a, b) => a.fieldname.localeCompare(b.fieldname));
    for (const af of audioFilesForHash) {
        if (fs.existsSync(af.path)) {
            hash.update(fs.statSync(af.path).size.toString());
        }
    }
    const exportKey = hash.digest('hex');
`;

if (code.includes(targetBlockStart) && code.includes(targetBlockEnd)) {
    const startIdx = code.indexOf(targetBlockStart);
    const endIdx = code.indexOf(targetBlockEnd) + targetBlockEnd.length;
    code = code.substring(0, startIdx) + newBlock.trim() + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with better hashing");
} else {
    console.log("Could not find target block in server.ts");
}
