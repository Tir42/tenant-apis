const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
    // Check if SMTP credentials are provided in env
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || "noreply@tenantapp.com";

    let transporter;

    if (host && port && user && pass) {
        // Use production SMTP configuration
        transporter = nodemailer.createTransport({
            host,
            port: parseInt(port),
            secure: port == 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });
        console.log(`Using custom SMTP server (${host}) to send email.`);
    } else {
        // Fallback to simulated Ethereal Email for development/testing
        console.log("SMTP configuration not complete in .env. Creating a temporary Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const mailOptions = {
        from: host && port && user && pass ? from : `"Tenant App Support" <noreply@tenantapp.com>`,
        to,
        subject,
        text,
        html,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!host || !port || !user || !pass) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("-----------------------------------------");
        console.log(`📧 OTP Email Simulated Send Successful!`);
        console.log(`Sent To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`OTP Content (Plain text): ${text}`);
        console.log(`Preview URL: ${previewUrl}`);
        console.log("-----------------------------------------");
    } else {
        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    }

    return info;
};

module.exports = sendEmail;
