const crypto = require('crypto');
const ImageKit = require('imagekit');

const privateKey = 'private_0QljrSq6dwWWNUU7xr+SKMgQeek=';
const publicKey = 'public_tm9PNpeakMyzRgQH';
const urlEndpoint = 'https://ik.imagekit.io/wearesoloz';

const token = 'bacb92e7-c28b-4124-ab27-9b60be78542c';
const expire = 1784305736;

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

// Calculate using SDK
const sdkParams = imagekit.getAuthenticationParameters(token, expire);
console.log('SDK computed signature:', sdkParams.signature);

// Calculate using crypto manual
const manualSignature = crypto
  .createHmac('sha1', privateKey)
  .update(token + expire)
  .digest('hex');
console.log('Manual HMAC-SHA1 signature:', manualSignature);

// The signature from live backend was '70fecb584a040a11a19978b9228ea0f67b1866bd'
console.log('Did SDK match backend?', sdkParams.signature === '70fecb584a040a11a19978b9228ea0f67b1866bd');
