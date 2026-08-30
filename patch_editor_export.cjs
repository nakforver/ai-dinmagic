const fs = require('fs');

let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const oldFetch = `      const res = await fetch('/api/export-video', {
         method: 'POST',
         body: formData
      });
      
      if (!res.ok) {
         let errMsg = 'បរាជ័យក្នុងការបំប្លែងវីដេអូ';
         try {
            const errData = await res.json();
            if (errData.error) errMsg = errData.error;
         } catch(e) {}
         throw new Error(errMsg);
      }
      
      setExportProgress(100);
      const videoBlob = await res.blob();
      saveAs(videoBlob, \`\${baseName}_khmer.mp4\`);`;

const newFetch = `      const res = await fetch('/api/export-video', {
         method: 'POST',
         body: formData
      });
      
      if (!res.ok) {
         let errMsg = 'បរាជ័យក្នុងការបំប្លែងវីដេអូ';
         try {
            const errData = await res.json();
            if (errData.error) errMsg = errData.error;
         } catch(e) {}
         throw new Error(errMsg);
      }
      
      const { jobId } = await res.json();
      
      // Poll for status
      while (true) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(\`/api/export/status/\${jobId}\`);
        if (!statusRes.ok) throw new Error('បរាជ័យក្នុងការត្រួតពិនិត្យដំណើរការ');
        const statusData = await statusRes.json();
        
        if (statusData.status === 'completed') {
           setExportProgress(100);
           // Download it by triggering a link
           const a = document.createElement('a');
           a.href = \`/api/export/download/\${jobId}\`;
           a.download = \`\${baseName}_khmer.mp4\`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           break;
        } else if (statusData.status === 'error') {
           throw new Error(statusData.error || 'បរាជ័យក្នុងការបំប្លែងវីដេអូ');
        }
      }`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/components/Editor.tsx', code);
