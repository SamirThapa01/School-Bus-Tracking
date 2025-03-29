import nodemailer from 'nodemailer';

function rfidMail(email, studentName, scanTime, busNumber) {
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
    subject: 'Bus Boarding Notification - Hamro Bus Sewa',
    html: `
      <html>
          <body>
              <p>Dear Parent,</p>
              <p>We would like to inform you that your child, <strong>${studentName}</strong>, has scanned their bus card.</p>
              <p><strong>Details:</strong></p>
              <ul>
                  <li><strong>Student Name:</strong> ${studentName}</li>
                  <li><strong>Scan Time:</strong> ${scanTime}</li>
                  <li><strong>Bus Number:</strong> ${busNumber}</li>
              </ul>
              <p>If you were not expecting this notification, please contact school authorities immediately.</p>
              <p>Best regards,<br><strong>Hamro Bus Sewa Team</strong></p>
          </body>
      </html>
    `
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

export default rfidMail;
