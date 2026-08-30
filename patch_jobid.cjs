const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  const jobId = Date.now().toString();
  
  jobs.set(jobId, { status: 'starting', progress: 40 });
  res.json({ jobId });
  
  // Process in background to avoid HTTP timeouts
  (async () => {`;

const badTarget = `const jobId = Date.now().toString();
    exportCache.set(exportKey, jobId);`;

if (code.includes(badTarget) && !code.includes(`const exportKey = hash.digest('hex');\n    \n    if (exportCache.has(exportKey))`)) {
    // Looks like the earlier replacement messed up something because there were multiple "const jobId = " lines!
}

