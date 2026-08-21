const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRegistrationEmail = async (userEmail, userName, registrationId, registeredEvents = [], foodPreference = '') => {
  const mailOptions = {
    from: `"TECH FEST '26" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Registration Successful - TECH FEST '26 (${registrationId})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 10px;">
        <h2 style="color: #C40001; margin-top: 0;">Registration Confirmed!</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your payment screenshot has been received and your registration for TECH FEST '26 is confirmed! Your Registration ID is:</p>
        <h3 style="background-color: #fff0f0; padding: 15px; border-radius: 8px; color: #C40001; text-align: center; border: 1px solid #ffc1c1; letter-spacing: 2px;">
          ${registrationId}
        </h3>

        <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #E5E5E5; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #222222;">Participant Details:</h4>
          <p style="margin-bottom: 5px; color: #555555;"><strong>Registration ID:</strong> ${registrationId}</p>
          <p style="margin-bottom: 15px; color: #555555;"><strong>Food Preference:</strong> ${foodPreference}</p>
          <h4 style="margin-top: 0; color: #222222;">Registered Events:</h4>
          <ul style="margin-bottom: 0; padding-left: 20px; color: #555555;">
            ${registeredEvents.map(e => `
              <li style="margin-bottom: 8px;">
                <strong>${e.eventName}</strong> 
                ${e.isTeamRegistration ? `<br/><small>Team: ${e.teamName} (Leader: ${e.teamLeader})</small>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>

        <p>We look forward to seeing you at the event.</p>
        <br />
        <p style="color: #555555; font-size: 13px;">Best regards,<br/>TECH FEST '26 Organizing Committee<br/>V V College of Engineering</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Skipping email send: EMAIL_USER and EMAIL_PASS not configured in .env');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

module.exports = { sendRegistrationEmail };
