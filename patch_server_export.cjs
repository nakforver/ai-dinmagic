const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Insert exportJobs map
if (!code.includes('const exportJobs = new Map')) {
    code = code.replace(/const jobs = new Map.*?\n/, "const jobs = new Map<string, { status: string, progress: number, lines?: any[], error?: string }>();\nconst exportJobs = new Map<string, { status: string, error?: string, path?: string }>();\n");
}

const exportRouteStart = code.indexOf("app.post('/api/export-video'");
const viteMiddlewareStart = code.indexOf("// Vite middleware for development");

const newExportRoute = `app.post('/api/export-video', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files) throw new Error('No files uploaded');
    const videoFile = files.find(f => f.fieldname === 'video');
    const srtFile = files.find(f => f.fieldname === 'srt');
    
    if (!videoFile) throw new Error('Missing video file');
    
    const metadataStr = req.body.metadata;
    let audioMetadata: any[] = [];
    if (metadataStr) {
      audioMetadata = JSON.parse(metadataStr);
    }
    
    const jobId = Date.now().toString();
    const outputVideoPath = path.join(os.tmpdir(), \`output_\${jobId}.mp4\`);
    
    exportJobs.set(jobId, { status: 'processing' });
    res.json({ jobId });
    
    // Process in background
    (async () => {
      try {
        let hasOriginalAudio = false;
        try {
          const { stdout } = await execAsync(\`ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "\${videoFile.path}"\`);
          if (stdout.trim().length > 0) hasOriginalAudio = true;
        } catch(e) {
          console.error("ffprobe failed", e);
        }
        
        let ffmpegCmd = \`ffmpeg -hide_banner -loglevel error -i "\${videoFile.path}" -y\`;
        let filterComplex = '';
        
        const audioFiles = files.filter(f => f.fieldname.startsWith('audio_'));
        audioFiles.forEach(f => {
           ffmpegCmd += \` -i "\${f.path}"\`;
        });
        
        let mapV = \`0:v\`;
        let mapA = '';
        
        if (audioFiles.length > 0) {
           let mixInputs = '';
           let inputCount = audioFiles.length;
           
           if (hasOriginalAudio) {
               filterComplex += \`[0:a]volume=0.1[a0]; \`;
               mixInputs += \`[a0]\`;
               inputCount += 1;
           }
           
           for (let i = 0; i < audioFiles.length; i++) {
              const af = audioFiles[i];
              const meta = audioMetadata.find(m => m.key === af.fieldname);
              let delayMs = 0;
              if (meta && meta.start) {
                const parts = meta.start.split(':');
                let totalSeconds = 0;
                if (parts.length === 3) {
                   totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2].replace(',', '.'));
                } else if (parts.length === 2) {
                   totalSeconds = parseInt(parts[0]) * 60 + parseFloat(parts[1].replace(',', '.'));
                }
                delayMs = Math.round(totalSeconds * 1000);
              }
              filterComplex += \`[\${i + 1}:a]adelay=\${delayMs}|\${delayMs}[a\${i + 1}]; \`;
              mixInputs += \`[a\${i + 1}]\`;
           }
           
           filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}:normalize=0[aout]; \`;
           mapA = \`[aout]\`;
        } else {
           if (hasOriginalAudio) {
               ffmpegCmd += \` -c:a copy\`;
               mapA = \`0:a\`;
           }
        }
        
        if (srtFile) {
           const newSrtPath = srtFile.path + '.srt';
           fs.renameSync(srtFile.path, newSrtPath);
           srtFile.path = newSrtPath;
           
           const escapedSrtPath = srtFile.path.replace(/\\\\\\\\/g, '/').replace(/'/g, "\\\\\\\\\\'").replace(/:/g, "\\\\\\\\:");
           if (audioFiles.length > 0) {
              filterComplex += \`[0:v]subtitles='\${escapedSrtPath}'[vout]\`;
              mapV = \`[vout]\`;
           } else {
              ffmpegCmd += \` -vf "subtitles='\${escapedSrtPath}'"\`;
           }
        }
        
        filterComplex = filterComplex.replace(/;\\s*$/, '');
        
        if (filterComplex) {
           ffmpegCmd += \` -filter_complex "\${filterComplex}" -map "\${mapV}"\`;
           if (mapA) {
              ffmpegCmd += \` -map "\${mapA}" -c:a aac\`;
           }
           ffmpegCmd += \` -c:v libx264 -preset veryfast -crf 28\`;
        }
        
        ffmpegCmd += \` "\${outputVideoPath}"\`;
        
        console.log('Running FFmpeg for export:', ffmpegCmd);
        
        const { stdout, stderr } = await execAsync(ffmpegCmd);
        if (stderr) console.error('FFmpeg stderr:', stderr);
        
        // Cleanup temp files
        files.forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
        
        exportJobs.set(jobId, { status: 'completed', path: outputVideoPath });
        
      } catch (err: any) {
        console.error('Export background job error:', err);
        exportJobs.set(jobId, { status: 'error', error: err.stderr || err.message });
        
        // Try cleanup
        files.forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
      }
    })();
  } catch (err: any) {
    console.error('Export upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/status/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.get('/api/export/download/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job || !job.path || !fs.existsSync(job.path)) {
    return res.status(404).send('File not found');
  }
  res.download(job.path, 'exported_video.mp4', (err) => {
    try { fs.unlinkSync(job.path); } catch(e) {}
    exportJobs.delete(req.params.jobId);
  });
});

`;

const finalCode = code.substring(0, exportRouteStart) + newExportRoute + code.substring(viteMiddlewareStart);
fs.writeFileSync('server.ts', finalCode);
