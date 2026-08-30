const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

// Disable Export button if exporting
code = code.replace(
    /disabled={lines.length === 0}/,
    `disabled={lines.length === 0 || isExporting}`
);

// We need to render the video properly, add autoPlay to the download video
code = code.replace(
    `<video src={downloadUrl} controls className="w-full h-full object-contain" />`,
    `<video src={downloadUrl} controls className="w-full h-full object-contain" autoPlay onLoadedMetadata={(e) => console.log('Video loaded, duration:', e.currentTarget.duration)} onError={(e) => console.error('Video error:', e)} />`
);

fs.writeFileSync('src/components/Editor.tsx', code);
console.log("Patched Editor.tsx");
