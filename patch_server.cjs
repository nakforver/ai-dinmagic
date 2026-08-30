const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the ffmpeg execution block in server.ts
const targetBlockStart = `        console.log('Running FFmpeg video export:', videoCmd);`;
const targetBlockEnd = `        exportJobs.set(jobId, { status: 'completed', path: outputVideoPath });`;

const newBlock = `
        console.log('Running FFmpeg video export:', videoCmd);
        const tempOutputVideoPath = path.join(os.tmpdir(), \`.final_\${jobId}.tmp.mp4\`);
        videoCmd = videoCmd.replace(\`"\${outputVideoPath}"\`, \`"\${tempOutputVideoPath}"\`);
        
        exportJobs.set(jobId, { status: 'processing', progress: 10 });
        
        await new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            // use shell for easier parsing of the command
            const child = spawn(videoCmd, { shell: true });
            
            child.stderr.on('data', (data) => {
                const str = data.toString();
                if (str.includes('time=')) {
                    // Try to extract time=HH:MM:SS.ms
                    const match = str.match(/time=(\\d+):(\\d+):(\\d+\\.\\d+)/);
                    if (match) {
                        exportJobs.set(jobId, { status: 'processing', progress: 50 });
                    }
                }
            });
            
            child.on('close', (code) => {
                if (code === 0) resolve(true);
                else reject(new Error('FFmpeg exited with code ' + code));
            });
            child.on('error', reject);
        });

        exportJobs.set(jobId, { status: 'processing', progress: 90 });
        
        // Validate with ffprobe
        const { stdout: probeOut } = await execAsync(\`ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1:nokey=1 "\${tempOutputVideoPath}"\`);
        const [duration, size] = probeOut.trim().split('\\n').map(Number);
        
        if (!duration || duration <= 0 || !size || size <= 0) {
            throw new Error('Export validation failed: invalid duration or size');
        }
        
        fs.renameSync(tempOutputVideoPath, outputVideoPath);
        exportJobs.set(jobId, { status: 'completed', path: outputVideoPath, progress: 100 });
`;

if (code.includes(targetBlockStart) && code.includes(targetBlockEnd)) {
    const startIdx = code.indexOf(targetBlockStart);
    const endIdx = code.indexOf(targetBlockEnd) + targetBlockEnd.length;
    code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with atomic write and ffprobe validation");
} else {
    console.log("Could not find target block in server.ts");
}
