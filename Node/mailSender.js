import nodemailer from 'nodemailer';

function mailSender(email,otp) {
  
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
subject: 'Your OTP for Account Signup',
html: `
    <html>
        <body>
            <p>Hello,</p>
            <p>Thank you for choosing <strong>Hamro Bus Sewa</strong>! To complete your signup process, please use the following One-Time Password (OTP):</p>
            <h2 style="color: #007bff; font-weight: bold;">${otp}</h2>
            <p>This OTP is valid for the next <strong>5 minutes</strong>. If you didn't request this, please ignore this message.</p>
            <p>Best regards,<br><strong>Hamro Bus Sewa Team</strong></p>
        </body>
    </html>
`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

export default mailSender