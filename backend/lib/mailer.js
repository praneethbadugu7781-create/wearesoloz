// backend/lib/mailer.js

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
  const adminEmail = process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com";
  
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
  const adminEmail = process.env.ADMIN_EMAIL || "praneethbadugu7781@gmail.com";

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

module.exports = { sendContactEmail, sendCareerEmail, sendOtpEmail };
