const ImageKit = require("imagekit");
const https = require("https");

const publicKey = "public_tm9PNpeakMyzRgQH";
const urlEndpoint = "https://ik.imagekit.io/wearesoloz";

// We will test both keys:
const keys = {
  uppercaseQ: "private_0QljrSq6dwWWNUU7xr+SKMgQeek=",
  lowercaseQ: "private_0qljrSq6dwWWNUU7xr+SKMgQeek="
};

async function testUpload(keyName, privateKey) {
  console.log(`\nTesting client-side upload with: ${keyName} (${privateKey})`);
  
  const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  const authParams = imagekit.getAuthenticationParameters();
  
  const boundary = '----WebKitFormBoundaryTest';
  const fileContent = 'Testing client upload';
  const fileName = 'test.txt';

  const payload = [
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: text/plain\r\n\r\n${fileContent}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="fileName"\r\n\r\n${fileName}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="publicKey"\r\n\r\n${publicKey}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${authParams.signature}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="expire"\r\n\r\n${authParams.expire}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${authParams.token}\r\n`,
    `--${boundary}--\r\n`
  ].join('');

  return new Promise((resolve) => {
    const req = https.request('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        resolve(res.statusCode === 200);
      });
    });
    req.write(payload);
    req.end();
  });
}

async function run() {
  const res1 = await testUpload('uppercaseQ', keys.uppercaseQ);
  const res2 = await testUpload('lowercaseQ', keys.lowercaseQ);
  process.exit(0);
}

run();
