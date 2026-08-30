const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const target = `          if (newLines.length === 0) {
             throw new Error('មិនមានសំឡេងនៅក្នុងវីដេអូ ឬប្រព័ន្ធមិនអាចស្តាប់បានច្បាស់។ (No speech detected)');
          }`;

const replacement = `          // Server will handle 0 lines check`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx back");
} else {
    console.log("Target not found in Editor.tsx");
}
