const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        let ffmpegCmd = \`ffmpeg -nostdin -hide_banner -loglevel error -i "\${videoPath}"\`;
        let filterComplex = '';
        
        const audioFiles = files.filter(f => f.fieldname.startsWith('audio_') && fs.statSync(f.path).size > 100);
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
           
           if (inputCount === 1) { filterComplex += \`\${mixInputs}volume=1[aout]; \`; } else { filterComplex += \`\${mixInputs}amix=inputs=\${inputCount}:duration=longest[aout]; \`; }
           mapA = \`[aout]\`;
        } else {
           if (hasOriginalAudio) {
               mapA = \`0:a\`;
           }
        }
        
        let needsVideoReencode = false;
        
        if (srtFile) {
           const newSrtPath = srtFile.path + '.srt';
           fs.renameSync(srtFile.path, newSrtPath);
           srtFile.path = newSrtPath;
           
           const escapedSrtPath = srtFile.path.replace(/\\\\/g, '/').replace(/'/g, "\\\\\\'").replace(/:/g, "\\\\:");
           filterComplex += \`[0:v]subtitles='\${escapedSrtPath}'[vout]; \`;
           mapV = \`[vout]\`;
           needsVideoReencode = true;
        }
        
        filterComplex = filterComplex.replace(/;\\s*$/, '');
        
        if (filterComplex) {
           ffmpegCmd += \` -filter_complex "\${filterComplex}"\`;
        }
        
        ffmpegCmd += \` -map "\${mapV}"\`;
        if (mapA) {
           ffmpegCmd += \` -map "\${mapA}"\`;
        }
        
        if (needsVideoReencode) {
           ffmpegCmd += \` -c:v libx264 -preset ultrafast -threads 2 -crf 28 -pix_fmt yuv420p\`;
        } else {
           ffmpegCmd += \` -c:v copy\`;
        }
        
        if (audioFiles.length > 0) {
           ffmpegCmd += \` -c:a aac\`;
        } else if (hasOriginalAudio) {
           ffmpegCmd += \` -c:a copy\`;
        }
        
        ffmpegCmd += \` -y "\${outputVideoPath}"\`;
        
        console.log('Running FFmpeg for export:', ffmpegCmd);
        
        const { stdout, stderr } = await execAsync(ffmpegCmd);
        if (stderr) console.error('FFmpeg stderr:', stderr);`;

const replacementStr = `        let finalMapA = '';
        const tempMixedAudio = path.join(os.tmpdir(), \`mixed_\${jobId}.m4a\`);
        const audioFiles = files.filter(f => f.fieldname.startsWith('audio_') && fs.statSync(f.path).size > 100);
        
        // STEP 1: Mix audio if needed
        if (audioFiles.length > 0) {
           let mixCmd = \`ffmpeg -nostdin -hide_banner -loglevel error\`;
           let audioFilter = '';
           let mixInputs = '';
           let inputCount = audioFiles.length;
           
           if (hasOriginalAudio) {
               mixCmd += \` -i "\${videoPath}"\`;
               audioFilter += \`[0:a]volume=0.1[a0]; \`;
               mixInputs += \`[a0]\`;
               inputCount += 1;
           }
           
           for (let i = 0; i < audioFiles.length; i++) {
              mixCmd += \` -i "\${audioFiles[i].path}"\`;
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
              const inputIndex = hasOriginalAudio ? i + 1 : i;
              audioFilter += \`[\${inputIndex}:a]adelay=\${delayMs}|\${delayMs}[a\${inputIndex}]; \`;
              mixInputs += \`[a\${inputIndex}]\`;
           }
           
           if (inputCount === 1) { 
               audioFilter += \`\${mixInputs}volume=1[aout]\`; 
           } else { 
               audioFilter += \`\${mixInputs}amix=inputs=\${inputCount}:duration=longest,volume=\${inputCount}[aout]\`; 
           }
           
           mixCmd += \` -filter_complex "\${audioFilter}" -map "[aout]" -c:a aac -b:a 192k -y "\${tempMixedAudio}"\`;
           console.log('Running FFmpeg audio mix:', mixCmd);
           const mixResult = await execAsync(mixCmd);
           if (mixResult.stderr) console.error('FFmpeg mix stderr:', mixResult.stderr);
           
           finalMapA = '1:a';
        } else if (hasOriginalAudio) {
           finalMapA = '0:a';
        }
        
        // STEP 2: Encode Video and add Subtitles
        let needsVideoReencode = false;
        let vFilter = '';
        let mapV = '0:v';
        
        if (srtFile) {
           const newSrtPath = srtFile.path + '.srt';
           fs.renameSync(srtFile.path, newSrtPath);
           srtFile.path = newSrtPath;
           
           const escapedSrtPath = srtFile.path.replace(/\\\\/g, '/').replace(/'/g, "\\\\\\'").replace(/:/g, "\\\\:");
           vFilter = \`subtitles='\${escapedSrtPath}'\`;
           mapV = \`[vout]\`;
           needsVideoReencode = true;
        }
        
        let videoCmd = \`ffmpeg -nostdin -hide_banner -loglevel error -i "\${videoPath}"\`;
        if (audioFiles.length > 0) {
            videoCmd += \` -i "\${tempMixedAudio}"\`;
        }
        
        if (vFilter) {
            videoCmd += \` -filter_complex "\${vFilter}[vout]"\`;
        }
        
        videoCmd += \` -map "\${mapV}"\`;
        if (finalMapA) {
            videoCmd += \` -map "\${finalMapA}"\`;
        }
        
        if (needsVideoReencode) {
           videoCmd += \` -c:v libx264 -preset ultrafast -threads 1 -crf 28 -pix_fmt yuv420p\`;
        } else {
           videoCmd += \` -c:v copy\`;
        }
        
        if (audioFiles.length > 0) {
           videoCmd += \` -c:a copy\`;
        } else if (hasOriginalAudio) {
           videoCmd += \` -c:a copy\`;
        }
        
        videoCmd += \` -y "\${outputVideoPath}"\`;
        
        console.log('Running FFmpeg video export:', videoCmd);
        const { stdout, stderr } = await execAsync(videoCmd);
        if (stderr) console.error('FFmpeg video stderr:', stderr);
        
        try { fs.unlinkSync(tempMixedAudio); } catch(e) {}`;

// Normalize whitespace for easier replacement
const cleanStr = (s) => s.replace(/\s+/g, ' ');

const startIdx = code.indexOf(`let ffmpegCmd = \`ffmpeg -nostdin -hide_banner -loglevel error -i "\${videoPath}"\`;`);
const endStr = `if (stderr) console.error('FFmpeg stderr:', stderr);`;
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = code.substring(0, startIdx) + replacementStr + code.substring(endIdx + endStr.length);
    fs.writeFileSync('server.ts', newCode);
    console.log('Successfully patched server.ts');
} else {
    console.log('Failed to find replacement boundaries');
}
