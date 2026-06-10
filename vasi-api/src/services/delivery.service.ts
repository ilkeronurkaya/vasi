
import type { Env } from '../types';
import { findDueMessages, setTrigger, markDelivered, markFailed } from '../db/triggers.db';
import { findById } from '../db/messages.db';

export class DeliveryService {
  static async scheduleMessage(env: Env, messageId: string, userId: string, scheduledAt: string) {
    const message = await findById(env, messageId, userId);
    if (!message) {
      return { error: 'Mesaj bulunamadı', code: 'NOT_FOUND', status: 404 };
    }
    try {
      await setTrigger(env, messageId, scheduledAt);
      return { message: 'Mesaj zamanlandı' };
    } catch (error) {
      console.error('scheduleMessage hata:', error);
      return { error: 'Zamanlama sırasında hata oluştu', code: 'INTERNAL_ERROR', status: 500 };
    }
  }

  static async deliverDueMessages(env: Env) {
    const dueMessages = await findDueMessages(env);
    for (const message of dueMessages.results) {
      const messageId = message.id as string;
      try {
        await markDelivered(env, messageId);
      } catch (error) {
        console.error('deliverDueMessages hata:', error);
        await markFailed(env, messageId, String(error));
      }
    }
  }

  static async sendEmail(env: Env, to: { name: string; email: string }, subject: string, html: string) {
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
