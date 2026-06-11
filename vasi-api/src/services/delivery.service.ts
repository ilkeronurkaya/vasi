
import type { Env } from '../types';
import { findDueMessages, setTrigger, markDelivered, markFailed } from '../db/triggers.db';
import { findById } from '../db/messages.db';
import { findByMessage } from '../db/recipients.db';

export class DeliveryService {
  static async scheduleMessage(env: Env, messageId: string, userId: string, scheduledAt: string) {
    const message = await findById(env, messageId, userId);
    if (!message) {
      return { error: 'Mesaj bulunamadı', code: 'NOT_FOUND', status: 404 };
    }
    const ts = new Date(scheduledAt).getTime();
    if (Number.isNaN(ts) || ts <= Date.now()) {
      return { error: 'Gönderim tarihi gelecekte olmalı', code: 'VALIDATION_ERROR', status: 400 };
    }
    try {
      await setTrigger(env, messageId, scheduledAt);
      return { message: 'Mesaj zamanlandı' };
    } catch (error) {
      console.error('scheduleMessage hata:', error);
      return { error: 'Zamanlama sırasında hata oluştu', code: 'INTERNAL_ERROR', status: 500 };
    }
  }

  static async deliverDueMessages(env: Env): Promise<{ delivered: number; failed: number }> {
    const dueMessagesResult = await findDueMessages(env);
    const dueMessages = dueMessagesResult.results as Array<{ id: string; user_id: string; title: string; content_text?: string }>;
    let delivered = 0;
    let failed = 0;

    for (const message of dueMessages) {
      const messageId = message.id;

      try {
        const recipientsResult = await findByMessage(env, messageId);
        const recipients = recipientsResult.results as Array<{ full_name: string; email: string }>;

        if (!recipients || recipients.length === 0) {
          await markDelivered(env, messageId);
          delivered++;
          continue;
        }

        for (const recipient of recipients) {
          await this.sendEmail(
            env,
            { name: recipient.full_name, email: recipient.email },
            message.title as string,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#D4763B">Geleceğinizden bir mesaj</h2>
              <p style="font-size:16px;line-height:1.6;color:#333">${message.content_text ?? ''}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="font-size:12px;color:#999">Bu mesaj Vasi aracılığıyla gönderilmiştir.</p>
            </div>`
          );
        }

        await markDelivered(env, messageId);
        delivered++;
      } catch (error) {
        console.error('deliverDueMessages hata:', error);
        await markFailed(env, messageId, String(error));
        failed++;
      }
    }

    return { delivered, failed };
  }

  static async sendEmail(env: Env, to: { name: string; email: string }, subject: string, html: string) {
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
        from: env.EMAIL_FROM ?? 'Vasi <onboarding@resend.dev>',
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
