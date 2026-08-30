const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const target = `                      const res = await fetch(downloadUrl);
                      const blob = await res.blob();
                      const file = new File([blob], 'exported_video_khmer.mp4', { type: 'video/mp4' });`;

const replacement = `                      const res = await fetch(downloadUrl);
                      if (!res.ok) {
                         alert("រកមិនឃើញវីដេអូទេ (Server អាចនឹង Restart)។ សូម Export ម្តងទៀត។");
                         return;
                      }
                      const blob = await res.blob();
                      const file = new File([blob], 'exported_video_khmer.mp4', { type: 'video/mp4' });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx download error handling");
} else {
    console.log("Target not found");
}
