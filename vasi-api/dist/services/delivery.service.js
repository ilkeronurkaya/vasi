import { findDueMessages, setTrigger, markDelivered, markFailed } from '../db/triggers.db';
import { findById } from '../db/messages.db';
export class DeliveryService {
    static async scheduleMessage(env, messageId, userId, scheduledAt) {
        const message = await findById(env, messageId, userId);
        if (!message) {
            return { error: 'Mesaj bulunamadı', code: 'NOT_FOUND', status: 404 };
        }
        try {
            await setTrigger(env, messageId, scheduledAt);
            return { message: 'Mesaj zamanlandı' };
        }
        catch (error) {
            console.error('scheduleMessage hata:', error);
            return { error: 'Zamanlama sırasında hata oluştu', code: 'INTERNAL_ERROR', status: 500 };
        }
    }
    static async deliverDueMessages(env) {
        const dueMessages = await findDueMessages(env);
        for (const message of dueMessages.results) {
            try {
                // Alıcıları çek
                // Bu kısım için recipients.db.ts'den bir fonksiyon kullanılabilir
                // Örneğin: const recipients = await RecipientsDB.findByMessageId(env, message.id);
                // E-posta gönderme işlemi (Resend API)
                // Örneğin: await this.sendEmail(env, recipient.email, message.subject, message.content_text);
                // Mesajı teslim edildi olarak işaretle
                await markDelivered(env, message.id);
            }
            catch (error) {
                console.error('deliverDueMessages hata:', error);
                await markFailed(env, message.id, String(error));
            }
        }
    }
    static async sendEmail(env, to, subject, html) {
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
