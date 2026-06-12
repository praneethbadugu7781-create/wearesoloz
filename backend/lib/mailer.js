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

module.exports = { sendContactEmail };
