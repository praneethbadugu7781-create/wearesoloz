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

module.exports = {
  sendContactEmail,
  sendCareerEmail,
  sendOtpEmail,
  sendEmailChangeOtp,
  sendEmailChangeInitiatedAlert,
  sendEmailChangeCompletedAlert
};
