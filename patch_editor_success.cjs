const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const targetStr = "        {isExporting && (";
const successOverlay = `        {downloadUrl && !isExporting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in rounded-2xl">
             <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center mb-6 border border-green-500/30">
                <CheckCircle2 size={40} className="text-green-500" />
             </div>
             <h3 className="text-2xl font-semibold text-white mb-2">ជោគជ័យ! (Success)</h3>
             <p className="text-gray-400 mb-8 max-w-sm text-center">វីដេអូរបស់អ្នកត្រូវបាននាំចេញដោយជោគជ័យ។ អ្នកអាចទាញយកវាឥឡូវនេះបាន។</p>
             <div className="flex gap-4">
                <a href={downloadUrl} target="_top" download>
                  <button className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition flex items-center gap-2">
                     <Download size={20} /> ទាញយកវីដេអូ
                  </button>
                </a>
                <button onClick={() => setDownloadUrl(null)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition">
                   បិទ (Close)
                </button>
             </div>
          </div>
        )}\n`;

code = code.replace(targetStr, successOverlay + targetStr);

fs.writeFileSync('src/components/Editor.tsx', code);
console.log("Success UI injected!");
