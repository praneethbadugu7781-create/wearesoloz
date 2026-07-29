const ImageKit = require("imagekit");

const publicKey = "public_tm9PNpeakMyzRgQH";
const privateKey = "private_0QljrSq6dwWWNUU7xr+SKMgQeek=";
const urlEndpoint = "https://ik.imagekit.io/wearesoloz";

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

async function run() {
  const authParams = imagekit.getAuthenticationParameters();
  console.log("Auth Params:", authParams);

  const formData = new FormData();
  // Create a Blob for file content
  const blob = new Blob(["Hello from client side test upload!"], { type: "text/plain" });
  
  formData.append("file", blob, "client_test.txt");
  formData.append("fileName", "client_test.txt");
  formData.append("publicKey", publicKey);
  formData.append("signature", authParams.signature);
  formData.append("expire", authParams.expire.toString());
  formData.append("token", authParams.token);

  try {
    console.log("Sending client-side upload via fetch...");
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData
    });
    
    console.log("Status Code:", res.status);
    const bodyText = await res.text();
    console.log("Response Body:", bodyText);
  } catch (err) {
    console.error("Network Error:", err);
  }
  process.exit(0);
}

run();
