# Vasi — DB Migrations

Cloudflare D1 (SQLite) için migration dosyaları.

## Uygulama

```bash
# Local
wrangler d1 migrations apply vasi-db --local

# Production
wrangler d1 migrations apply vasi-db
```

## Dosyalar

| Dosya | Tablo | Açıklama |
|-------|-------|---------|
| 0001 | users | Kullanıcılar |
| 0002 | subscriptions | Abonelikler + İyzico kart token'ları |
| 0003 | messages | Mesajlar |
| 0004 | message_files | Ses ve fotoğraf dosyaları (R2 referansları) |
| 0005 | recipients | Alıcılar + OTP doğrulama |
| 0006 | triggers | Mesaj zamanlama |
| 0007 | refresh_tokens | JWT refresh token'ları |
| 0008 | email_verifications | Kayıt e-posta OTP |
| 0009 | audit_logs | KVKK uyumu için işlem günlüğü |

## Şifreleme Notları

Aşağıdaki alanlar uygulama katmanında AES-256-GCM ile şifrelenir,
D1'e şifreli halde kaydedilir:

- `messages.content_text`
- `message_files.storage_key`
- `recipients.email`
- `recipients.phone`
- `subscriptions.iyzico_card_user_key`
- `subscriptions.iyzico_card_token`

## Yeni Migration Ekleme

```bash
# Boş migration dosyası oluştur
wrangler d1 migrations create vasi-db <migration-name>
```

Her migration dosyasında `-- migrate:up` ve `-- migrate:down` bloklarını kullan.
