# Vasi App — Ürün Gereksinim Dokümanı (PRD)
**Versiyon:** 1.0  
**Tarih:** Mayıs 2026  
**Durum:** Pre-Seed / MVP Planlaması  
**Gizlilik:** Dahili Kullanım

---

## İçindekiler

1. [Ürün Özeti](#1-urun-ozeti)
2. [Hedef Kitle & Kullanıcı Personas](#2-hedef-kitle--kullanici-personas)
3. [Fonksiyonel Gereksinimler](#3-fonksiyonel-gereksinimler)
4. [Kullanıcı Akışları (User Flows)](#4-kullanici-akislari-user-flows)
5. [Veri Modeli](#5-veri-modeli)
6. [API Tasarımı](#6-api-tasarimi)
7. [Ölüm Teyit Mekanizması](#7-olum-teyit-mekanizmasi)
8. [Güvenlik & KVKK](#8-guvenlik--kvkk)
9. [Platform & Teknik Yığın (Tech Stack)](#9-platform--teknik-yigin-tech-stack)
10. [MVP Kapsamı & Faz Planı](#10-mvp-kapsami--faz-plani)
11. [Performans Gereksinimleri](#11-performans-gereksinimleri)
12. [Açık Sorular & Riskler](#12-acik-sorular--riskler)

---

## 1. Ürün Özeti

### 1.1 Problem

İnsanlar hayatları boyunca söyleyemedikleri sözleri, iletmedikleri mesajları ve paylaşamadıkları mirası içlerinde taşırlar. Türkiye'de mevcut hiçbir dijital platform, yaşayan bir bireyin kendi iradesiyle —ölüm öncesinde— sevdiklerine bırakmak istediği mesajı güvenle saklayıp, doğrulanmış bir ölüm olayı sonrası iletme hizmeti sunmamaktadır.

### 1.2 Çözüm

**Vasi App**, kullanıcının:
- Ses, video, yazı veya belge formatında mesaj oluşturmasına,
- Alıcıları (ad-soyad, e-posta, telefon, adres) belirlemesine,
- Mesajların ne zaman ve nasıl iletileceğini kontrol etmesine,
- Ölüm olayının devlet API'leri veya güvenilir kişi bildirimi aracılığıyla doğrulanmasına,

olanak tanıyan uçtan uca dijital miras platformudur.

### 1.3 Kapsam Dışı (Out of Scope)

- Vasiyetname veya noter hizmeti
- Yapay zeka avatar / dijital klon
- Cenaze planlama, defin organizasyonu
- Sosyal ağ / anma sayfası (bu alan Simmortals tarafından karşılanmaktadır)

---

## 2. Hedef Kitle & Kullanıcı Personas

### Persona 1 — Ayşe (32 yaş, İstanbul)
- **Rol:** İki çocuk annesi, çalışan
- **Motivasyon:** Çocuklarına geleceğe dönük mesajlar bırakmak istiyor
- **Engel:** "Ölüm" konuşmak psikolojik güçlük yaratıyor
- **Kanal:** Instagram, öneri ağı

### Persona 2 — Mehmet (47 yaş, Ankara)
- **Rol:** Girişimci, geniş aile
- **Motivasyon:** Helâllaşma, nasihat bırakma, ebeveynlerine mesaj
- **Engel:** Platform güvenilirliği sorgusu, veri gizliliği
- **Kanal:** Referans/tavsiye

### Persona 3 — Selin (24 yaş, İzmir)
- **Rol:** Üniversite mezunu, dijital native
- **Motivasyon:** "Geleceğe mektup" kavramı, yaratıcı ifade
- **Engel:** Değeri düşük algılayabilir; fiyat hassasiyeti
- **Kanal:** TikTok, YouTube

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Kimlik Doğrulama & Kayıt

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| AUTH-01 | Kullanıcı e-posta + şifre ile kayıt olabilir | P0 |
| AUTH-02 | Kayıt sırasında TC Kimlik No, ad, soyad, doğum tarihi alınır | P0 |
| AUTH-03 | E-posta doğrulama (OTP veya link) zorunludur | P0 |
| AUTH-04 | SMS OTP ile 2FA opsiyonel (P1'de zorunlu) | P1 |
| AUTH-05 | Sosyal login (Google, Apple) desteği | P2 |
| AUTH-06 | Kullanıcı hesap silme talebi → 30 gün içinde veri imhası | P0 |

### 3.2 Abonelik & Ödeme

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| SUB-01 | 4 plan tipi: Temel, Ses+, Video+, Tam Paket | P0 |
| SUB-02 | Yıllık ödeme döngüsü; otomatik yenileme | P0 |
| SUB-03 | İyzico veya Stripe ile ödeme altyapısı | P0 |
| SUB-04 | Plan yenilenmezse uyarı (T-30, T-7, T-1 gün) | P0 |
| SUB-05 | Uygulama içinden ek mesaj satın alma (IAP) | P1 |
| SUB-06 | Fatura / e-arşiv fatura entegrasyonu | P1 |

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
| MSG-08 | Plan limitine göre maks. 3 mesaj; ek satın alımla artırılabilir | P0 |
| MSG-09 | Her mesaj için alıcı listesi ayrı yönetilebilir | P0 |
| MSG-10 | Mesaj süresi dolmaz; yıllık abonelik süresince korunur | P0 |

### 3.4 Alıcı Yönetimi

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| RCP-01 | Alıcı bilgileri: ad, soyad, e-posta (zorunlu), telefon (opsiyonel), posta adresi (opsiyonel) | P0 |
| RCP-02 | Bir mesaja birden fazla alıcı eklenebilir | P0 |
| RCP-03 | Alıcı bilgileri şifreli saklanır | P0 |
| RCP-04 | Alıcı e-posta adresi sisteme kaydedilir; ölüm sonrası bu adrese bildirim gider | P0 |
| RCP-05 | Alıcı posta adresi varsa fiziksel gönderim de desteklenir (Faz 2) | P2 |

### 3.5 Güvenilir Kişi (Trusted Contact)

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| TC-01 | Kullanıcı 1-2 güvenilir kişi belirleyebilir | P0 |
| TC-02 | Güvenilir kişi ölüm bildirimi yapabilir (form + belge yükleme) | P0 |
| TC-03 | Güvenilir kişi bildirimi onay sürecinden geçer (48 saat bekleme + admin onayı) | P0 |

### 3.6 Ölüm Teyit & Tetikleme

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| TRIG-01 | Mock mekanizma: Yıllık yenileme yapılmazsa T+90 günde bekleme modu | P0 |
| TRIG-02 | Bekleme modu: Kullanıcıya 3 bildirim (e-posta + SMS) | P0 |
| TRIG-03 | Güvenilir kişi bildirimi ile manuel tetikleme | P0 |
| TRIG-04 | Tetikleme sonrası mesaj kuyruğa alınır; iletim 24 saat içinde | P0 |
| TRIG-05 | NVI/MERNIS API entegrasyonu (Faz 2 — anlaşma bağımlı) | P2 |
| TRIG-06 | Yanlış tetiklemede geri alma süreci (72 saat içinde kullanıcı itirazı) | P0 |

### 3.7 Mesaj İletimi

| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| DEL-01 | E-posta ile mesaj iletimi (link veya ek) | P0 |
| DEL-02 | SMS ile bildirim (alıcıya mesaj bırakıldığı haber verilir) | P0 |
| DEL-03 | Alıcı erişim kodu ile mesaja güvenli erişim | P0 |
| DEL-04 | Alıcı mesajı indirip kaydedebilir | P0 |
| DEL-05 | Fiziksel posta ile USB/baskı gönderimi (Faz 2) | P2 |

---

## 4. Kullanıcı Akışları (User Flows)

### 4.1 Kayıt & Onboarding

```
[Uygulama Aç] 
  → [Hoş Geldin Ekranı — değer önerisi]
  → [E-posta + Şifre]
  → [Kimlik Bilgileri: TC, Ad, Soyad, Doğum Tarihi]
  → [E-posta Doğrulama OTP]
  → [Plan Seçimi]
  → [Ödeme]
  → [Dashboard — "İlk mesajınızı oluşturun"]
```

### 4.2 Mesaj Oluşturma

```
[Dashboard → Yeni Mesaj]
  → [Mesaj Tipi Seç: Yazı / Ses / Video / Karma]
  → [İçerik Gir / Kaydet / Yükle]
  → [Başlık & Notlar]
  → [Alıcıları Belirle]
  → [Önizle]
  → [Taslak Kaydet VEYA Kilitle]
```

### 4.3 Tetikleme Akışı (Mock)

```
[Yıllık Yenileme Yapılmadı]
  → [T+30: 1. Hatırlatma e-posta + SMS]
  → [T+60: 2. Hatırlatma + güvenilir kişiye bilgi]
  → [T+90: 3. Son uyarı + hesap "Bekleme Modu"]
  → [T+180: Güvenilir kişi bildirimi yoksa hesap dondurulur]
  
[Güvenilir Kişi Bildirimi]
  → [Form + Ölüm Belgesi Yükleme]
  → [Admin İncelemesi (48 saat)]
  → [Onay → Mesaj Kuyruğu → İletim]
  → [Alıcılara E-posta + SMS]
  → [Alıcı Güvenli Erişim Sayfası]
```

---

## 5. Veri Modeli

### 5.1 Core Entities

```sql
-- Kullanıcılar
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  tc_identity_no  VARCHAR(11),           -- Şifreli saklanır
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  birth_date      DATE,
  phone           VARCHAR(20),
  status          ENUM('active','suspended','deceased','deleted') DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Abonelikler
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  plan_type       ENUM('basic','audio_plus','video_plus','full') NOT NULL,
  status          ENUM('active','expired','cancelled') DEFAULT 'active',
  started_at      TIMESTAMP NOT NULL,
  expires_at      TIMESTAMP NOT NULL,
  payment_ref     VARCHAR(255),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Mesajlar
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  title           VARCHAR(255),
  message_type    ENUM('text','audio','video','document','mixed') NOT NULL,
  content_text    TEXT,                  -- Şifreli
  is_locked       BOOLEAN DEFAULT FALSE,
  status          ENUM('draft','locked','delivered','error') DEFAULT 'draft',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Mesaj Medya Dosyaları
CREATE TABLE message_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID REFERENCES messages(id),
  file_type       ENUM('audio','video','image','document'),
  storage_key     VARCHAR(500) NOT NULL,  -- S3/CDN anahtarı; şifreli
  file_size_bytes BIGINT,
  duration_sec    INTEGER,               -- Ses/video için
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Alıcılar
CREATE TABLE recipients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID REFERENCES messages(id),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,  -- Şifreli
  phone           VARCHAR(20),            -- Şifreli
  address         TEXT,                   -- Şifreli
  access_token    VARCHAR(64) UNIQUE,     -- İletim sonrası oluşturulur
  delivered_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Güvenilir Kişiler
CREATE TABLE trusted_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  relationship    VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Tetikleme Olayları
CREATE TABLE trigger_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  trigger_type    ENUM('renewal_miss','trusted_contact','api_death','manual_admin'),
  status          ENUM('pending','processing','completed','rejected','rolled_back'),
  evidence_url    VARCHAR(500),          -- Yüklenen belge
  reviewed_by     UUID,
  triggered_at    TIMESTAMP DEFAULT NOW(),
  processed_at    TIMESTAMP
);

-- Denetim Günlüğü
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,
  action          VARCHAR(255) NOT NULL,
  entity_type     VARCHAR(100),
  entity_id       UUID,
  ip_address      INET,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Veri Şifreleme Politikası

| Alan | Şifreleme | Yöntem |
|------|-----------|--------|
| `tc_identity_no` | Uygulama katmanı | AES-256-GCM |
| `content_text` | Uygulama katmanı | AES-256-GCM |
| `email` (alıcı) | Uygulama katmanı | AES-256-GCM |
| `phone` (alıcı) | Uygulama katmanı | AES-256-GCM |
| `address` | Uygulama katmanı | AES-256-GCM |
| `storage_key` | Uygulama katmanı | AES-256-GCM |
| Medya dosyaları | Depolama katmanı | S3 SSE-KMS |
| Veritabanı | Disk katmanı | AES-256 at-rest |
| Transit | TLS 1.3 | — |

---

## 6. API Tasarımı

### 6.1 Temel İlkeler

- RESTful API, JSON
- Versiyonlama: `/api/v1/`
- JWT Bearer Token kimlik doğrulama (access: 1s, refresh: 7g)
- Rate limiting: 100 req/dk (auth hariç)
- HTTPS zorunlu

### 6.2 Endpoint Listesi

#### Kimlik Doğrulama
```
POST   /api/v1/auth/register        # Kayıt
POST   /api/v1/auth/login           # Giriş → JWT
POST   /api/v1/auth/refresh         # Token yenile
POST   /api/v1/auth/logout          # Çıkış
POST   /api/v1/auth/verify-email    # OTP doğrulama
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

#### Kullanıcı
```
GET    /api/v1/users/me             # Profil bilgisi
PATCH  /api/v1/users/me            # Profil güncelle
DELETE /api/v1/users/me            # Hesap silme talebi
GET    /api/v1/users/me/subscription
```

#### Abonelik
```
GET    /api/v1/plans                # Mevcut planlar
POST   /api/v1/subscriptions        # Plan satın al
GET    /api/v1/subscriptions/current
POST   /api/v1/subscriptions/renew
DELETE /api/v1/subscriptions/current  # İptal
```

#### Mesajlar
```
GET    /api/v1/messages             # Mesaj listesi
POST   /api/v1/messages             # Yeni mesaj oluştur
GET    /api/v1/messages/:id
PATCH  /api/v1/messages/:id         # Güncelle (kilit yoksa)
DELETE /api/v1/messages/:id
POST   /api/v1/messages/:id/lock    # Kilitle
POST   /api/v1/messages/:id/unlock  # Kilidi aç
POST   /api/v1/messages/:id/files   # Dosya ekle (multipart)
DELETE /api/v1/messages/:id/files/:fileId
```

#### Alıcılar
```
GET    /api/v1/messages/:id/recipients
POST   /api/v1/messages/:id/recipients
PATCH  /api/v1/messages/:id/recipients/:rId
DELETE /api/v1/messages/:id/recipients/:rId
```

#### Güvenilir Kişiler
```
GET    /api/v1/trusted-contacts
POST   /api/v1/trusted-contacts
DELETE /api/v1/trusted-contacts/:id
POST   /api/v1/trusted-contacts/notify   # Ölüm bildirimi (herkese açık, token ile)
```

#### Alıcı Erişimi (Kimlik doğrulama gerektirmez)
```
GET    /api/v1/delivery/:accessToken       # Mesaj içeriği
POST   /api/v1/delivery/:accessToken/confirm  # Teslim alındı onayı
```

### 6.3 Örnek Request/Response

**POST /api/v1/messages**
```json
// Request
{
  "title": "Annem için",
  "message_type": "text",
  "content_text": "Anneciğim, sana söyleyemediklerim...",
  "recipients": [
    {
      "full_name": "Fatma Yılmaz",
      "email": "fatma@example.com",
      "phone": "+905551234567"
    }
  ]
}

// Response 201
{
  "id": "uuid-xxx",
  "title": "Annem için",
  "status": "draft",
  "message_type": "text",
  "is_locked": false,
  "recipients_count": 1,
  "created_at": "2026-05-25T10:00:00Z"
}
```

---

## 7. Ölüm Teyit Mekanizması

### 7.1 Faz 1 — Mock / Manuel (MVP)

```
┌─────────────────────────────────────────────────────┐
│              MOCK ÖLÜM TEYİT SİSTEMİ               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  YOLU A: Yıllık Yenileme Kontrolü                  │
│  ─────────────────────────────────                  │
│  subscription.expires_at geçti                      │
│    → T+30: E-posta + SMS uyarı #1                   │
│    → T+60: E-posta + SMS uyarı #2 + TC bilgilendirme│
│    → T+90: Hesap "waiting_mode"                     │
│    → T+180: Admin incelemesi                        │
│                                                     │
│  YOLU B: Güvenilir Kişi Bildirimi                  │
│  ────────────────────────────────                   │
│  POST /trusted-contacts/notify                      │
│    body: { token, death_cert_url, notes }           │
│    → Admin onay kuyruğuna girer                     │
│    → 48 saat bekleme süresi                         │
│    → Onay → trigger_events kaydı → mesaj kuyruğu   │
│                                                     │
│  YOLU C: Kullanıcı "Kilitli Hesap" Talebi          │
│  ────────────────────────────────────               │
│  Kullanıcı kendi ölümü için ön yetkilendirme form  │
│  (noter onaylı veya resmi belge ile — Faz 1.5)     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Faz 2 — MERNIS/NVI Entegrasyonu

```
┌─────────────────────────────────────────────────────┐
│              DEVLET API ENTEGRASYONU                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Protokol: T.C. İçişleri Bakanlığı / NVI           │
│  API: MERNIS Kişi Sorgulama Servisi                │
│  Tetik: Günlük cron job                            │
│                                                     │
│  Akış:                                              │
│  CRON(daily 02:00) → aktif kullanıcıları al        │
│    → her TC no için NVI API çağrısı                │
│    → vefat_tarihi alanı dolu mu?                   │
│      EVET → trigger_events INSERT                  │
│             → mesaj kuyruğuna al                   │
│             → 24 saat içinde iletim                │
│                                                     │
│  Önkoşullar:                                        │
│  - NVI ile veri işleme protokolü                   │
│  - KVKK kapsamında özel kategori veri işleme izni  │
│  - Güvenli API ağ geçidi (VPN/whitelist)           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.3 Anti-Fraud Önlemleri

- Güvenilir kişi bildirimi için ölüm belgesi veya muhtarlık yazısı zorunlu
- 48 saatlik bekleme süresi (kullanıcı itiraz edebilir)
- Yanlış bildirim için güvenilir kişi hesabı askıya alma
- İlk 3 gün içinde itiraz mekanizması

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
| Veri minimizasyonu | Yalnızca zorunlu alanlar toplanır |
| Veri imhası | Hesap silme → 30 gün içinde tüm veriler silinir |
| Saklama süresi | Abonelik + 1 yıl (maksimum) |
| Veri sorumlusu bildirimi | KVK Kurumu'na kayıt |
| Güvenlik ihlali bildirimi | 72 saat içinde KVK Kurumu + kullanıcılar |

### 8.3 Özel Kategori Veri İşleme

TC Kimlik Numarası özel kategori veri kapsamındadır. İşleme için:
- Açık rıza (madde 6/2-a)
- Hukuki yükümlülük (madde 6/2-ç) — NVI entegrasyonu

---

## 9. Platform & Teknik Yığın (Tech Stack)

### 9.1 Önerilen Yığın (MVP)

| Katman | Teknoloji | Gerekçe |
|--------|----------|---------|
| Mobil (iOS) | React Native | Cross-platform, hızlı MVP |
| Mobil (Android) | React Native | Tek kod tabanı |
| Web | Next.js 14 | SSR, SEO, React Native ile uyum |
| Backend API | Node.js + Express / NestJS | Ekosistem, hız |
| Veritabanı | PostgreSQL (Supabase) | Güvenilir, managed |
| Dosya Depolama | AWS S3 + CloudFront | Şifreli, ölçeklenebilir |
| Kimlik Doğrulama | Supabase Auth / Custom JWT | — |
| Ödeme | İyzico (TR) | Türkiye pazarı uyumu |
| E-posta | SendGrid / AWS SES | Güvenilir iletim |
| SMS | Netgsm / Twilio | Türkiye numara desteği |
| Görev Kuyruğu | BullMQ (Redis) | Cron, mesaj iletim kuyruğu |
| Monitoring | Sentry + Grafana | Hata takibi, metrikler |
| CI/CD | GitHub Actions + Vercel | Otomatik deploy |

### 9.2 Depolama Tahminleri (Yıl 1)

| İçerik | Ortalama Boyut | 2.000 kullanıcı @ 3 mesaj |
|--------|---------------|--------------------------|
| Yazılı mesaj | ~50 KB | ~300 MB |
| Ses kaydı (10 dk) | ~10 MB | ~60 GB |
| Video (5 dk) | ~150 MB | ~900 GB |
| Belgeler | ~5 MB | ~30 GB |
| **Toplam (karışık plan)** | — | **~500 GB** |

---

## 10. MVP Kapsamı & Faz Planı

### Faz 0 — Hazırlık (Haziran 2026)
- [ ] Teknik ekip / ajans seçimi
- [ ] Figma prototipi (onboarding + mesaj oluşturma)
- [ ] Altyapı kurulumu (AWS, Supabase, CI/CD)
- [ ] KVKK hukuki danışmanlığı

### Faz 1 — MVP Beta (Ağustos 2026)
**Kapsam:**
- [ ] Kayıt / giriş / kimlik doğrulama
- [ ] Temel ve Ses+ plan satın alma (İyzico)
- [ ] Yazılı ve sesli mesaj oluşturma
- [ ] Alıcı yönetimi
- [ ] Güvenilir kişi bildirimi (mock tetikleme)
- [ ] E-posta ile mesaj iletimi
- [ ] Dashboard (mesaj listesi, durum)

**Beta Hedefi:** 100 davetli kullanıcı, iOS + Android + Web

### Faz 2 — Genel Çıkış (Kasım 2026)
- [ ] Video mesaj desteği
- [ ] Belge ekleme
- [ ] Tam Paket planı
- [ ] SMS bildirimleri
- [ ] Alıcı güvenli erişim sayfası
- [ ] NVI API pilot görüşmeleri

### Faz 3 — Büyüme (Şubat 2027)
- [ ] B2B API (sigorta / banka entegrasyonu)
- [ ] Fiziksel posta gönderimi
- [ ] Çok dil desteği (EN)

---

## 11. Performans Gereksinimleri

| Metrik | Hedef |
|--------|-------|
| API yanıt süresi (P95) | < 300 ms |
| Dosya yükleme (100 MB) | < 30 saniye |
| Mobil uygulama soğuk başlatma | < 2 saniye |
| Mesaj iletim süresi (tetikten) | < 24 saat |
| Uptime SLA | %99.5 |
| Eşzamanlı kullanıcı (MVP) | 500 |

---

## 12. Açık Sorular & Riskler

| # | Soru / Risk | Öncelik | Sorumlu |
|---|------------|---------|---------|
| 1 | NVI API protokol süreci ne kadar sürer? | Kritik | Hukuk |
| 2 | Ölüm belgesi doğrulaması için e-devlet entegrasyonu mümkün mü? | Yüksek | Teknik |
| 3 | İyzico recurring payment desteği yeterli mi? | Yüksek | Teknik |
| 4 | Türkiye'de data residency zorunluluğu var mı? | Yüksek | Hukuk |
| 5 | Yanlış tetikleme durumunda kullanıcı bize dava açar mı? | Yüksek | Hukuk |
| 6 | iOS App Store ölüm temalı uygulama onayında güçlük çıkarır mı? | Orta | Ürün |
| 7 | Alıcıya mesaj ulaştığında alıcı reddetme hakkı var mı? | Orta | Hukuk |
| 8 | Veri ihlali senaryosunda sorumluluk sınırı nedir? | Yüksek | Hukuk |

---

*Vasi App PRD v1.0 — Mayıs 2026 — Gizli / Dahili Kullanım*
