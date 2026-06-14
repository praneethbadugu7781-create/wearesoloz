const nodemailer = require("nodemailer");

async function sendContactEmail(contactData) {
  // Check if SMTP details are provided in environment
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP credentials (SMTP_USER, SMTP_PASS) not configured. Email notification skipped.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"WeAreSoloz Notification" <${smtpUser}>`,
      to: "wearsoloz.india@gmail.com",
      subject: `New Contact/Booking Enquiry from ${contactData.fullName}`,
      text: `
You have received a new inquiry on WeAreSoloz:

Name: ${contactData.fullName}
Mobile (WhatsApp): ${contactData.mobile}
Email: ${contactData.email}
Destination of Interest: ${contactData.destination || "General / Other"}
Message:
${contactData.message}

---
Sent automatically by WeAreSoloz Server.
      `,
      html: `
        <h3>New Inquiry Received</h3>
        <p><strong>Name:</strong> ${contactData.fullName}</p>
        <p><strong>Mobile (WhatsApp):</strong> ${contactData.mobile}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Destination:</strong> ${contactData.destination || "General / Other"}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; border-left: 5px solid #ff7a1a; padding: 10px; margin: 10px 0;">
          ${contactData.message.replace(/\n/g, "<br>")}
        </blockquote>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email notification:", error);
    return false;
  }
}

async function sendCareerEmail(careerData) {
  // Check if SMTP details are provided in environment
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP credentials (SMTP_USER, SMTP_PASS) not configured. Email notification skipped.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"WeAreSoloz Notification" <${smtpUser}>`,
      to: "wearsoloz.india@gmail.com",
      subject: `New Careers Application from ${careerData.fullName}`,
      text: `
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
      `,
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Career email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send career email notification:", error);
    return false;
  }
}

async function sendOtpEmail(email, otpCode) {
  // Check if SMTP details are provided in environment
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP credentials (SMTP_USER, SMTP_PASS) not configured. OTP email skipped.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"WeAreSoloz Security" <${smtpUser}>`,
      to: email,
      subject: "Your Admin Password Reset OTP",
      text: `Your OTP code for resetting the admin password is: ${otpCode}. It is valid for 10 minutes.`,
      html: `
        <h3>Admin Password Reset Request</h3>
        <p>You requested to reset your admin passcode. Use the following One-Time Password (OTP) to complete the reset process:</p>
        <h2 style="letter-spacing: 4px; font-size: 32px; color: #ea580c; font-family: monospace; background: #f9f9f9; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #eee;">${otpCode}</h2>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please secure your admin credentials.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 11px; color: #888;">Sent automatically by WeAreSoloz Server.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 OTP email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return false;
  }
}

module.exports = { sendContactEmail, sendCareerEmail, sendOtpEmail };
