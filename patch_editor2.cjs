const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

// Replace the simulated progress interval
const simulateProgressTarget = `    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 99) return 99;
        return prev + 1;
      });
    }, 1500); // Slower simulated progress`;

code = code.replace(simulateProgressTarget, `    // We will poll progress from server`);

// Replace the poll status handling
const statusPollTarget = `        const statusData = await statusRes.json();
        
        if (statusData.status === 'completed') {
           setExportProgress(100);
           setDownloadUrl(\`/api/export/download/\${jobId}?filename=\${encodeURIComponent(baseName + '_khmer.mp4')}\`);
           break;
        } else if (statusData.status === 'error') {
           throw new Error(statusData.error || 'បរាជ័យក្នុងការបំប្លែងវីដេអូ');
        }`;

const statusPollReplacement = `        const statusData = await statusRes.json();
        
        if (statusData.progress) {
            setExportProgress(statusData.progress);
        }
        
        if (statusData.status === 'completed') {
           setExportProgress(100);
           // Force a fresh URL with timestamp to prevent cache issues
           const version = Date.now();
           setDownloadUrl(\`/api/export/download/\${jobId}?filename=\${encodeURIComponent(baseName + '_khmer.mp4')}&v=\${version}\`);
           break;
        } else if (statusData.status === 'error') {
           throw new Error(statusData.error || 'បរាជ័យក្នុងការបំប្លែងវីដេអូ');
        }`;

code = code.replace(statusPollTarget, statusPollReplacement);

fs.writeFileSync('src/components/Editor.tsx', code);
console.log("Patched Editor.tsx for progress polling");
