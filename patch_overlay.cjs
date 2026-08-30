const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const target = `<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in rounded-2xl">`;
const replacement = `<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in rounded-2xl overflow-y-auto p-6">
             <div className="flex flex-col items-center justify-center w-full min-h-min my-auto">`;

const targetEnd = `             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                   onClick={async () => {`;

const replacementEnd = `             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                   onClick={async () => {`;                   

if (code.includes(target)) {
    code = code.replace(target, replacement);
    // Add closing div
    code = code.replace(`</button>\n             </div>\n          </div>\n        )}`, `</button>\n             </div>\n             </div>\n          </div>\n        )}`);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx overlay CSS");
} else {
    console.log("Target not found");
}
