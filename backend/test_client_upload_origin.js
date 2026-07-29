const ImageKit = require("imagekit");
const https = require("https");

const publicKey = "public_tm9PNpeakMyzRgQH";
const privateKey = "private_0QljrSq6dwWWNUU7xr+SKMgQeek=";
const urlEndpoint = "https://ik.imagekit.io/wearesoloz";

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

async function testUploadWithHeaders(origin, referer) {
  console.log(`\nTesting client-side upload with Origin: "${origin}" and Referer: "${referer}"`);
  
  const authParams = imagekit.getAuthenticationParameters();
  
  const boundary = '----WebKitFormBoundaryTest';
  const fileContent = 'Testing client upload with origin headers';
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

  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(payload)
  };

  if (origin) headers['Origin'] = origin;
  if (referer) headers['Referer'] = referer;

  return new Promise((resolve) => {
    const req = https.request('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: headers
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
  // Test 1: No Origin/Referer
  await testUploadWithHeaders(null, null);

  // Test 2: www.wearesoloz.com
  await testUploadWithHeaders('https://www.wearesoloz.com', 'https://www.wearesoloz.com/');

  // Test 3: wearesoloz.com
  await testUploadWithHeaders('https://wearesoloz.com', 'https://wearesoloz.com/');

  // Test 4: localhost:3000
  await testUploadWithHeaders('http://localhost:3000', 'http://localhost:3000/');

  process.exit(0);
}

run();
