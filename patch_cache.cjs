const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cacheDeclaration = `const exportJobs = new Map<string, { status: string, error?: string, path?: string }>();
const exportCache = new Map<string, string>();`;
code = code.replace(`const exportJobs = new Map<string, { status: string, error?: string, path?: string }>();`, cacheDeclaration);

const target = `app.post('/api/export-video', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] || [];`;

const replacement = `app.post('/api/export-video', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] || [];
    const srtFile = files.find(f => f.fieldname === 'srt');
    
    // Hash inputs for caching
    const metadataStr = req.body.metadata || '';
    const videoFileId = req.body.videoFileId || '';
    const srtContent = srtFile && fs.existsSync(srtFile.path) ? fs.readFileSync(srtFile.path, 'utf8') : '';
    
    const hash = crypto.createHash('sha256');
    hash.update(videoFileId);
    hash.update(metadataStr);
    hash.update(srtContent);
    const exportKey = hash.digest('hex');
    
    if (exportCache.has(exportKey)) {
        const existingJobId = exportCache.get(exportKey);
        const job = exportJobs.get(existingJobId!);
        if (job && (job.status === 'completed' || job.status === 'processing') && job.path && fs.existsSync(job.path)) {
            // Cleanup incoming files since we are using cache
            files.forEach(f => {
              try { fs.unlinkSync(f.path); } catch (e) {}
            });
            // Cleanup incoming chunks
            const videoTotalChunks = parseInt(req.body.videoTotalChunks || '0', 10);
            for (let i = 0; i < videoTotalChunks; i++) {
              const chunkPath = require('path').join(require('os').tmpdir(), \`upload_\${videoFileId}_part_\${i}\`);
              if (fs.existsSync(chunkPath)) fs.unlinkSync(chunkPath);
            }
            return res.json({ jobId: existingJobId, cached: true });
        }
    }`;

code = code.replace(target, replacement);

const target2 = `const jobId = Date.now().toString();`;
const replacement2 = `const jobId = Date.now().toString();
    exportCache.set(exportKey, jobId);`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts caching");
