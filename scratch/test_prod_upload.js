const https = require('https');

// 1. Get signature from production server
console.log('Fetching signature from production backend...');
const reqSig = https.request('https://wearesoloz.onrender.com/api/upload/signature-public', {
  method: 'POST'
}, (resSig) => {
  let data = '';
  resSig.on('data', (d) => data += d);
  resSig.on('end', () => {
    const params = JSON.parse(data);
    console.log('Signature Parameters Received:', params);
    
    // 2. Upload to ImageKit using these parameters
    performUpload(params);
  });
});
reqSig.end();

function performUpload(params) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fileContent = 'Dummy proof of document upload data';
  const fileName = 'proof.txt';

  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: text/plain\r\n\r\n${fileContent}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="fileName"\r\n\r\n${fileName}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="publicKey"\r\n\r\n${params.publicKey}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${params.signature}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="expire"\r\n\r\n${params.expire}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${params.token}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n/wearesoloz\r\n`,
    `--${boundary}--\r\n`
  ];

  const payload = parts.join('');

  console.log('Sending upload request to ImageKit upload API...');
  const reqUpload = https.request('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (resUpload) => {
    console.log('ImageKit Status Code:', resUpload.statusCode);
    let data = '';
    resUpload.on('data', (d) => data += d);
    resUpload.on('end', () => {
      console.log('ImageKit Response Body:', data);
    });
  });

  reqUpload.on('error', (e) => {
    console.error('Request Error:', e);
  });

  reqUpload.write(payload);
  reqUpload.end();
}
