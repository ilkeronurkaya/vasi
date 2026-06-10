# Vasi App — MVP Kapsam Özeti

**Versiyon:** 1.0  
**Tarih:** Haziran 2026  
**Hedef:** Ödeme alan, e-posta ve SMS gönderebilen çalışan sistem

---

## 1. Planlar

| Plan | Fiyat | Mesaj | Alıcı/Mesaj | Medya |
|------|-------|-------|-------------|-------|
| Ücretsiz | ₺0 | 3 | 1 | — |
| Kişisel | ₺490/yıl | 50 | 5 | 1 GB |

- Ödeme döngüsü: **yıllık**
- Kart saklama: **İyzico** (`cardUserKey` ile tokenizasyon)
- Ücretsiz kullanıcıdan da kart bilgisi alınır ve saklanır

---

## 2. Mesaj Formatları

MVP'de desteklenen formatlar:
- Yazı (max 10.000 karakter)
- Ses kaydı (uygulama içinden kayıt veya yükleme)
- Fotoğraf

Video ve belge desteği sonraki fazda.

---

## 3. Mesaj Oluşturma Akışı

Wizard (adım adım) yapısı:

```
Adım 1: Format seç (yazı / ses / fotoğraf)
Adım 2: İçerik gir / kaydet / yükle
Adım 3: Alıcıları ekle
Adım 4: Tarih belirle (tek seferlik)
Adım 5: Önizle + kilitle
```

---

## 4. Tetikleme

MVP'de yalnızca **tek seferlik tarih** tetikleyicisi.

Tekrarlayan (yıllık, aylık) ve zaman kapsülü modu sonraki fazda.

---

## 5. Alıcı Erişim Akışı

```
1. Belirtilen tarih gelir
2. Alıcıya e-posta VE/VEYA SMS gönderilir:
   → "Hakan sana bir mesaj bıraktı" (içerik yok, sadece isim)
   → [Mesajı Gör] butonu / linki
3. Alıcı linke tıklar
4. Alıcının kayıtlı kanalına (e-posta veya telefon) 6 haneli OTP gönderilir
   → İkisi de varsa alıcı seçer
   → Sadece biri varsa oraya gider
5. OTP doğrulanır → mesaj açılır
6. Sayfanın altında upsell CTA:
   → "Hakan sana bu mesajı yıllar önce bıraktı.
      Sen de sevdiklerine geleceğe mesaj bırakmak ister misin?"
   → [Ücretsiz Başla] butonu
```

**Önemli:** Upsell yalnızca mesaj görüntüleme sayfasında yer alır.  
Teslimat e-postası ve SMS'i sade kalır — sadece bildirim içerir.

---

## 6. Dashboard

Kullanıcı görür:
- Mesaj listesi (durum: taslak / zamanlandı / iletildi)
- Abonelik durumu ve kalan limit

Ücretsiz kullanıcıya upgrade yönlendirmesi:
- **Limit göstergesi:** "3 mesajdan 2'sini kullandın"
- **Kilitli özellik önizlemesi:** Ses kaydı butonu görünür, tıklayınca upgrade ekranı açılır
- **Değer hatırlatma:** "Kişisel ile 50 mesaj, 5 alıcı ve ses kaydı"

---

## 7. Kapsam Dışı (Bu Fazda)

- Video mesaj
- Belge/doküman ekleme
- Tekrarlayan tetikleyici
- Zaman kapsülü modu (içerik gizli)
- SMS OTP (alıcı doğrulama) — MVP'de yalnızca e-posta OTP, SMS sonraki fazda
- Sosyal login (Google, Apple)
- Mobil uygulama (React Native)

---

## 8. Teknik Özet

| Bileşen | Teknoloji |
|---------|----------|
| Web | Next.js 15, Cloudflare Pages |
| API | Hono, Cloudflare Workers |
| Veritabanı | Cloudflare D1 |
| Dosya depolama | Cloudflare R2 |
| Zamanlama | Cloudflare Cron + Queues |
| E-posta | Resend |
| SMS | Netgsm |
| Ödeme | İyzico |

---

## 9. Sonraki Adımlar

1. ⬜ DB Schema (migration dosyaları)
2. ⬜ API Spec (OpenAPI)
3. ⬜ Monorepo kurulumu
4. ⬜ Auth (register, login, e-posta doğrulama)
5. ⬜ Mesaj CRUD
6. ⬜ Alıcı yönetimi
7. ⬜ İyzico entegrasyonu
8. ⬜ Zamanlama sistemi
9. ⬜ E-posta iletimi + alıcı erişim sayfası

---

*Vasi MVP Kapsam Özeti v1.0 — Haziran 2026*
