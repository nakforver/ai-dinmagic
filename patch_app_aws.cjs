const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const [awsAccessKeyId, setAwsAccessKeyId] = useState(localStorage.getItem('aws_access_key_id') || '');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState(localStorage.getItem('aws_secret_access_key') || '');`;

const rep1 = `  const [awsAccessKeyId, setAwsAccessKeyId] = useState(localStorage.getItem('aws_access_key_id') || '');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState(localStorage.getItem('aws_secret_access_key') || '');
  const [awsRegion, setAwsRegion] = useState(localStorage.getItem('aws_region') || 'ap-southeast-2');
  const [awsS3Bucket, setAwsS3Bucket] = useState(localStorage.getItem('aws_s3_bucket') || '');`;

code = code.replace(target1, rep1);

const target2 = `  const saveAwsSecretAccessKey = (key: string) => {
    setAwsSecretAccessKey(key);
    localStorage.setItem('aws_secret_access_key', key);
  };`;

const rep2 = `  const saveAwsSecretAccessKey = (key: string) => {
    setAwsSecretAccessKey(key);
    localStorage.setItem('aws_secret_access_key', key);
  };
  
  const saveAwsRegion = (val: string) => {
    setAwsRegion(val);
    localStorage.setItem('aws_region', val);
  };
  
  const saveAwsS3Bucket = (val: string) => {
    setAwsS3Bucket(val);
    localStorage.setItem('aws_s3_bucket', val);
  };`;

code = code.replace(target2, rep2);

const target3 = `            awsAccessKeyId={awsAccessKeyId}
            awsSecretAccessKey={awsSecretAccessKey}`;

const rep3 = `            awsAccessKeyId={awsAccessKeyId}
            awsSecretAccessKey={awsSecretAccessKey}
            awsRegion={awsRegion}
            awsS3Bucket={awsS3Bucket}`;

code = code.replace(target3, rep3);

const target4 = `            awsAccessKeyId={awsAccessKeyId}
            setAwsAccessKeyId={saveAwsAccessKeyId}
            awsSecretAccessKey={awsSecretAccessKey}
            setAwsSecretAccessKey={saveAwsSecretAccessKey}`;

const rep4 = `            awsAccessKeyId={awsAccessKeyId}
            setAwsAccessKeyId={saveAwsAccessKeyId}
            awsSecretAccessKey={awsSecretAccessKey}
            setAwsSecretAccessKey={saveAwsSecretAccessKey}
            awsRegion={awsRegion}
            setAwsRegion={saveAwsRegion}
            awsS3Bucket={awsS3Bucket}
            setAwsS3Bucket={saveAwsS3Bucket}`;

code = code.replace(target4, rep4);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for 4 slots");
