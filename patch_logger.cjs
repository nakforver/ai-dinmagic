const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loggerFunc = `
function logFfmpegDiagnostic(stepName, command, error, stderr, stdout) {
  const timestamp = new Date().toISOString();
  console.error(\`\\n[FFMPEG DIAGNOSTIC LOG - \${timestamp}]\`);
  console.error(\`STEP: \${stepName}\`);
  console.error(\`COMMAND: \${command}\`);
  if (error) {
    console.error(\`ERROR OBJECT: \${error.message || error}\`);
  }
  if (stderr) {
    console.error(\`STDERR:\\n\${stderr}\`);
  }
  if (stdout) {
    console.error(\`STDOUT:\\n\${stdout}\`);
  }
  console.error(\`[END FFMPEG DIAGNOSTIC]\\n\`);
}

const app = express();`;

code = code.replace(`const app = express();`, loggerFunc);

const processInBackgroundTarget = `    // Process in background
    (async () => {
      try {
        let hasOriginalAudio = false;
        try {
          const { stdout } = await execAsync(\`ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "\${videoPath}"\`);
          if (stdout.trim().length > 0) hasOriginalAudio = true;
        } catch(e) {
          console.error("ffprobe failed", e);
        }`;

const processInBackgroundReplacement = `    // Process in background
    (async () => {
      let currentCmd = '';
      try {
        let hasOriginalAudio = false;
        try {
          currentCmd = \`ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "\${videoPath}"\`;
          const { stdout } = await execAsync(currentCmd);
          if (stdout.trim().length > 0) hasOriginalAudio = true;
        } catch(e) {
          logFfmpegDiagnostic('ffprobe (check original audio)', currentCmd, e, e.stderr, e.stdout);
        }`;

code = code.replace(processInBackgroundTarget, processInBackgroundReplacement);

const mixTarget = `           try {
               mixResult = await execAsync(mixCmd);
               if (mixResult.stderr) console.error('FFmpeg mix stderr:', mixResult.stderr);
           } catch(e) {
               console.error('FFmpeg mix ERROR:', e.stderr || e.message);
               throw new Error('FFmpeg error: ' + (e.stderr || e.message).substring(0, 500));
           }`;

const mixReplacement = `           try {
               currentCmd = mixCmd;
               mixResult = await execAsync(mixCmd);
               if (mixResult.stderr) logFfmpegDiagnostic('ffmpeg (audio mix warning)', mixCmd, null, mixResult.stderr, mixResult.stdout);
           } catch(e) {
               logFfmpegDiagnostic('ffmpeg (audio mix failure)', mixCmd, e, e.stderr, e.stdout);
               throw new Error('FFmpeg mix error: ' + (e.stderr || e.message).substring(0, 500));
           }`;

code = code.replace(mixTarget, mixReplacement);


const spawnTarget = `                await new Promise((resolve, reject) => {
            
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
        });`;

const spawnReplacement = `                await new Promise((resolve, reject) => {
            currentCmd = videoCmd;
            // use shell for easier parsing of the command
            const child = spawn(videoCmd, { shell: true });
            let fullStderr = '';
            let fullStdout = '';
            
            child.stdout.on('data', (data) => {
                fullStdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                const str = data.toString();
                fullStderr += str;
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
                else reject({ message: 'FFmpeg exited with code ' + code, stderr: fullStderr, stdout: fullStdout, code });
            });
            child.on('error', (err) => reject({ message: err.message, stderr: fullStderr, stdout: fullStdout, code: -1 }));
        });`;

code = code.replace(spawnTarget, spawnReplacement);

const ffprobeValidateTarget = `        // Validate with ffprobe
        const { stdout: probeOut } = await execAsync(\`ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1:nokey=1 "\${tempOutputVideoPath}"\`);
        const [duration, size] = probeOut.trim().split('\\n').map(Number);
        
        if (!duration || duration <= 0 || !size || size <= 0) {
            throw new Error('Export validation failed: invalid duration or size');
        }`;
        
const ffprobeValidateReplacement = `        // Validate with ffprobe
        currentCmd = \`ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1:nokey=1 "\${tempOutputVideoPath}"\`;
        try {
          const { stdout: probeOut } = await execAsync(currentCmd);
          const [duration, size] = probeOut.trim().split('\\n').map(Number);
          
          if (!duration || duration <= 0 || !size || size <= 0) {
              throw new Error('Export validation failed: invalid duration or size');
          }
        } catch (e) {
          logFfmpegDiagnostic('ffprobe (validate output)', currentCmd, e, e.stderr, e.stdout);
          throw e;
        }`;

code = code.replace(ffprobeValidateTarget, ffprobeValidateReplacement);

const catchTarget = `      } catch (err: any) {
        console.error('Export background job error:', err);
        exportJobs.set(jobId, { status: 'error', error: \`FFMPEG_ERROR: \${err.stderr ? err.stderr.toString() : err.message}\` });`;

const catchReplacement = `      } catch (err: any) {
        logFfmpegDiagnostic('ffmpeg (video export or overall failure)', currentCmd, err, err.stderr, err.stdout);
        exportJobs.set(jobId, { status: 'error', error: \`FFMPEG_ERROR: \${err.stderr ? err.stderr.toString().substring(0, 200) : err.message}\` });`;

code = code.replace(catchTarget, catchReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with logger");
