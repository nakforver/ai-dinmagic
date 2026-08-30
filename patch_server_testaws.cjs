const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/debug/jobs', (req, res) => {`;
const replacement = `app.post('/api/test-aws', async (req, res) => {
    try {
        const reqAwsAccessKeyId = req.headers['x-aws-access-key-id'] || '';
        const reqAwsSecretAccessKey = req.headers['x-aws-secret-access-key'] || '';
        const reqAwsRegion = req.headers['x-aws-region'] || 'ap-southeast-2';
        const reqAwsS3Bucket = req.headers['x-aws-s3-bucket'] || '';

        if (!reqAwsAccessKeyId || !reqAwsSecretAccessKey || !reqAwsS3Bucket) {
            return res.status(400).json({ error: 'សូមបំពេញ AWS Keys និង S3 Bucket ឱ្យបានពេញលេញសិន' });
        }

        const awsConfig = {
            region: reqAwsRegion,
            credentials: {
                accessKeyId: reqAwsAccessKeyId,
                secretAccessKey: reqAwsSecretAccessKey
            }
        };

        const s3Client = new S3Client(awsConfig);
        
        // Try to list objects in the bucket to test credentials and bucket access
        const testCommand = new ListObjectsV2Command({ Bucket: reqAwsS3Bucket, MaxKeys: 1 });
        await s3Client.send(testCommand);

        res.json({ success: true, message: 'AWS Keys និង Bucket របស់អ្នកត្រឹមត្រូវ អាចប្រើបាន!' });
    } catch (e) {
        console.error('AWS Test Error:', e);
        res.status(400).json({ error: 'បញ្ហាភ្ជាប់ទៅ AWS: ' + e.message });
    }
});

app.get('/api/debug/jobs', (req, res) => {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with /api/test-aws");
} else {
    console.log("Target not found");
}
