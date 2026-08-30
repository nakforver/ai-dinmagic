const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cleanupCode = `      // Cleanup temp files
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (srtFile && fs.existsSync(srtFile.path + '.srt')) fs.unlinkSync(srtFile.path + '.srt');
      if (fs.existsSync(tempMixedAudio)) fs.unlinkSync(tempMixedAudio);
      audioFiles.forEach(f => {
         if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });`;

const newCatch = `    } catch (error: any) {
      console.error('Export error:', error);
      let errorMessage = error.message;
      exportJobs.set(jobId, { status: 'error', error: errorMessage });
      
      // Cleanup temp files on error
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (srtFile && fs.existsSync(srtFile.path + '.srt')) fs.unlinkSync(srtFile.path + '.srt');
      if (srtFile && fs.existsSync(srtFile.path)) fs.unlinkSync(srtFile.path);
      if (audioFiles) {
         audioFiles.forEach(f => {
            if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
         });
      }
    }`;

code = code.replace(/    } catch \(error: any\) {[\s\S]*?exportJobs\.set.*?;\n    }/, newCatch);
fs.writeFileSync('server.ts', code);
console.log("Patched cleanup");
