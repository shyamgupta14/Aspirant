const nodemailer = require('nodemailer');

// In-memory OTP store: { email: { otp, expiry } }
const otpStore = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

async function sendOTPEmail(email, otp, name) {
    const mailOptions = {
        from: `"Aspirant GATE Platform 🎓" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your OTP for Aspirant Registration',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Aspirant</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">GATE Preparation Platform</p>
            </div>
            <div style="padding: 40px 32px;">
                <h2 style="color: #1e293b; margin: 0 0 8px;">Hi ${name || 'Aspirant'}! 👋</h2>
                <p style="color: #64748b; margin: 0 0 32px; font-size: 16px;">Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
                
                <div style="background: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Your OTP Code</p>
                    <h1 style="margin: 0; color: #2563eb; font-size: 48px; font-weight: 900; letter-spacing: 8px;">${otp}</h1>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">If you didn't request this, please ignore this email. Your account security is safe.</p>
            </div>
            <div style="background: #f1f5f9; padding: 20px 32px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 Aspirant GATE Platform. All rights reserved.</p>
            </div>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

function storeOTP(email, otp) {
    otpStore.set(email, {
        otp,
        expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
}

function verifyOTP(email, otp) {
    const record = otpStore.get(email);
    if (!record) return { valid: false, msg: 'OTP not found. Please request a new one.' };
    if (Date.now() > record.expiry) {
        otpStore.delete(email);
        return { valid: false, msg: 'OTP expired. Please request a new one.' };
    }
    if (record.otp !== otp) return { valid: false, msg: 'Invalid OTP. Please try again.' };
    otpStore.delete(email); // Clear after use
    return { valid: true };
}

module.exports = { sendOTPEmail, storeOTP, verifyOTP, generateOTP };
