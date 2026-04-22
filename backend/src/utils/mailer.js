let cachedTransporter = null;

const getTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('Chưa cấu hình SMTP để gửi email');
    }

    let nodemailer;
    try {
        // Loaded lazily so the server can still boot before dependencies are installed.
        nodemailer = require('nodemailer');
    } catch (error) {
        throw new Error('Thiếu thư viện gửi mail: hãy cài nodemailer');
    }

    cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    return cachedTransporter;
};

const sendMail = async ({ to, subject, text, html }) => {
    const transporter = getTransporter();
    return transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendMail
};
