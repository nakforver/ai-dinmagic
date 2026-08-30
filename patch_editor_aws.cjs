const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const targetProps = `  awsAccessKeyId: string;
  awsSecretAccessKey: string;`;

const repProps = `  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsS3Bucket: string;`;

code = code.replace(targetProps, repProps);

const targetSig = `export default function Editor({ onNavigate, videoFile, apiKey, awsAccessKeyId, awsSecretAccessKey, voice, model }: EditorProps) {`;

const repSig = `export default function Editor({ onNavigate, videoFile, apiKey, awsAccessKeyId, awsSecretAccessKey, awsRegion, awsS3Bucket, voice, model }: EditorProps) {`;

code = code.replace(targetSig, repSig);

const targetHeaders = `      if (awsSecretAccessKey) {
        headers['x-aws-secret-access-key'] = awsSecretAccessKey;
      }`;

const repHeaders = `      if (awsSecretAccessKey) {
        headers['x-aws-secret-access-key'] = awsSecretAccessKey;
      }
      if (awsRegion) {
        headers['x-aws-region'] = awsRegion;
      }
      if (awsS3Bucket) {
        headers['x-aws-s3-bucket'] = awsS3Bucket;
      }`;

code = code.replace(targetHeaders, repHeaders);

fs.writeFileSync('src/components/Editor.tsx', code);
console.log("Patched Editor.tsx for 4 slots");
