const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const target = `          setLines(newLines);
          setTranscribeProgress(100);
          setTranscribeStatus('រួចរាល់!');
          isDone = true;`;

const replacement = `          setLines(newLines);
          setTranscribeProgress(100);
          setTranscribeStatus('រួចរាល់!');
          if (newLines.length === 0) {
             throw new Error('មិនមានសំឡេងនៅក្នុងវីដេអូ ឬប្រព័ន្ធមិនអាចស្តាប់បានច្បាស់។ (No speech detected)');
          }
          isDone = true;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx for empty lines");
} else {
    console.log("Target block not found");
}
