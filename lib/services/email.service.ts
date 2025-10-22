import nodemailer from "nodemailer";

interface SendOTPEmailParams {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail({ to, otp, type }: SendOTPEmailParams): Promise<void> {
  const subjects = {
    "sign-in": "Your Sign-In OTP Code",
    "email-verification": "Verify Your Email Address",
    "forget-password": "Password Reset OTP",
  };

  const messages = {
    "sign-in": `Your OTP code for signing in is: <strong>${otp}</strong>. This code will expire in 5 minutes.`,
    "email-verification": `Your email verification code is: <strong>${otp}</strong>. This code will expire in 5 minutes.`,
    "forget-password": `Your password reset code is: <strong>${otp}</strong>. This code will expire in 5 minutes.`,
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Authentication Code</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">${messages[type]}</p>
        
        <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px;">${otp}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Trusted" <${process.env.GMAIL_USER}>`,
      to,
      subject: subjects[type],
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification email. Please try again later.");
  }
}

// Verify transporter configuration on startup
transporter.verify((error: Error | null) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("✅ Email service ready to send messages");
  }
});
