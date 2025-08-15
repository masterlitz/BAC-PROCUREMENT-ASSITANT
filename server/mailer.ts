/**
 * @file server/mailer.ts
 * @description Nodemailer service for sending emails.
 *
 * This file is intended to run in a Node.js server environment.
 * It is NOT part of the frontend React application bundle.
 *
 * To use this, you would create an API endpoint (e.g., using Express)
 * that imports and calls the `sendEmail` function.
 *
 * Required environment variables:
 * - SMTP_HOST: The hostname of your SMTP server.
 * - SMTP_PORT: The port of your SMTP server (e.g., 587 or 465).
 * - SMTP_USER: The username for SMTP authentication.
 * - SMTP_PASS: The password for SMTP authentication.
 */

// You need to install nodemailer: npm install nodemailer @types/nodemailer
import * as nodemailer from 'nodemailer';

// 1. Configure the Nodemailer transporter
// This should be created once and reused for sending multiple emails.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: (process.env.SMTP_PORT === '465'), // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password or app-specific password
    },
});

// Verify the connection configuration on server startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer transporter configuration error:', error);
    } else {
        console.log('Nodemailer is ready to send emails.');
    }
});


interface MailOptions {
    to: string;
    subject: string;
    textBody?: string;
    htmlBody: string;
}

/**
 * Sends an email using the pre-configured transporter.
 * @param {MailOptions} options - The email options.
 * @returns {Promise<string>} A promise that resolves with the message ID on success.
 */
export async function sendEmail({ to, subject, textBody, htmlBody }: MailOptions): Promise<string> {
    if (!process.env.SMTP_USER) {
        throw new Error('SMTP_USER environment variable is not set. Cannot send email.');
    }

    const mailOptions = {
        from: `"Bacolod BAC Assistant" <${process.env.SMTP_USER}>`,
        to: to, // Recipient email address
        subject: subject, // Subject line
        text: textBody, // Plain text body
        html: htmlBody, // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info.messageId;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
}


/*
--- EXAMPLE USAGE IN AN EXPRESS.JS API ENDPOINT ---

import express from 'express';
import { sendEmail } from './mailer';

const app = express();
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
    const { to, subject, htmlBody } = req.body;

    if (!to || !subject || !htmlBody) {
        return res.status(400).json({ message: 'Missing required fields: to, subject, htmlBody' });
    }

    try {
        const messageId = await sendEmail({
            to,
            subject,
            htmlBody,
        });
        res.status(200).json({ message: 'Email sent successfully', messageId });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ message: 'Error sending email', error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

*/