import nodemailer from 'nodemailer';

function EmergencyMail(email, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hamrobussewa@gmail.com',
      pass: 'fwpi ieub acus lwvl'
    }
  });

  const mailOptions = {
    from: 'hamrobussewa@gmail.com',
    to: email,
    subject: 'Emergency Alert from Hamro Bus Sewa',
    html: `
      <html>
        <body>
          <p><strong>Emergency Notification</strong></p>
          <p>${message}</p>
          <p>Please take necessary action immediately.</p>
          <p>Stay safe,<br><strong>Hamro Bus Sewa Team</strong></p>
        </body>
      </html>
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Error sending emergency email:', error);
    } else {
      console.log('Emergency email sent:', info.response);
    }
  });
}

export default EmergencyMail;
