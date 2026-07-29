const https = require('https');

const req = https.request('https://wearesoloz.onrender.com/api/upload/signature-public', {
  method: 'POST',
}, (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => {
    console.log('RESPONSE:', data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
