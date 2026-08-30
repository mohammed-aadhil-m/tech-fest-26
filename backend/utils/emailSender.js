const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

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

        ${registeredEvents.some(e => e.eventName && (e.eventName.toLowerCase().includes('paper presentation') || (e.eventSlug && e.eventSlug === 'paper-presentation'))) ? `
        <div style="background-color: #fff0f0; padding: 16px; border-radius: 8px; border: 1px solid #ffc1c1; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #C40001; font-size: 15px;">📄 Paper Presentation Guidelines</h4>
          <ul style="padding-left: 20px; color: #444444; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
            <li style="margin-bottom: 6px;">Each participant/team will be given 10 minutes to present their paper.</li>
            <li style="margin-bottom: 6px;">The presentation will be followed by a Q&A session with the judges.</li>
            <li style="margin-bottom: 6px;">Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.</li>
            <li style="margin-bottom: 6px;">Presentation slides should be clear, concise, and relevant to the submitted paper.</li>
            <li style="margin-bottom: 6px;">Participants may upload or update their presentation slides before the submission deadline (04/09/2026).</li>
            <li style="margin-bottom: 0;">The presentation should be delivered by the registered participant/team members.</li>
          </ul>
        </div>
        ` : ''}

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

const sendPaperSubmissionEmail = async (submission) => {
  const mailOptions = {
    from: `"TECH FEST '26" <${process.env.EMAIL_USER}>`,
    to: submission.email,
    subject: `Paper Submission Received — TECH FEST '26 (${submission.paperTitle || submission.topic})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 10px;">
        <h2 style="color: #C40001; margin-top: 0;">Paper Submission Confirmed!</h2>
        <p>Dear <strong>${submission.name}</strong>,</p>
        <p>Thank you for submitting your paper for <strong>TECH FEST '26 — Paper Presentation</strong>. We have successfully received your submission details.</p>

        <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #E5E5E5; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #222222;">Submission Details:</h4>
          ${submission.registrationId ? `<p style="margin-bottom: 5px; color: #555555;"><strong>Registration ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #C40001;">${submission.registrationId}</span></p>` : ''}
          <p style="margin-bottom: 5px; color: #555555;"><strong>Paper Topic / Title:</strong> ${submission.paperTitle || submission.topic}</p>
          ${submission.teamName ? `<p style="margin-bottom: 5px; color: #555555;"><strong>Team Name:</strong> ${submission.teamName} ${submission.teamCode ? `(${submission.teamCode})` : ''}</p>` : ''}
          <p style="margin-bottom: 5px; color: #555555;"><strong>Submitted By:</strong> ${submission.name} (${submission.email})</p>
          <p style="margin-bottom: 5px; color: #555555;"><strong>College:</strong> ${submission.college} ${submission.department ? `· ${submission.department}` : ''}</p>
          ${submission.driveUrl ? `<p style="margin-bottom: 5px; color: #555555;"><strong>Provided Drive Link:</strong> <a href="${submission.driveUrl}" target="_blank" style="color: #C40001;">${submission.driveUrl}</a></p>` : ''}
          ${submission.fileName ? `<p style="margin-bottom: 5px; color: #555555;"><strong>Uploaded Document:</strong> ${submission.fileName}</p>` : ''}
          <p style="margin-bottom: 0; color: #555555;"><strong>Submission Timestamp:</strong> ${new Date(submission.submittedAt || Date.now()).toLocaleString('en-IN')}</p>
        </div>

        <div style="background-color: #fff0f0; padding: 16px; border-radius: 8px; border: 1px solid #ffc1c1; margin-bottom: 20px;">
          <h4 style="margin-top: 0; color: #C40001; font-size: 15px;">📋 Paper Presentation Guidelines</h4>
          <ul style="padding-left: 20px; color: #444444; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
            <li style="margin-bottom: 6px;">Each participant/team will be given 10 minutes to present their paper.</li>
            <li style="margin-bottom: 6px;">The presentation will be followed by a Q&A session with the judges.</li>
            <li style="margin-bottom: 6px;">Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.</li>
            <li style="margin-bottom: 6px;">Presentation slides should be clear, concise, and relevant to the submitted paper.</li>
            <li style="margin-bottom: 6px;">Participants may upload or update their presentation slides before the submission deadline.</li>
            <li style="margin-bottom: 0;">The presentation should be delivered by the registered participant/team members.</li>
          </ul>
        </div>

        <p style="color: #555555; font-size: 13px;">If you need to update your paper details or re-upload presentation slides before the deadline, you can visit the Paper Submission page and enter your Registration ID.</p>
        <br />
        <p style="color: #555555; font-size: 13px;">Best regards,<br/><strong>TECH FEST '26 Organizing Committee</strong><br/>V V College of Engineering</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Skipping submission email send: EMAIL_USER and EMAIL_PASS not configured in .env');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Paper submission confirmation email sent to ${submission.email}`);
  } catch (error) {
    console.error('Error sending paper submission email:', error);
  }
};

module.exports = { sendRegistrationEmail, sendPaperSubmissionEmail };
