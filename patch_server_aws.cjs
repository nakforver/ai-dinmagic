const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const apiKey = req.headers['x-api-key'] as string; // Optional user key from headers`;
const replacement1 = `const apiKey = req.headers['x-api-key'] as string; // Optional user key from headers
  const reqAwsAccessKeyId = req.headers['x-aws-access-key-id'] as string;
  const reqAwsSecretAccessKey = req.headers['x-aws-secret-access-key'] as string;`;

code = code.replace(target1, replacement1);

const target2 = `         const awsConfig = {
           region,
           credentials: {
             accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
           }
         };`;

const replacement2 = `         const awsConfig = {
           region,
           credentials: {
             accessKeyId: reqAwsAccessKeyId || process.env.AWS_ACCESS_KEY_ID || '',
             secretAccessKey: reqAwsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || ''
           }
         };`;

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts AWS config");
} else {
    console.log("Could not find target block in server.ts");
}
