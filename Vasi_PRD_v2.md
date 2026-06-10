# Vasi App — Ürün Gereksinim Dokümanı (PRD)
**Versiyon:** 2.0  
**Tarih:** Haziran 2026  
**Durum:** Pre-Seed / MVP Planlaması  
**Gizlilik:** Dahili Kullanım  
**Değişiklik:** v1'den geleceğe mesaj odağına geçiş; ölüm mekanizmaları, yasal süreçler ve devlet entegrasyonları kapsam dışına alındı.

---

## İçindekiler

1. [Ürün Özeti](#1-urun-ozeti)
2. [Hedef Kitle & Kullanıcı Personas](#2-hedef-kitle--kullanici-personas)
3. [Fonksiyonel Gereksinimler](#3-fonksiyonel-gereksinimler)
4. [Kullanıcı Akışları](#4-kullanici-akislari)
5. [Tetikleme Türleri](#5-tetikleme-turleri)
6. [Veri Modeli](#6-veri-modeli)
7. [API Tasarımı](#7-api-tasarimi)
8. [Güvenlik & KVKK](#8-guvenlik--kvkk)
9. [Platform & Teknik Yığın](#9-platform--teknik-yigin)
10. [MVP Kapsamı & Faz Planı](#10-mvp-kapsami--faz-plani)
11. [Performans Gereksinimleri](#11-performans-gereksinimleri)
12. [Açık Sorular & Riskler](#12-acik-sorular--riskler)

---

## 1. Ürün Özeti

### 1.1 Problem

İnsanlar, önemli anlara özel söylemek istediklerini tam zamanında iletemeyen bir hayat yaşıyor. Çocuğunun 18. yaşgününde "gurur duyuyorum" demek için orada olmak, yıllarca yenilenen bir evlilik yıldönümüne sürpriz hazırlamak, ya da mezun olan bir arkadaşa yıllarca önce yazılmış bir mektup ulaştırmak — bunlar şu an var olan hiçbir araçla doğal biçimde yapılamıyor.

### 1.2 Çözüm

**Vasi App**, kullanıcının:
- Metin, ses, video veya belge formatında mesaj oluşturmasına,
- Alıcıları belirlemesine,
- Mesajın **belirli bir tarihte**, **tekrarlayan bir etkinlikte** veya **kullanıcı tanımlı bir koşulda** iletilmesini ayarlamasına

olanak tanıyan bir **zaman kapsülü ve geleceğe mesaj platformudur.**

### 1.3 Temel Değer Önerisi

> "Bugün yaz. Doğru anda iletilsin."

Vasi; doğum günleri, yıldönümleri, mezuniyetler, önemli kararlar veya herhangi bir gelecek an için kişisel mesajları güvenle saklar ve zamanı geldiğinde iletir.

### 1.4 Kapsam Dışı (Out of Scope)

- Ölüm teyidi, vasiyetname veya cenaze planlaması
- Devlet API entegrasyonları (MERNIS, NVI, e-Devlet)
- Noterlik veya hukuki belge hizmetleri
- Sosyal ağ veya anma sayfası
- Yapay zeka avatar / dijital klon

---

## 2. Hedef Kitle & Kullanıcı Personas

### Persona 1 — Ayşe (32 yaş, İstanbul)
- **Rol:** İki çocuk annesi, çalışan
- **Motivasyon:** Çocuklarına büyüdüklerinde okuyacakları mektuplar, 18. yaş, mezuniyet gibi anlara özel mesajlar bırakmak istiyor
- **Kanal:** Instagram, arkadaş tavsiyesi

### Persona 2 — Mehmet (47 yaş, Ankara)
- **Rol:** Girişimci, geniş aile
- **Motivasyon:** Her yıl yenilenen yıldönümü mesajları, çocuklarına düzenli "gurur duyuyorum" notları
- **Kanal:** Referans/tavsiye

### Persona 3 — Selin (24 yaş, İzmir)
- **Rol:** Üniversite mezunu, dijital native
- **Motivasyon:** "Geleceğe mektup" kavramı, kendine ve sevdiklerine ilham verici mesajlar bırakmak
- **Kanal:** TikTok, YouTube, Instagram Reels

### Persona 4 — Emre (35 yaş, remote çalışan)
- **Rol:** Yazılımcı, uzun dönem düşünen
- **Motivasyon:** 10 yıl sonra açılacak bir zaman kapsülü hazırlamak; hem kendi hem de arkadaş grubuna
- **Kanal:** Twitter/X, ürün toplulukları

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Kimlik Doğrulama & Kayıt

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| AUTH-01 | Kullanıcı e-posta + şifre ile kayıt olabilir | P0 |
| AUTH-02 | Kayıt sırasında ad, soyad, e-posta alınır | P0 |
| AUTH-03 | E-posta doğrulama (OTP veya link) zorunludur | P0 |
| AUTH-04 | SMS OTP ile 2FA opsiyonel | P1 |
| AUTH-05 | Sosyal login (Google, Apple) desteği | P1 |
| AUTH-06 | Hesap silme talebi → 30 gün içinde veri imhası | P0 |

### 3.2 Abonelik & Ödeme

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| SUB-01 | 4 plan tipi: Ücretsiz, Kişisel, Aile, Premium | P0 |
| SUB-02 | Aylık ve yıllık ödeme döngüsü; otomatik yenileme | P0 |
| SUB-03 | İyzico veya Stripe ile ödeme altyapısı | P0 |
| SUB-04 | Plan yenilenmezse uyarı (T-30, T-7, T-1 gün) | P0 |
| SUB-05 | Uygulama içinden ek mesaj satın alma (IAP) | P1 |
| SUB-06 | Fatura / e-arşiv fatura entegrasyonu | P1 |

**Plan Limitleri:**

| Plan | Mesaj | Alıcı/Mesaj | Medya | Ücret |
|------|-------|------------|-------|-------|
| Ücretsiz | 3 | 1 | — | ₺0 |
| Kişisel | 50 | 10 | 5 GB | ₺79/ay |
| Aile | Sınırsız | 20 | 20 GB | ₺149/ay |
| Premium | Sınırsız | Sınırsız | 100 GB | ₺299/ay |

### 3.3 Mesaj Yönetimi

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| MSG-01 | Kullanıcı yazılı mesaj oluşturabilir (maks. 10.000 karakter) | P0 |
| MSG-02 | Kullanıcı ses kaydı yükleyebilir / uygulama içinden kayıt yapabilir (maks. 30 dk) | P0 |
| MSG-03 | Kullanıcı video yükleyebilir / çekebilir (maks. 10 dk, 500 MB) | P1 |
| MSG-04 | Kullanıcı dosya/belge ekleyebilir (PDF, JPG, PNG; maks. 50 MB/dosya) | P1 |
| MSG-05 | Mesaj taslak olarak kaydedilebilir | P0 |
| MSG-06 | Mesaj kilitlenebilir (düzenleme kapatılır) | P0 |
| MSG-07 | Kilitli mesaj yeniden düzenlenebilir (kilit açılarak) | P0 |
| MSG-08 | Plan limitine göre mesaj sayısı kısıtlanır; ek satın alımla artırılabilir | P0 |
| MSG-09 | Her mesaj için alıcı listesi ayrı yönetilebilir | P0 |
| MSG-10 | Mesaj süresiz saklanır; aktif abonelik boyunca korunur | P0 |
| MSG-11 | Mesaj iptal edilebilir (henüz iletilmemişse) | P0 |
| MSG-12 | Kullanıcı iletilmiş mesajların teslimat durumunu görebilir | P0 |

### 3.4 Alıcı Yönetimi

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| RCP-01 | Alıcı bilgileri: ad, soyad, e-posta (zorunlu), telefon (opsiyonel) | P0 |
| RCP-02 | Bir mesaja birden fazla alıcı eklenebilir | P0 |
| RCP-03 | Alıcı bilgileri şifreli saklanır | P0 |
| RCP-04 | Alıcı rehberi: sık kullanılan alıcılar kayıt altında tutulur | P1 |
| RCP-05 | Alıcı mesaj gelmeden önce sisteme kaydolmak zorunda değil | P0 |

### 3.5 Tetikleme & Zamanlama

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| TRIG-01 | Belirli tarih ve saat ayarlama (örn: 15 Mart 2036, 09:00) | P0 |
| TRIG-02 | Tekrarlayan etkinlik (yıllık, aylık, haftalık) | P0 |
| TRIG-03 | Tetikleyici değiştirilebilir (mesaj kilitli değilse) | P0 |
| TRIG-04 | Zamanlama geçmişse mesaj otomatik iptal değil; kullanıcıya uyarı | P0 |
| TRIG-05 | Gönderim öncesi hatırlatma bildirimi (T-7 gün) | P1 |

### 3.6 Mesaj İletimi

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| DEL-01 | E-posta ile mesaj iletimi (link veya ek) | P0 |
| DEL-02 | SMS ile bildirim (alıcıya mesaj bırakıldığı haber verilir) | P1 |
| DEL-03 | Alıcı erişim kodu ile mesaja güvenli erişim | P0 |
| DEL-04 | Alıcı mesajı indirip kaydedebilir | P0 |
| DEL-05 | Alıcı mesajı reddetme/şikayet hakkına sahiptir | P1 |

---

## 4. Kullanıcı Akışları

### 4.1 Kayıt & Onboarding

```
[Uygulama Aç]
  → [Karşılama Ekranı — değer önerisi]
  → [E-posta + Şifre]
  → [E-posta Doğrulama OTP]
  → [Plan Seçimi]
  → [Ödeme (ücretsiz plan için atla)]
  → [Dashboard — "İlk mesajınızı oluşturun"]
```

### 4.2 Mesaj Oluşturma

```
[Dashboard → Yeni Mesaj]
  → [Mesaj Tipi Seç: Yazı / Ses / Video / Karma]
  → [İçerik Gir / Kaydet / Yükle]
  → [Başlık & Notlar]
  → [Alıcıları Belirle]
  → [Tetikleyici Ayarla: Tarih / Tekrar]
  → [Önizle]
  → [Taslak Kaydet VEYA Kilitle]
```

### 4.3 Alıcı Erişim Akışı

```
[Belirlenen Tarih Geldi]
  → [Sistem → Alıcıya E-posta + SMS]
  → [Alıcı Erişim Linkine Tıklar]
  → [Güvenli Erişim Sayfası — erişim kodu girişi]
  → [Mesaj Görüntülenir]
  → [İndir / Kaydet]
```

---

## 5. Tetikleme Türleri

### 5.1 Tek Seferlik Tarih
Kullanıcı belirli bir gün ve saat seçer. Sistem o anda mesajı iletir.

**Örnekler:**
- Çocuğunun 18. doğum günü
- Bir projenin 10. yıl dönümü
- Yılbaşı kutlaması

### 5.2 Tekrarlayan Etkinlik
Mesaj belirli aralıklarla aynı alıcıya iletilir.

| Tekrar | Açıklama |
|--------|---------|
| Yıllık | Her yıl aynı gün (örn: 14 Şubat) |
| Aylık | Her ayın belirli bir günü |
| Haftalık | Belirli bir hafta günü |

**Örnekler:**
- Her evlilik yıldönümünde eşe mesaj
- Her yılbaşında aile grubuna
- Her ay iş ortağına motivasyon notu

### 5.3 Gelecekte Açılacak Zaman Kapsülü
Kullanıcı mesajı oluşturur, uzun bir süre sonrası için (örn: 10 yıl) kilitler.
Açılana kadar içerik gizlenir; alıcı yalnızca "sana bir mesaj var, X tarihinde açılacak" bilgisini alır.

---

## 6. Veri Modeli

### 6.1 Core Entities

```sql
-- Kullanıcılar
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  status        ENUM('active','suspended','deleted') DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Abonelikler
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  plan_type     ENUM('free','personal','family','premium') NOT NULL,
  status        ENUM('active','expired','cancelled') DEFAULT 'active',
  started_at    TIMESTAMP NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  payment_ref   VARCHAR(255),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Mesajlar
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  title         VARCHAR(255),
  message_type  ENUM('text','audio','video','document','mixed') NOT NULL,
  content_text  TEXT,                   -- Şifreli
  is_locked     BOOLEAN DEFAULT FALSE,
  status        ENUM('draft','scheduled','delivered','cancelled','error') DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Mesaj Medya Dosyaları
CREATE TABLE message_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID REFERENCES messages(id),
  file_type       ENUM('audio','video','image','document'),
  storage_key     VARCHAR(500) NOT NULL,  -- Şifreli
  file_size_bytes BIGINT,
  duration_sec    INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Alıcılar
CREATE TABLE recipients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    UUID REFERENCES messages(id),
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,   -- Şifreli
  phone         VARCHAR(20),             -- Şifreli
  access_token  VARCHAR(64) UNIQUE,      -- İletim sonrası oluşturulur
  delivered_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Tetikleyiciler
CREATE TABLE triggers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID REFERENCES messages(id),
  trigger_type    ENUM('one_time','recurring') NOT NULL,
  scheduled_at    TIMESTAMP NOT NULL,     -- İlk / tek gönderim zamanı
  recurrence      ENUM('yearly','monthly','weekly'),  -- Tekrar türü (NULL = tek seferlik)
  recurrence_end  TIMESTAMP,              -- Tekrarın biteceği tarih (NULL = süresiz)
  next_run_at     TIMESTAMP,              -- Sonraki çalışma zamanı
  last_run_at     TIMESTAMP,
  status          ENUM('active','paused','completed','cancelled') DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Denetim Günlüğü
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   UUID,
  ip_address  INET,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### 6.2 Veri Şifreleme Politikası

| Alan | Şifreleme | Yöntem |
|------|-----------|--------|
| `content_text` | Uygulama katmanı | AES-256-GCM |
| `email` (alıcı) | Uygulama katmanı | AES-256-GCM |
| `phone` (alıcı) | Uygulama katmanı | AES-256-GCM |
| `storage_key` | Uygulama katmanı | AES-256-GCM |
| Medya dosyaları | Depolama katmanı | S3 SSE-KMS |
| Veritabanı | Disk katmanı | AES-256 at-rest |
| Transit | TLS 1.3 | — |

---

## 7. API Tasarımı

### 7.1 Temel İlkeler

- RESTful API, JSON
- Versiyonlama: `/api/v1/`
- JWT Bearer Token kimlik doğrulama (access: 1 saat, refresh: 7 gün)
- Rate limiting: 100 req/dk
- HTTPS zorunlu

### 7.2 Endpoint Listesi

#### Kimlik Doğrulama
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

#### Kullanıcı
```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/subscription
```

#### Abonelik
```
GET    /api/v1/plans
POST   /api/v1/subscriptions
GET    /api/v1/subscriptions/current
POST   /api/v1/subscriptions/renew
DELETE /api/v1/subscriptions/current
```

#### Mesajlar
```
GET    /api/v1/messages
POST   /api/v1/messages
GET    /api/v1/messages/:id
PATCH  /api/v1/messages/:id
DELETE /api/v1/messages/:id
POST   /api/v1/messages/:id/lock
POST   /api/v1/messages/:id/unlock
POST   /api/v1/messages/:id/cancel
POST   /api/v1/messages/:id/files
DELETE /api/v1/messages/:id/files/:fileId
```

#### Alıcılar
```
GET    /api/v1/messages/:id/recipients
POST   /api/v1/messages/:id/recipients
PATCH  /api/v1/messages/:id/recipients/:rId
DELETE /api/v1/messages/:id/recipients/:rId
```

#### Tetikleyiciler
```
GET    /api/v1/messages/:id/trigger
POST   /api/v1/messages/:id/trigger
PATCH  /api/v1/messages/:id/trigger
DELETE /api/v1/messages/:id/trigger
```

#### Alıcı Erişimi (auth gerektirmez)
```
GET    /api/v1/delivery/:accessToken
POST   /api/v1/delivery/:accessToken/confirm
```

### 7.3 Örnek Request/Response

**POST /api/v1/messages**
```json
// Request
{
  "title": "Oğluma 18. yaş mesajı",
  "message_type": "text",
  "content_text": "Oğlum, 18 yaşına geldiğinde...",
  "trigger": {
    "trigger_type": "one_time",
    "scheduled_at": "2036-03-15T09:00:00Z"
  },
  "recipients": [
    {
      "full_name": "Emre Kaya",
      "email": "emre@example.com"
    }
  ]
}

// Response 201
{
  "id": "uuid-xxx",
  "title": "Oğluma 18. yaş mesajı",
  "status": "scheduled",
  "message_type": "text",
  "is_locked": false,
  "recipients_count": 1,
  "trigger": {
    "trigger_type": "one_time",
    "scheduled_at": "2036-03-15T09:00:00Z"
  },
  "created_at": "2026-06-07T10:00:00Z"
}
```

---

## 8. Güvenlik & KVKK

### 8.1 Güvenlik Mimarisi

```
[Mobil/Web Client]
    ↓ HTTPS (TLS 1.3)
[API Gateway — Rate Limit, DDoS Koruma]
    ↓
[Auth Middleware — JWT Doğrulama]
    ↓
[Application Layer — Şifreleme/Çözme]
    ↓
[PostgreSQL — At-rest AES-256]
[S3/Object Storage — SSE-KMS]
```

### 8.2 KVKK Uyum Gereksinimleri

| Gereksinim | Uygulama |
|-----------|---------|
| Açık rıza | Kayıt, mesaj oluşturma, alıcı ekleme aşamalarında |
| Veri minimizasyonu | TC Kimlik No alınmaz; yalnızca ad, e-posta zorunlu |
| Veri imhası | Hesap silme → 30 gün içinde tüm veriler silinir |
| Saklama süresi | Abonelik + 1 yıl (maksimum) |
| Veri sorumlusu bildirimi | KVK Kurumu'na kayıt |
| Güvenlik ihlali bildirimi | 72 saat içinde KVK Kurumu + kullanıcılar |

---

## 9. Platform & Teknik Yığın

### 9.1 Seçilen Yığın

| Katman | Teknoloji | Gerekçe |
|--------|----------|---------|
| Web | Next.js 15 + Cloudflare Pages | Edge runtime, düşük maliyet, global CDN |
| Mobil (iOS+Android) | React Native | Tek kod tabanı, web ile paylaşılan mantık |
| Backend API | Node.js + Hono / NestJS | Edge uyumlu, hafif |
| Veritabanı | PostgreSQL (Supabase) | Managed, güvenilir, ücretsiz tier |
| Dosya Depolama | Cloudflare R2 | S3 uyumlu, egress ücretsiz |
| Kimlik Doğrulama | Supabase Auth | JWT, sosyal login, OTP dahil |
| Ödeme | İyzico | Türkiye pazarı uyumu |
| E-posta | Resend veya AWS SES | Güvenilir, ucuz |
| SMS | Netgsm | Türkiye numara desteği, düşük maliyet |
| Görev Kuyruğu | Cloudflare Queues | Zamanlanmış mesaj iletimi, egress ücretsiz |
| Monitoring | Sentry | Hata takibi |
| CI/CD | GitHub Actions + Cloudflare Pages | Otomatik deploy |

### 9.2 Maliyet Öncelikleri

1. **Cloudflare ekosistemi** maksimize et (Pages, R2, Queues, Workers) — egress ve storage maliyeti minimumdur.
2. **Supabase free tier** ile başla; 500 MAU'ya kadar ücretsiz.
3. **Harici servis** eklemeden önce Cloudflare'de karşılanıp karşılanamayacağını sorgula.

### 9.3 Depolama Tahminleri (Yıl 1)

| İçerik | Ortalama Boyut | 2.000 kullanıcı @ 3 mesaj |
|--------|---------------|--------------------------|
| Yazılı mesaj | ~50 KB | ~300 MB |
| Ses kaydı (10 dk) | ~10 MB | ~60 GB |
| Video (5 dk) | ~150 MB | ~900 GB |
| Belgeler | ~5 MB | ~30 GB |
| **Toplam (karışık plan)** | — | **~500 GB** |

Cloudflare R2: ilk 10 GB ücretsiz, sonrası $0.015/GB/ay.  
500 GB ≈ **$7.35/ay** (egress ücretsiz).

---

## 10. MVP Kapsamı & Faz Planı

### Faz 0 — Hazırlık (Haziran 2026)
- [x] PRD v2 tamamlandı
- [x] Landing page (çoklu dil, responsive)
- [ ] Figma prototipi — onboarding + mesaj oluşturma
- [ ] Altyapı kurulumu (Cloudflare, Supabase, CI/CD)
- [ ] KVKK hukuki danışmanlığı

### Faz 1 — MVP Beta (Ağustos 2026)
**Kapsam:**
- [ ] Kayıt / giriş / e-posta doğrulama
- [ ] Ücretsiz ve Kişisel plan (İyzico)
- [ ] Yazılı mesaj oluşturma
- [ ] Tek seferlik tarih tetikleyicisi
- [ ] Alıcı yönetimi
- [ ] E-posta ile mesaj iletimi
- [ ] Alıcı güvenli erişim sayfası
- [ ] Dashboard (mesaj listesi, durum)

**Beta Hedefi:** 200 davetli kullanıcı, Web + iOS

### Faz 2 — Genel Çıkış (Kasım 2026)
- [ ] Sesli mesaj desteği
- [ ] Tekrarlayan tetikleyici (yıllık, aylık)
- [ ] Zaman kapsülü modu (açılana kadar içerik gizli)
- [ ] Video mesaj desteği
- [ ] SMS bildirimleri
- [ ] Aile planı
- [ ] Android uygulama

### Faz 3 — Büyüme (Şubat 2027)
- [ ] Alıcı rehberi
- [ ] Grup mesajları / toplu gönderim
- [ ] Premium plan + kurumsal API
- [ ] İngilizce pazara açılım

---

## 11. Performans Gereksinimleri

| Metrik | Hedef |
|--------|-------|
| API yanıt süresi (P95) | < 300 ms |
| Dosya yükleme (100 MB) | < 30 saniye |
| Web soğuk başlatma | < 1.5 saniye (Edge) |
| Mesaj iletim süresi (zamanında) | < 5 dakika sapma |
| Uptime SLA | %99.5 |
| Eşzamanlı kullanıcı (MVP) | 500 |

---

## 12. Açık Sorular & Riskler

| # | Soru / Risk | Öncelik | Sorumlu |
|---|------------|---------|---------|
| 1 | İyzico recurring payment mobile için nasıl çalışıyor? | Yüksek | Teknik |
| 2 | Alıcı e-postası değişmişse mesaj nasıl iletilecek? | Yüksek | Ürün |
| 3 | Çok uzak tarihli mesajlar (10+ yıl) için veri güvencesi nasıl verilecek? | Yüksek | Ürün + Hukuk |
| 4 | Abonelik iptalinde gelecekteki mesajlar ne olacak? | Yüksek | Ürün |
| 5 | iOS App Store mesaj zamanlama özelliği için kısıtlama var mı? | Orta | Teknik |
| 6 | Tekrar eden mesajlarda alıcının çıkma (unsubscribe) hakkı nasıl yönetilecek? | Orta | Hukuk |
| 7 | Cloudflare Queues'un uzun vadeli (10 yıl) zamanlama güvenilirliği yeterli mi? | Yüksek | Teknik |

---

*Vasi App PRD v2.0 — Haziran 2026 — Gizli / Dahili Kullanım*
