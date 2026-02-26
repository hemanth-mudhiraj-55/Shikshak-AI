const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log("SMTP HOST:", process.env.EMAIL_HOST);
    console.log("SMTP PORT:", process.env.EMAIL_PORT);
    this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: `"ShikshakAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for ShikshakAI Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ShikshakAI</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Verify Your Email Address</h2>
            <p>Hello,</p>
            <p>Thank you for registering with ShikshakAI. Use the OTP below to complete your registration:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: white; padding: 15px 30px; border-radius: 10px; border: 2px dashed #667eea;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #333;">${otp}</span>
              </div>
            </div>
            
            <p><strong>This OTP will expire in 5 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            
            <p style="color: #666; font-size: 14px;">
              This is an automated message, please do not reply to this email.
              <br>
              © ${new Date().getFullYear()} ShikshakAI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: `"ShikshakAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ShikshakAI!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to ShikshakAI!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${username},</h2>
            <p>Congratulations! Your account has been successfully verified and activated.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0;">What's Next?</h3>
              <ul>
                <li>Complete your profile</li>
                <li>Explore AI-powered learning paths</li>
                <li>Start your first coding challenge</li>
                <li>Join our community forums</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            
            <p style="color: #666; font-size: 14px;">
              Happy Learning!
              <br>
              The ShikshakAI Team
              <br>
              © ${new Date().getFullYear()} ShikshakAI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      // Don't throw error for welcome email
    }
  }
}

module.exports = new EmailService();