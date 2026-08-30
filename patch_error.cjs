const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      // Clean up
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);`;

const replacement = `      if (lines.length === 0) {
          throw new Error('ការបកប្រែទទួលបានអក្សរទទេ (0 lines) ពីប្រព័ន្ធ។ សូមសាកល្បងកាត់វីដេអូជាចំណែកខ្លីៗ។ Data: ' + responseText.substring(0, 100));
      }
      
      // Clean up
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched zero lines error");
} else {
    console.log("Target not found");
}
