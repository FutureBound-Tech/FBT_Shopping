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
