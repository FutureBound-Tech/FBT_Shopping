import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAdminOtp(otp: string) {
  const mailOptions = {
    from: `"FBT Shopping System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `🔐 ADM-AUTH: Secure Access Code [${otp}]`,
    html: `
      <div style="font-family: 'Inter', sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px;">
        <h2 style="color: #6366f1; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 24px;">FBT SECURITY PROTOCOL</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px;">An administrator login attempt for <b>FBT Shopping</b> was detected. Use the following code to authorize access.</p>
        
        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
          <span style="font-size: 48px; font-weight: 900; letter-spacing: 0.2em; color: #6366f1;">${otp}</span>
        </div>

        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">Security level: High-Priority Administrator</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 32px 0;">
        <p style="font-size: 10px; color: #475569;">If you did not attempt this login, please secure your credentials immediately. This code expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Admin OTP sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP] Failed to send Admin OTP:', error);
    return { success: false, error };
  }
}

export async function sendCustomerOtp(email: string, otp: string) {
  const mailOptions = {
    from: `"FBT Shopping" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your FBT Shopping Order Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; background: #0F172A; color: #F8FAFC; padding: 40px; border-radius: 20px; max-width: 500px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #FF3366; font-weight: 900; font-size: 24px; margin: 0;">FBT Shopping</h1>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Premium Indian Ethnic Wear</p>
        </div>
        
        <p style="color: #94A3B8; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
          We received a request to confirm your order. Please verify your email address using the code below:
        </p>
        
        <div style="background: rgba(255, 51, 102, 0.1); border: 2px solid rgba(255, 51, 102, 0.3); padding: 28px; border-radius: 16px; text-align: center; margin-bottom: 28px;">
          <p style="color: #94A3B8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: 700;">Your Verification Code</p>
          <span style="font-size: 42px; font-weight: 900; letter-spacing: 0.3em; color: #FF3366;">${otp}</span>
        </div>

        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #64748B; font-size: 12px; margin: 0; line-height: 1.5;">
            This code will expire in <strong style="color: #F8FAFC;">10 minutes</strong>. If you did not request this order, you can safely ignore this email.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 24px 0;">
        <p style="font-size: 10px; color: #475569; text-align: center; margin: 0;">
          &copy; FBT Shopping. All rights reserved.<br/>
          Premium Sarees, Lehengas & Ethnic Wear
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Customer OTP sent to:', email, 'MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP] Failed to send Customer OTP:', error);
    return { success: false, error };
  }
}
