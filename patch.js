const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');
code = code.replace(/const chunkData = new FormData\(\);\s*chunkData.append\('chunk', chunk, 'chunk.part'\);\s*chunkRes = await fetch\(`\/api\/upload-chunk\?fileId=\$\{fileId\}&chunkIndex=\$\{i\}`,\s*\{\s*method:\s*'POST',\s*body:\s*chunkData,\s*\}\);/g, `chunkRes = await fetch(\`/api/upload-chunk?fileId=\${fileId}&chunkIndex=\${i}\`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: chunk });`);
fs.writeFileSync('src/components/Editor.tsx', code);
