const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `  const reqAwsSecretAccessKey = req.headers['x-aws-secret-access-key'] as string;`;
const rep1 = `  const reqAwsSecretAccessKey = req.headers['x-aws-secret-access-key'] as string;
  const reqAwsRegion = req.headers['x-aws-region'] as string;
  const reqAwsS3Bucket = req.headers['x-aws-s3-bucket'] as string;`;

code = code.replace(target1, rep1);

const target2 = `         const region = process.env.AWS_REGION || 'ap-southeast-2';
         const bucket = process.env.AWS_S3_BUCKET || 'elasticbeanstalk-ap-southeast-2-824353504213';`;
         
const rep2 = `         const region = reqAwsRegion || process.env.AWS_REGION || 'ap-southeast-2';
         const bucket = reqAwsS3Bucket || process.env.AWS_S3_BUCKET || 'elasticbeanstalk-ap-southeast-2-824353504213';`;

code = code.replace(target2, rep2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for 4 slots");
