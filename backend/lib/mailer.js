// backend/lib/mailer.js
const { connectDB } = require("./db");
const User = require("../models/User");

async function getAdminEmail() {
  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin" }).lean();
    if (admin && admin.email) {
      return admin.email;
    }
  } catch (error) {
    console.error("Failed to fetch admin email from DB:", error);
  }
  return process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com";
}

async function sendResendEmail({ to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY not configured. Email notification skipped.");
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `WeAreSoloz <${fromEmail}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Resend");
    }

    console.log("📨 Email sent successfully via Resend API:", data.id);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email via Resend API:", error);
    return false;
  }
}

async function sendContactEmail(contactData) {
  const adminEmail = await getAdminEmail();
  
  const subject = `New Contact/Booking Enquiry from ${contactData.fullName}`;
  const text = `
You have received a new inquiry on WeAreSoloz:

Name: ${contactData.fullName}
Mobile (WhatsApp): ${contactData.mobile}
Email: ${contactData.email}
Destination of Interest: ${contactData.destination || "General / Other"}
Message:
${contactData.message}

---
Sent automatically by WeAreSoloz Server.
  `;
  const html = `
    <h3>New Inquiry Received</h3>
    <p><strong>Name:</strong> ${contactData.fullName}</p>
    <p><strong>Mobile (WhatsApp):</strong> ${contactData.mobile}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    <p><strong>Destination:</strong> ${contactData.destination || "General / Other"}</p>
    <p><strong>Message:</strong></p>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ff7a1a; padding: 10px; margin: 10px 0;">
      ${contactData.message.replace(/\n/g, "<br>")}
    </blockquote>
  `;

  return sendResendEmail({ to: adminEmail, subject, text, html });
}

async function sendCareerEmail(careerData) {
  const adminEmail = await getAdminEmail();

  const subject = `New Careers Application from ${careerData.fullName}`;
  const text = `
You have received a new Careers application on WeAreSoloz:

Name: ${careerData.fullName}
Gender: ${careerData.gender}
Age: ${careerData.age}
Mobile (WhatsApp): ${careerData.mobile}
Email: ${careerData.email}
Instagram: ${careerData.instagram || "Not provided"}

Travel Experience:
${careerData.experience}

Why they want to join/travel:
${careerData.whyJoin}

---
Sent automatically by WeAreSoloz Server.
  `;
  const html = `
    <h3>New Careers Application Received</h3>
    <p><strong>Name:</strong> ${careerData.fullName}</p>
    <p><strong>Gender:</strong> ${careerData.gender}</p>
    <p><strong>Age:</strong> ${careerData.age}</p>
    <p><strong>Mobile (WhatsApp):</strong> ${careerData.mobile}</p>
    <p><strong>Email:</strong> ${careerData.email}</p>
    <p><strong>Instagram:</strong> ${careerData.instagram || "Not provided"}</p>
    <p><strong>Travel Experience:</strong></p>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ff7a1a; padding: 10px; margin: 10px 0;">
      ${careerData.experience.replace(/\n/g, "<br>")}
    </blockquote>
    <p><strong>Why they want to travel/work:</strong></p>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ea580c; padding: 10px; margin: 10px 0;">
      ${careerData.whyJoin.replace(/\n/g, "<br>")}
    </blockquote>
  `;

  return sendResendEmail({ to: adminEmail, subject, text, html });
}

async function sendOtpEmail(email, otpCode) {
  const subject = "Your Admin Password Reset OTP";
  const text = `Your OTP code for resetting the admin password is: ${otpCode}. It is valid for 10 minutes.`;
  const html = `
    <h3>Admin Password Reset Request</h3>
    <p>You requested to reset your admin passcode. Use the following One-Time Password (OTP) to complete the reset process:</p>
    <h2 style="letter-spacing: 4px; font-size: 32px; color: #ea580c; font-family: monospace; background: #f9f9f9; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #eee;">${otpCode}</h2>
    <p>This code is valid for <strong>10 minutes</strong>.</p>
    <p>If you did not request this, please secure your admin credentials.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
    <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
  `;

  return sendResendEmail({ to: email, subject, text, html });
}

async function sendEmailChangeOtp(email, otpCode) {
  const subject = "Verify Your New Admin Email Address";
  const text = `Your OTP code to verify and update your admin email address is: ${otpCode}. It is valid for 10 minutes.`;
  const html = `
    <h3>Admin Email Verification Request</h3>
    <p>You requested to change your admin email address. Use the following One-Time Password (OTP) to verify that you own this email address and complete the update:</p>
    <h2 style="letter-spacing: 4px; font-size: 32px; color: #ea580c; font-family: monospace; background: #f9f9f9; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #eee;">${otpCode}</h2>
    <p>This code is valid for <strong>10 minutes</strong>.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
    <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
  `;

  return sendResendEmail({ to: email, subject, text, html });
}

async function sendEmailChangeInitiatedAlert(oldEmail, newEmail) {
  const subject = "Security Alert: Admin Email Change Initiated";
  const text = `An email change request has been initiated for your admin account. The proposed new email is: ${newEmail}. If you did not request this change, please contact support and update your passcode immediately.`;
  const html = `
    <h3 style="color: #ea580c;">Security Alert: Email Change Initiated</h3>
    <p>An email change request was initiated for your WeAreSoloz admin account.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #666;">Current Email:</td>
        <td style="padding: 6px 0; font-weight: bold;">${oldEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666;">Requested New Email:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #ea580c;">${newEmail}</td>
      </tr>
    </table>
    <p>A 6-digit verification code has been sent to the new email address to complete this request.</p>
    <div style="background: #fff5eb; border-left: 4px solid #ea580c; padding: 12px; border-radius: 4px; margin: 15px 0;">
      <p style="margin: 0; font-size: 13px; color: #c2410c; font-weight: 500;">
        <strong>Important:</strong> If you did not authorize this request, please change your admin passcode immediately to secure your account.
      </p>
    </div>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
    <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
  `;

  return sendResendEmail({ to: oldEmail, subject, text, html });
}

async function sendEmailChangeCompletedAlert(oldEmail, newEmail) {
  const subject = "Security Alert: Admin Email Change Completed";
  const text = `The email address associated with your admin account has been successfully changed from ${oldEmail} to ${newEmail}. If you did not make this change, please contact support immediately.`;
  const html = `
    <h3 style="color: #16a34a;">Security Alert: Email Change Completed</h3>
    <p>The email address associated with your WeAreSoloz admin account has been successfully updated.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #666;">Previous Email:</td>
        <td style="padding: 6px 0; font-weight: bold; text-decoration: line-through;">${oldEmail}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666;">New Active Email:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #16a34a;">${newEmail}</td>
      </tr>
    </table>
    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; border-radius: 4px; margin: 15px 0;">
      <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 500;">
        You will need to use this new email address to log in to the admin console in the future.
      </p>
    </div>
    <p style="color: #dc2626; font-size: 13px; font-weight: bold; margin-top: 15px;">
      If you did not authorize this change, please contact support immediately to recover your account.
    </p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
    <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
  `;

  return sendResendEmail({ to: oldEmail, subject, text, html });
}

async function sendFarmerApplicationEmail(farmerData) {
  const adminEmail = await getAdminEmail();

  const subject = `New Farmer Free Trip Application from ${farmerData.fullName}`;
  const text = `
You have received a new Farmer Free-Trip application on WeAreSoloz:

Name: ${farmerData.fullName}
Gender: ${farmerData.gender}
Age: ${farmerData.age}
Mobile (WhatsApp): ${farmerData.mobile}
State: ${farmerData.state}
District: ${farmerData.district}

Farming Profile:
Type: ${farmerData.farmingType}
Crops: ${farmerData.cropType}
Land Size: ${farmerData.landSize}

Why they want to join:
${farmerData.whyJoin}

---
Sent automatically by WeAreSoloz Server.
  `;
  const html = `
    <h3>New Farmer Free-Trip Application Received</h3>
    <p><strong>Name:</strong> ${farmerData.fullName}</p>
    <p><strong>Gender:</strong> ${farmerData.gender}</p>
    <p><strong>Age:</strong> ${farmerData.age}</p>
    <p><strong>Mobile (WhatsApp):</strong> ${farmerData.mobile}</p>
    <p><strong>Location:</strong> ${farmerData.district}, ${farmerData.state}</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
    <p><strong>Farming Type:</strong> ${farmerData.farmingType}</p>
    <p><strong>Crops Grown:</strong> ${farmerData.cropType}</p>
    <p><strong>Land Size:</strong> ${farmerData.landSize}</p>
    <p><strong>Why they want to join:</strong></p>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ff7a1a; padding: 10px; margin: 10px 0;">
      ${farmerData.whyJoin.replace(/\n/g, "<br>")}
    </blockquote>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
    <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
  `;

  return sendResendEmail({ to: adminEmail, subject, text, html });
}

function wrapPremiumEmail(title, content, ctaText = null, ctaUrl = null) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f5f3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f6f5f3;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #eae8e5;
    }
    .header {
      background-color: #14110d;
      padding: 30px;
      text-align: center;
    }
    .logo {
      height: 48px;
      vertical-align: middle;
    }
    .content {
      padding: 40px 35px;
      color: #2b2520;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1c1917;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #443e38;
      margin-bottom: 25px;
    }
    .cta-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      background-color: #ea580c;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 30px;
      display: inline-block;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);
    }
    .footer {
      background-color: #faf9f7;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eae8e5;
    }
    .social-link {
      color: #ea580c;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
    }
    .footer-text {
      font-size: 12px;
      color: #a19c96;
      margin-top: 15px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="https://wearesoloz.com" style="text-decoration: none;" target="_blank">
          <!-- Logo absolute path hosted on wearesoloz domain -->
          <img src="https://wearesoloz.com/logo.png" alt="WeAreSoloz Logo" class="logo" style="height: 48px; border: 0;" onerror="this.style.display='none'">
          <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 2px; font-family: sans-serif; text-transform: uppercase; margin-top: 8px;">WEARE<span style="color: #ea580c;">SOLOZ</span></div>
        </a>
      </div>
      <div class="content">
        <h1 class="title">${title}</h1>
        <div class="text">
          ${content}
        </div>
        ${ctaText && ctaUrl ? `
        <div class="cta-container">
          <a href="${ctaUrl}" class="button" target="_blank">${ctaText}</a>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        <div style="margin-bottom: 10px;">
          <a href="https://instagram.com/wearesolozindia" class="social-link" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="16" height="16" style="vertical-align: middle; margin-right: 6px; filter: grayscale(1) invert(0.35) sepia(1) saturate(20) hue-rotate(345deg);">
            @wearesolozindia on Instagram
          </a>
        </div>
        <p class="footer-text">
          © ${new Date().getFullYear()} WeAreSoloz. All rights reserved.<br>
          You are receiving this because you submitted a request or application on our website.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendContactReceiptEmail(contactData) {
  const subject = "We've received your enquiry - WeAreSoloz";
  const title = "We've Received Your Enquiry!";
  const content = `
    Hi ${contactData.fullName},<br><br>
    Thank you for reaching out to WeAreSoloz! We have successfully received your travel enquiry regarding <strong>${contactData.destination || "General/Other Trips"}</strong>.<br><br>
    Akhil and our travel coordinators are already reviewing your details and will get in touch with you shortly via WhatsApp or Email to help plan your next adventure.<br><br>
    In the meantime, feel free to browse our upcoming trips or connect with us on social media!
  `;
  const html = wrapPremiumEmail(title, content, "View Upcoming Trips", "https://wearesoloz.com/upcoming-trips");
  const text = `Hi ${contactData.fullName}, Thank you for reaching out to WeAreSoloz! We have received your inquiry for ${contactData.destination || "General/Other Trips"}. We will be in touch shortly.`;

  return sendResendEmail({ to: contactData.email, subject, text, html });
}

async function sendCareerReceiptEmail(careerData) {
  const subject = "Your application has been received - WeAreSoloz Careers";
  const title = "Careers Application Received";
  const content = `
    Hi ${careerData.fullName},<br><br>
    Thank you for applying to join the WeAreSoloz crew! We have successfully received your application.<br><br>
    We are always looking for passionate travelers, community leaders, and storytellers to travel with us. Our team will review your profile, travel experience, and statement. If there's a match, we will reach out to you via WhatsApp or Email to schedule a chat.<br><br>
    Thank you for taking the time to apply!
  `;
  const html = wrapPremiumEmail(title, content, "Follow Our Journeys", "https://instagram.com/wearesolozindia");
  const text = `Hi ${careerData.fullName}, Thank you for applying to join the WeAreSoloz crew! We have received your application and will review it shortly.`;

  return sendResendEmail({ to: careerData.email, subject, text, html });
}

async function sendFarmerReceiptEmail(farmerData) {
  if (!farmerData.email) return false;

  const subject = "We've received your Farmer Free-Trip Application - WeAreSoloz";
  const title = "Farmer Application Received";
  const content = `
    Hi ${farmerData.fullName},<br><br>
    Thank you for applying for the <strong>WeAreSoloz Farmer Free-Trip initiative</strong>! We have successfully received your application for a fully sponsored travel slot.<br><br>
    We believe in honoring the dedication of our farmers by offering free travel experiences to rest, explore, and connect. Akhil will personally review your agricultural profile and application, and will contact you directly on WhatsApp or mobile to discuss trip details.<br><br>
    <em>Note: Approved candidates must verify their background (e.g. by presenting a government farmer passbook/ID card) prior to boarding.</em>
  `;
  const html = wrapPremiumEmail(title, content, "Check Our Community", "https://wearesoloz.com/soloz-community");
  const text = `Hi ${farmerData.fullName}, Thank you for applying for the WeAreSoloz Farmer Free-Trip initiative! We have received your application and will contact you shortly.`;

  return sendResendEmail({ to: farmerData.email, subject, text, html });
}

async function sendFarmerApprovalEmail(farmerData) {
  if (!farmerData.email) return false;

  const subject = "Congratulations! Your Free Farmer Trip Application is Approved! 🎉";
  const title = "Application Approved!";
  const content = `
    Hi ${farmerData.fullName},<br><br>
    We have exciting news! Your application for the <strong>WeAreSoloz Farmer Free-Trip initiative</strong> has been <strong>Approved</strong>! 🌾✈️<br><br>
    Thank you for your hard work and dedication as a farmer. We would love to have you travel with our community on an upcoming journey completely sponsored by our founder, Akhil.<br><br>
    Akhil will get in touch with you directly on WhatsApp or mobile (${farmerData.mobile}) to coordinate your trip dates, itinerary, and travel guidelines.<br><br>
    We look forward to sharing this beautiful travel experience with you!
  `;
  const cleanMobile = farmerData.mobile.replace(/[^\d]/g, "");
  const html = wrapPremiumEmail(title, content, "Chat on WhatsApp", `https://wa.me/919966085310`);
  const text = `Hi ${farmerData.fullName}, Congratulations! Your application for the WeAreSoloz Farmer Free-Trip initiative has been Approved! Akhil will contact you shortly.`;

  return sendResendEmail({ to: farmerData.email, subject, text, html });
}

async function sendCareerReviewedEmail(careerData) {
  const subject = "Your WeAreSoloz Careers Application Update";
  const title = "Application Reviewed!";
  const content = `
    Hi ${careerData.fullName},<br><br>
    We have reviewed your application to join the WeAreSoloz travel crew! 🎒<br><br>
    We loved reading about your travel experiences and passion for community building. A coordinator will get in touch with you shortly on WhatsApp (${careerData.mobile}) or Instagram to schedule a brief chat and discuss potential opportunities to travel or collaborate with us.<br><br>
    Welcome to the Soloz family!
  `;
  const html = wrapPremiumEmail(title, content, "Connect on Instagram", "https://instagram.com/wearesolozindia");
  const text = `Hi ${careerData.fullName}, We have reviewed your application to join the WeAreSoloz travel crew! We will contact you shortly.`;

  return sendResendEmail({ to: careerData.email, subject, text, html });
}

module.exports = {
  sendContactEmail,
  sendCareerEmail,
  sendOtpEmail,
  sendEmailChangeOtp,
  sendEmailChangeInitiatedAlert,
  sendEmailChangeCompletedAlert,
  sendFarmerApplicationEmail,
  sendContactReceiptEmail,
  sendCareerReceiptEmail,
  sendFarmerReceiptEmail,
  sendFarmerApprovalEmail,
  sendCareerReviewedEmail
};
