"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const triggers_db_1 = require("../db/triggers.db");
const messages_db_1 = require("../db/messages.db");
const recipients_db_1 = require("../db/recipients.db");
class DeliveryService {
    static async scheduleMessage(env, messageId, userId, scheduledAt) {
        const message = await (0, messages_db_1.findById)(env, messageId, userId);
        if (!message) {
            return { error: 'Mesaj bulunamadı', code: 'NOT_FOUND', status: 404 };
        }
        try {
            await (0, triggers_db_1.setTrigger)(env, messageId, scheduledAt);
            return { message: 'Mesaj zamanlandı' };
        }
        catch (error) {
            console.error('scheduleMessage hata:', error);
            return { error: 'Zamanlama sırasında hata oluştu', code: 'INTERNAL_ERROR', status: 500 };
        }
    }
    static async deliverDueMessages(env) {
        const dueMessagesResult = await (0, triggers_db_1.findDueMessages)(env);
        const dueMessages = dueMessagesResult.results;
        for (const message of dueMessages) {
            const messageId = message.id;
            const userId = message.user_id;
            try {
                const recipientsResult = await (0, recipients_db_1.findByMessage)(env, messageId, userId);
                const recipients = recipientsResult.results;
                if (!recipients || recipients.length === 0) {
                    await (0, triggers_db_1.markDelivered)(env, messageId);
                    continue;
                }
                for (const recipient of recipients) {
                    await this.sendEmail(env, { name: recipient.full_name, email: recipient.email }, message.title, `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#D4763B">Geleceğinizden bir mesaj</h2>
              <p style="font-size:16px;line-height:1.6;color:#333">${message.content_text ?? ''}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="font-size:12px;color:#999">Bu mesaj Vasi aracılığıyla gönderilmiştir.</p>
            </div>`);
                }
                await (0, triggers_db_1.markDelivered)(env, messageId);
            }
            catch (error) {
                console.error('deliverDueMessages hata:', error);
                await (0, triggers_db_1.markFailed)(env, messageId, String(error));
            }
        }
    }
    static async sendEmail(env, to, subject, html) {
        if (!env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY tanımlı değil');
        }
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vasi <noreply@vasi.app>',
                to: `${to.email}`,
                subject: subject,
                html: html
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('sendEmail hata:', errorText);
            throw new Error(`E-posta gönderme başarısız: ${errorText}`);
        }
        return await response.json();
    }
}
exports.DeliveryService = DeliveryService;
