const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const targetBlock = `      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }`;

const newBlock = `      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      if (awsAccessKeyId) {
        headers['x-aws-access-key-id'] = awsAccessKeyId;
      }
      if (awsSecretAccessKey) {
        headers['x-aws-secret-access-key'] = awsSecretAccessKey;
      }`;

if (code.includes(targetBlock)) {
    code = code.replace(targetBlock, newBlock);
    fs.writeFileSync('src/components/Editor.tsx', code);
    console.log("Patched Editor.tsx headers");
} else {
    console.log("Could not find target block");
}
