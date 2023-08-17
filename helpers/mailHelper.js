import nodemailer from 'nodemailer';
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const mailSender = (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD
        }
    });

    const emailHtml = html
    const mailOptions = {
        from: `Family Vibes <${SMTP_EMAIL}>`,
        to,
        subject,
        text: subject,
        html: emailHtml
    };
    return transporter.sendMail(mailOptions)
}