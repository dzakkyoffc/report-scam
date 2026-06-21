import TelegramBot from 'node-telegram-bot-api';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Setup email transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, reason, description, evidence } = req.body;

        if (!username || !reason) {
            return res.status(400).json({ error: 'Username dan alasan wajib diisi!' });
        }

        // Format pesan untuk Telegram
        const message = `
🚨 *REPORT SCAMMER BARU!*

👤 *Target:* @${username}
⚠️ *Alasan:* ${reason}
📝 *Deskripsi:* ${description || 'Tidak ada'}
🖼️ *Bukti:* ${evidence || 'Tidak ada'}
⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}

_Segera lakukan report manual:_
• @SpamBot
• @NoToScam_bot
• abuse@telegram.org
        `;

        // 1. Kirim ke Telegram
        if (BOT_TOKEN && CHAT_ID) {
            const bot = new TelegramBot(BOT_TOKEN);
            await bot.sendMessage(CHAT_ID, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            // Pesan mass report
            const shareText = `
🚨 *MASS REPORT* 🚨

Tolong bantu report akun scam ini:

👤 Username: @${username}
⚠️ Alasan: ${reason}
📝 Detail: ${description || 'Scam/penipuan'}

Cara report:
1. Buka profil @${username}
2. Klik ⋮ > Report
3. Pilih alasan yang sesuai
4. Submit

Yuk bantu bersihkan Telegram dari scammer! 🙏
            `;

            await bot.sendMessage(CHAT_ID, shareText, {
                parse_mode: 'Markdown'
            });
        }

        // 2. Kirim Email ke abuse@telegram.org
        if (EMAIL_USER && EMAIL_PASS) {
            const mailOptions = {
                from: EMAIL_USER,
                to: 'abuse@telegram.org',
                subject: `Report Scam: @${username} - ${reason}`,
                html: `
                    <h2>Telegram Scam Report</h2>
                    <p><strong>Username:</strong> @${username}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p><strong>Description:</strong> ${description || 'N/A'}</p>
                    <p><strong>Evidence:</strong> ${evidence || 'N/A'}</p>
                    <p><strong>Reported at:</strong> ${new Date().toISOString()}</p>
                    <br/>
                    <p><em>This report was generated automatically. Please investigate.</em></p>
                `
            };

            await transporter.sendMail(mailOptions);
        }

        return res.status(200).json({
            success: true,
            message: 'Report berhasil dikirim ke Telegram & Email!',
        });

    } catch (error) {
        console.error('Report error:', error);
        return res.status(500).json({
            error: 'Gagal mengirim report',
            details: error.message
        });
    }
}