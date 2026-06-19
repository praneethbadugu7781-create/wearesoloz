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
  const title = "New Enquiry Received";
  const content = `
    You have received a new contact / booking inquiry on WeAreSoloz:<br><br>
    <strong>Name:</strong> ${contactData.fullName}<br>
    <strong>Age:</strong> ${contactData.age} (Blood Group: ${contactData.bloodGroup})<br>
    <strong>Mobile (WhatsApp):</strong> ${contactData.mobile}<br>
    <strong>Email:</strong> ${contactData.email}<br>
    <strong>Destination of Interest:</strong> ${contactData.destination || "General / Other"}<br><br>
    <strong>Message / Request:</strong>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ea580c; padding: 12px; margin: 15px 0; font-style: italic; color: #443e38;">
      ${contactData.message.replace(/\n/g, "<br>")}
    </blockquote>
  `;
  
  const html = wrapPremiumEmail(title, content, "Open Admin Console", "https://wearesoloz.com/admin/enquiries");
  const text = `New Enquiry from ${contactData.fullName} (${contactData.mobile}) regarding ${contactData.destination || "General / Other"}. Message: ${contactData.message}`;

  return sendResendEmail({ to: adminEmail, subject, text, html });
}

async function sendCareerEmail(careerData) {
  const adminEmail = await getAdminEmail();

  const subject = `New Careers Application from ${careerData.fullName}`;
  const title = "New Careers Application Received";
  const content = `
    You have received a new Careers application on WeAreSoloz:<br><br>
    <strong>Name:</strong> ${careerData.fullName}<br>
    <strong>Gender / Age:</strong> ${careerData.gender} / ${careerData.age} yrs old (Blood Group: ${careerData.bloodGroup})<br>
    <strong>Mobile (WhatsApp):</strong> ${careerData.mobile}<br>
    <strong>Email:</strong> ${careerData.email}<br>
    <strong>Instagram:</strong> ${careerData.instagram || "Not provided"}<br><br>
    <strong>Travel Experience:</strong>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ea580c; padding: 12px; margin: 15px 0; color: #443e38;">
      ${careerData.experience.replace(/\n/g, "<br>")}
    </blockquote>
    <strong>Why they want to travel/work:</strong>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ff7a1a; padding: 12px; margin: 15px 0; color: #443e38;">
      ${careerData.whyJoin.replace(/\n/g, "<br>")}
    </blockquote>
  `;
  
  const html = wrapPremiumEmail(title, content, "Open Admin Console", "https://wearesoloz.com/admin/careers");
  const text = `New Careers Application from ${careerData.fullName} (${careerData.mobile}). Experience: ${careerData.experience}`;

  return sendResendEmail({ to: adminEmail, subject, text, html });
}

async function sendOtpEmail(email, otpCode) {
  const subject = "Your Admin Password Reset OTP";
  const title = "Admin Password Reset Request";
  const content = `
    You requested to reset your admin passcode. Use the following One-Time Password (OTP) to complete the reset process:<br><br>
    <div style="text-align: center; margin: 20px 0;">
      <h2 style="letter-spacing: 4px; font-size: 32px; color: #ea580c; font-family: monospace; background: #f9f9f9; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #eee; margin: 0;">${otpCode}</h2>
    </div>
    This code is valid for <strong>10 minutes</strong>.<br><br>
    If you did not request this, please secure your admin credentials.
  `;
  const html = wrapPremiumEmail(title, content);
  const text = `Your OTP code for resetting the admin password is: ${otpCode}. It is valid for 10 minutes.`;

  return sendResendEmail({ to: email, subject, text, html });
}

async function sendEmailChangeOtp(email, otpCode) {
  const subject = "Verify Your New Admin Email Address";
  const title = "Verify Your New Admin Email Address";
  const content = `
    You requested to change your admin email address. Use the following One-Time Password (OTP) to verify that you own this email address and complete the update:<br><br>
    <div style="text-align: center; margin: 20px 0;">
      <h2 style="letter-spacing: 4px; font-size: 32px; color: #ea580c; font-family: monospace; background: #f9f9f9; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #eee; margin: 0;">${otpCode}</h2>
    </div>
    This code is valid for <strong>10 minutes</strong>.<br><br>
    If you did not request this, you can safely ignore this email.
  `;
  const html = wrapPremiumEmail(title, content);
  const text = `Your OTP code to verify and update your admin email address is: ${otpCode}. It is valid for 10 minutes.`;

  return sendResendEmail({ to: email, subject, text, html });
}

async function sendEmailChangeInitiatedAlert(oldEmail, newEmail) {
  const subject = "Security Alert: Admin Email Change Initiated";
  const title = "Security Alert: Email Change Initiated";
  const content = `
    An email change request was initiated for your WeAreSoloz admin account.<br><br>
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
    A 6-digit verification code has been sent to the new email address to complete this request.<br><br>
    <div style="background: #fff5eb; border-left: 4px solid #ea580c; padding: 12px; border-radius: 4px; margin: 15px 0;">
      <p style="margin: 0; font-size: 13px; color: #c2410c; font-weight: 500;">
        <strong>Important:</strong> If you did not authorize this request, please change your admin passcode immediately to secure your account.
      </p>
    </div>
  `;
  const html = wrapPremiumEmail(title, content);
  const text = `An email change request has been initiated for your admin account. The proposed new email is: ${newEmail}.`;

  return sendResendEmail({ to: oldEmail, subject, text, html });
}

async function sendEmailChangeCompletedAlert(oldEmail, newEmail) {
  const subject = "Security Alert: Admin Email Change Completed";
  const title = "Security Alert: Email Change Completed";
  const content = `
    The email address associated with your WeAreSoloz admin account has been successfully updated.<br><br>
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
  `;
  const html = wrapPremiumEmail(title, content);
  const text = `The email address associated with your admin account has been successfully changed from ${oldEmail} to ${newEmail}.`;

  return sendResendEmail({ to: oldEmail, subject, text, html });
}

async function sendFarmerApplicationEmail(farmerData) {
  const adminEmail = await getAdminEmail();

  const subject = `New Farmer Free Trip Application from ${farmerData.fullName}`;
  const title = "New Farmer Free-Trip Application Received";
  const content = `
    You have received a new Farmer Free-Trip application on WeAreSoloz:<br><br>
    <strong>Name:</strong> ${farmerData.fullName}<br>
    <strong>Gender / Age:</strong> ${farmerData.gender} / ${farmerData.age} (Blood Group: ${farmerData.bloodGroup})<br>
    <strong>Mobile (WhatsApp):</strong> ${farmerData.mobile}<br>
    <strong>Location:</strong> ${farmerData.district}, ${farmerData.state}<br><br>
    <strong>Farming Profile:</strong><br>
    - Type of Farming: ${farmerData.farmingType}<br>
    - Crops Grown: ${farmerData.cropType}<br>
    - Land Size: ${farmerData.landSize} Acres<br><br>
    <strong>Statement / Why Join:</strong>
    <blockquote style="background: #f9f9f9; border-left: 5px solid #ea580c; padding: 12px; margin: 15px 0; color: #443e38;">
      ${farmerData.whyJoin.replace(/\n/g, "<br>")}
    </blockquote>
  `;
  
  const html = wrapPremiumEmail(title, content, "Open Admin Console", "https://wearesoloz.com/admin/farmers");
  const text = `New Farmer Application from ${farmerData.fullName} (${farmerData.mobile}) from ${farmerData.district}, ${farmerData.state}`;

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
        <div style="margin-bottom: 10px; display: inline-block; margin-right: 15px;">
          <a href="https://instagram.com/wearesolozindia" class="social-link" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="16" height="16" style="vertical-align: middle; margin-right: 6px; filter: grayscale(1) invert(0.35) sepia(1) saturate(20) hue-rotate(345deg);">
            @wearesolozindia on Instagram
          </a>
        </div>
        <div style="margin-bottom: 10px; display: inline-block;">
          <a href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi" class="social-link" style="color: #ef4444;" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="16" height="16" style="vertical-align: middle; margin-right: 6px; filter: grayscale(1) invert(0.35) sepia(1) saturate(20) hue-rotate(300deg);">
            YouTube Channel
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
    We are always looking for passionate travellers, community leaders, and storytellers to travel with us. Our team will review your profile, travel experience, and statement. If there's a match, we will reach out to you via WhatsApp or Email to schedule a chat.<br><br>
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

async function sendContactStatusEmail(contactData, status) {
  let subject, title, content;
  
  if (status === "contacted") {
    subject = `WeAreSoloz - Update on your travel enquiry`;
    title = "Let's Plan Your Travel!";
    content = `
      Hi ${contactData.fullName},<br><br>
      Akhil here from WeAreSoloz! I've reviewed your enquiry for <strong>${contactData.destination || "General/Other Trips"}</strong>.<br><br>
      I will be reaching out to you on WhatsApp (${contactData.mobile}) or email shortly to discuss your travel plans, customize your itinerary, and help book your slots.<br><br>
      Looking forward to traveling together!
    `;
  } else {
    subject = `Your WeAreSoloz Enquiry is Closed`;
    title = "Enquiry Closed";
    content = `
      Hi ${contactData.fullName},<br><br>
      Thank you for coordinating with us! We have closed your travel enquiry regarding <strong>${contactData.destination || "General/Other Trips"}</strong>.<br><br>
      If you have any further questions or want to start a new adventure, feel free to reach out to us anytime.<br><br>
      See you on the road!
    `;
  }
  
  const html = wrapPremiumEmail(title, content, "Visit WeAreSoloz", "https://wearesoloz.com");
  const text = `Hi ${contactData.fullName}, your enquiry status has been updated to ${status}. We will be in touch.`;

  return sendResendEmail({ to: contactData.email, subject, text, html });
}

async function sendContactApprovalEmail(contactData) {
  const subject = `Your WeAreSoloz Booking Enquiry has been Approved! 🎉`;
  const title = "Booking Enquiry Approved!";
  
  const content = `
    Hi ${contactData.fullName},<br><br>
    Great news! Your booking / travel enquiry for <strong>${contactData.destination || "General/Other Trips"}</strong> has been officially <strong>Approved</strong> by Akhil! 🎉🎒<br><br>
    Here are your booking parameters and details:<br>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif; font-size: 14px;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666; width: 120px;">Destination:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold; color: #ea580c;">${contactData.destination || "General/Other Trips"}</td>
      </tr>
      ${contactData.travelerNames ? `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666;">Travelers:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold;">${contactData.travelerNames}</td>
      </tr>
      ` : ''}
      ${contactData.pricePoints ? `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666;">Pricing:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold; color: #16a34a; font-size: 16px;">${contactData.pricePoints}</td>
      </tr>
      ` : ''}
    </table>
    
    ${contactData.approvalNotes ? `
    <strong>Tour Notes & Package Inclusions:</strong>
    <blockquote style="background: #fdfaf7; border-left: 5px solid #ea580c; padding: 12px; margin: 15px 0; color: #443e38; line-height: 1.5;">
      ${contactData.approvalNotes.replace(/\n/g, "<br>")}
    </blockquote>
    ` : ''}
    
    Akhil will connect with you shortly on WhatsApp (${contactData.mobile}) to share the onboarding guidelines, transport itinerary, assembly point locations, and answer any final questions you have.<br><br>
    Welcome to the WeAreSoloz community! Let's hit the road together.
  `;

  const html = wrapPremiumEmail(title, content, "Chat with Akhil on WhatsApp", "https://wa.me/919966085310");
  const text = `Hi ${contactData.fullName}, your booking enquiry for ${contactData.destination || "General/Other Trips"} has been Approved! Price: ${contactData.pricePoints || "Contact for Price"}.`;

  // Send to Customer
  const customerSent = await sendResendEmail({ to: contactData.email, subject, text, html });

  // Send copy/detailed notification to Admin
  const adminEmail = await getAdminEmail();
  const adminSubject = `[Admin Notification] Booking Approved: ${contactData.fullName} - ${contactData.destination || "General/Other Trips"}`;
  const adminTitle = "Booking Approved & Confirmed";
  const adminContent = `
    An enquiry booking has been approved and confirmed by you (or another administrator).<br><br>
    <strong>Customer Details:</strong><br>
    - Name: <strong>${contactData.fullName}</strong><br>
    - Mobile (WhatsApp): <strong>${contactData.mobile}</strong><br>
    - Email: <strong>${contactData.email}</strong><br>
    - Original Message: <em>"${contactData.message || ''}"</em><br><br>
    
    <strong>Approval parameters sent to customer:</strong><br>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif; font-size: 14px;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666; width: 120px;">Destination:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold; color: #ea580c;">${contactData.destination || "General/Other Trips"}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666;">Travelers:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold;">${contactData.travelerNames || contactData.fullName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; color: #666;">Pricing:</td>
        <td style="padding: 8px; border-bottom: 1px solid #eae8e5; font-weight: bold; color: #16a34a; font-size: 16px;">${contactData.pricePoints || "N/A"}</td>
      </tr>
    </table>
    
    ${contactData.approvalNotes ? `
    <strong>Tour Notes & Package Inclusions:</strong>
    <blockquote style="background: #fdfaf7; border-left: 5px solid #ea580c; padding: 12px; margin: 15px 0; color: #443e38; line-height: 1.5;">
      ${contactData.approvalNotes.replace(/\n/g, "<br>")}
    </blockquote>
    ` : ''}
  `;
  
  const adminHtml = wrapPremiumEmail(adminTitle, adminContent, "Open Admin Console", "https://wearesoloz.com/admin/enquiries");
  const adminText = `Booking approved for ${contactData.fullName} regarding ${contactData.destination || "General/Other Trips"}. Price: ${contactData.pricePoints || "N/A"}.`;
  
  const adminSent = await sendResendEmail({ to: adminEmail, subject: adminSubject, text: adminText, html: adminHtml });

  return customerSent && adminSent;
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
  sendCareerReviewedEmail,
  sendContactStatusEmail,
  sendContactApprovalEmail
};
