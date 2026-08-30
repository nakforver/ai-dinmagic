const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

if (!code.includes('const [downloadUrl, setDownloadUrl] = useState<string | null>(null);')) {
    // Add state
    code = code.replace(
        'const [exportProgress, setExportProgress] = useState(0);',
        'const [exportProgress, setExportProgress] = useState(0);\n  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);'
    );
    
    // Set the url on complete
    code = code.replace(
        'a.href = `/api/export/download/${jobId}`;',
        'a.href = `/api/export/download/${jobId}`;\n           setDownloadUrl(`/api/export/download/${jobId}`);'
    );
    
    // Add the download link in the UI next to the "នាំចេញវីដេអូ" button
    const targetUI = `<Button\n              onClick={handleExport}\n              disabled={isExporting || isTranslating || subtitles.length === 0}\n              className="flex-1"\n            >\n              {isExporting ? \`កំពុងនាំចេញ... \${exportProgress}%\` : 'នាំចេញវីដេអូ'}\n            </Button>`;
    const replacementUI = `<div className="flex gap-2 w-full">\n            <Button\n              onClick={handleExport}\n              disabled={isExporting || isTranslating || subtitles.length === 0}\n              className="flex-1"\n            >\n              {isExporting ? \`កំពុងនាំចេញ... \${exportProgress}%\` : 'នាំចេញវីដេអូ'}\n            </Button>\n            {downloadUrl && (\n              <a href={downloadUrl} target="_top" download>\n                 <Button variant="secondary" className="flex-1 border border-green-500 text-green-600 hover:bg-green-50">\n                    ទាញយកឥឡូវនេះ (Download)\n                 </Button>\n              </a>\n            )}\n            </div>`;
    
    code = code.replace(targetUI, replacementUI);
    
    // Also reset downloadUrl on new export
    code = code.replace(
        'setTranscribeError(null);',
        'setTranscribeError(null);\n    setDownloadUrl(null);'
    );
    
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx for manual download button!");
}
