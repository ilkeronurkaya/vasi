
import type { Env } from '../types';
import { findDueMessages, setTrigger, markDelivered, markFailed } from '../db/triggers.db';
import { findById } from '../db/messages.db';
import { findByMessage } from '../db/recipients.db';

/**
 * Teslimat e-postası şablonu — e-posta istemcisi uyumlu (tablo tabanlı, inline stil).
 * Bilinçli olarak AÇIK tema: koyu tema e-postalarda istemci desteği zayıf.
 * Marka: offwhite zemin, bakır vurgu, sistem fontu. Mesaj içeriği e-postaya
 * GÖMÜLMEZ — gizlilik gereği görüntüleme bağlantısı taşır.
 */
function buildDeliveryEmail(opts: {
  recipientName: string;
  senderName: string;
  title: string;
  viewUrl: string;
}): string {
  const { recipientName, senderName, title, viewUrl } = opts;
  return `<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:0;background-color:#F5F3EE;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3EE;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="max-width:560px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E8E4DA;overflow:hidden;">
        <!-- Bakır şerit -->
        <tr><td style="height:4px;background-color:#D4763B;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:40px 40px 32px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <!-- Marka -->
          <p style="margin:0 0 28px;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#0C1525;">
            VASİ
          </p>
          <!-- Eyebrow -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#D4763B;">
            Geleceğinden bir mesaj
          </p>
          <!-- Başlık -->
          <h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.01em;color:#0C1525;">
            ${title}
          </h1>
          <!-- Gövde -->
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3D4452;">
            Sevgili ${recipientName},
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#3D4452;">
            <strong>${senderName}</strong> sana, doğru anda ulaşması için
            özenle sakladığımız bir mesaj bıraktı. Bugün o gün.
          </p>
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:12px;background-color:#D4763B;">
              <a href="${viewUrl}"
                style="display:inline-block;padding:13px 32px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                Mesajını Görüntüle
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9AA1AE;">
            Düğme çalışmazsa bu bağlantıyı tarayıcına yapıştır:<br/>
            <a href="${viewUrl}" style="color:#D4763B;word-break:break-all;">${viewUrl}</a>
          </p>
        </td></tr>
        <!-- Alt bilgi -->
        <tr><td style="padding:20px 40px;border-top:1px solid #F0EDE5;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9AA1AE;">
            Bu mesaj <a href="https://vasi.app" style="color:#D4763B;text-decoration:none;">Vasi</a> aracılığıyla iletildi —
            geleceğe mesaj bırakmanın güvenilir yolu.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * OTP doğrulama e-postası — teslimat şablonuyla aynı açık tema / tablo yapısı.
 * Kod 10 dakika geçerli; e-postada bunun dışında işlem bağlantısı yok.
 */
function buildOtpEmail(opts: { recipientName: string; otp: string }): string {
  const { recipientName, otp } = opts;
  return `<!DOCTYPE html>
<html lang="tr">
<body style="margin:0;padding:0;background-color:#F5F3EE;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3EE;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="max-width:480px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E8E4DA;overflow:hidden;">
        <tr><td style="height:4px;background-color:#D4763B;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:36px 40px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 24px;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#0C1525;">
            VASİ
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3D4452;">
            Sevgili ${recipientName},
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3D4452;">
            Mesajını görüntülemek için doğrulama kodun:
          </p>
          <p style="margin:0 0 24px;font-size:34px;font-weight:700;letter-spacing:0.18em;color:#0C1525;text-align:center;">
            ${otp}
          </p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9AA1AE;">
            Kod 10 dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
    const dueMessages = dueMessagesResult.results as Array<{ id: string; user_id: string; title: string; content_text?: string; sender_name?: string }>;
    let delivered = 0;
    let failed = 0;

    for (const message of dueMessages) {
      const messageId = message.id;

      try {
        const recipientsResult = await findByMessage(env, messageId);
        const recipients = recipientsResult.results as Array<{ id: string; full_name: string; email: string }>;

        if (!recipients || recipients.length === 0) {
          await markDelivered(env, messageId);
          delivered++;
          continue;
        }

        for (const recipient of recipients) {
          // Alıcıya özel erişim token'ı — mesaj içeriği e-postaya gömülmez
          const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
          await env.DB.prepare(
            "UPDATE recipients SET access_token = ?, delivered_at = datetime('now') WHERE id = ?"
          ).bind(token, recipient.id).run();
          const viewUrl = `${env.APP_URL ?? 'http://localhost:3000'}/m/${token}`;

          await this.sendEmail(
            env,
            { name: recipient.full_name, email: recipient.email },
            `Geleceğinden bir mesaj: ${message.title}`,
            buildDeliveryEmail({
              recipientName: recipient.full_name,
              senderName: message.sender_name ?? 'Bir yakının',
              title: message.title as string,
              viewUrl,
            })
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

  static async sendOtpEmail(env: Env, to: { name: string; email: string }, otp: string) {
    return await this.sendEmail(
      env,
      to,
      'Vasi doğrulama kodun',
      buildOtpEmail({ recipientName: to.name, otp })
    );
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
