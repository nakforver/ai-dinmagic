const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const target = `<h3 className="text-2xl font-semibold text-white mb-2">ជោគជ័យ! (Success)</h3>
             <p className="text-gray-400 mb-8 max-w-sm text-center">វីដេអូរបស់អ្នកត្រូវបាននាំចេញដោយជោគជ័យ។ អ្នកអាចទាញយកវាឥឡូវនេះបាន។</p>`;

const replacement = `<h3 className="text-2xl font-semibold text-white mb-2">ជោគជ័យ! (Success)</h3>
             <p className="text-gray-400 mb-6 max-w-sm text-center">វីដេអូរបស់អ្នកត្រូវបាននាំចេញរួចរាល់។ សូមចុច "រក្សាទុក" ឬចុចឱ្យយូរលើវីដេអូដើម្បី Save។</p>
             <video src={downloadUrl} controls className="w-full max-w-xs rounded-xl shadow-xl border border-gray-700/50 mb-6 bg-black" playsInline></video>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched video preview");
} else {
    console.log("Target not found");
}
