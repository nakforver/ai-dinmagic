const fs = require('fs');

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
    /const exportJobs = new Map<string, { status: string; error\?: string; path\?: string }>\(\);/,
    `const exportJobs = new Map<string, { status: string; error?: string; path?: string; progress?: number }>();`
);
fs.writeFileSync('server.ts', serverCode);

// Patch Editor.tsx
let editorCode = fs.readFileSync('src/components/Editor.tsx', 'utf8');
editorCode = editorCode.replace(
    /clearInterval\(progressInterval\);/g,
    `// clearInterval(progressInterval);`
);
fs.writeFileSync('src/components/Editor.tsx', editorCode);

console.log("Patched types");
