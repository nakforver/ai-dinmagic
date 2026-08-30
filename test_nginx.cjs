const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload-chunk?fileId=test&chunkIndex=0',
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream',
    'Content-Length': 512 * 1024
  }
}, res => {
  console.log('Status:', res.statusCode);
});
req.on('error', console.error);
req.write(Buffer.alloc(512 * 1024));
req.end();
