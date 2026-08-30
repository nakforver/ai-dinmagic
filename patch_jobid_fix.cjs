const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `  const jobId = Date.now().toString();
    exportCache.set(exportKey, jobId);`;
const replacement1 = `  const jobId = Date.now().toString();`;

code = code.replace(target1, replacement1);

const target2 = `    const jobId = Date.now().toString();
    const outputVideoPath = path.join(os.tmpdir(), \`output_\${jobId}.mp4\`);`;
const replacement2 = `    const jobId = Date.now().toString();
    exportCache.set(exportKey, jobId);
    const outputVideoPath = path.join(os.tmpdir(), \`output_\${jobId}.mp4\`);`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Fixed exportKey reference error");
