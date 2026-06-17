'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export const runtime = 'edge'

const VasiLogo = () => (
  <svg viewBox="125 315 240 230" xmlns="http://www.w3.org/2000/svg">
    <g transform="scale(0.969727 0.969727)">
      <path fill="#EDE9E0" d="M148.025 356.694C171.46 354.03 200.693 371.203 213.093 390.481C222.161 404.579 226.425 423.51 232.48 439.269C240.789 460.897 247.693 483.53 256.35 504.978C260.537 496.202 265.104 482.799 268.489 473.453C273.923 458.511 279.282 443.542 284.565 428.546C293.476 402.698 296.42 387.244 320.288 370.371C335.657 359.319 354.814 354.884 373.478 358.058L371.12 364.566C359.781 363.707 354.106 364.754 344.095 369.986C330.286 378.52 322.717 387.831 316.24 402.698C312.009 412.41 307.694 422.185 303.444 431.891L275.011 496.93C269.059 510.669 262.836 526.206 256.148 539.46C253.572 532.962 250.25 526.14 247.456 519.631L220.004 456.484L203.829 417.935C196.857 401.399 191.405 386.765 176.785 374.968C165.816 366.118 155.957 363.189 141.999 364.6L139.471 358.061C142.292 357.417 145.158 357.081 148.025 356.694Z" />
      <path fill="#EDE9E0" d="M168.349 386.157C168.665 386.311 169.263 386.767 169.577 386.988C169.581 388.603 167 392.06 165.969 393.875C152.501 417.06 149.046 444.728 156.397 470.514C164.163 498.145 181.392 519.226 206.448 533.082C230.589 546.464 259.09 549.598 285.562 541.782C317.012 532.674 342.243 509.131 353.502 478.385C355.408 473.245 358.874 456.945 359.682 455.476L360.707 455.309L361.389 456.113C359.249 471.901 353.613 487.014 344.894 500.349C329.432 523.898 305.245 540.337 277.657 546.046C249.595 551.874 220.369 546.019 196.718 529.829C173.491 514.304 157.494 490.08 152.337 462.622C147.041 435.167 152.76 409.208 168.349 386.157Z" />
      <path fill="#BF7A57" d="M341.721 382.565C354.324 394.353 366.161 431.729 362.498 448.526C361.27 449.451 360.423 449.059 358.463 449.041C355.722 447.408 356.853 440.33 356.393 436.471C353.84 415.006 348.721 403.87 337.034 386.57L341.721 382.565Z" />
      <path fill="#BF7A57" d="M198.643 355.626C225.621 338.153 266.279 331.383 295.986 345.66C294.015 345.77 293.543 345.614 291.658 344.984C290.251 345.163 288.666 346.757 286.178 347.316C256.253 337.504 226.635 338.598 199.552 356.063L198.643 355.626Z" />
      <path fill="#BF7A57" d="M286.178 347.316C288.666 346.757 290.251 345.163 291.658 344.984C293.543 345.614 294.015 345.77 295.986 345.66C303.761 348.077 315.051 355.441 321.75 360.52L315.318 364.38C306.219 356.544 297.469 351.538 286.178 347.316Z" />
    </g>
  </svg>
)

const RTL_LANGS = new Set(['ar'])
// Landing'de "En Popüler" vurgusu alacak plan slug'ları (admin slug'ı değişse de sağlam)
const FEATURED_SLUGS = new Set(['premium', 'personal'])

type Lang = Record<string, string>

const LANGS: Record<string, Lang> = {
  tr: {
    label: 'TR',
    nav_features: 'Özellikler', nav_how: 'Nasıl Çalışır', nav_pricing: 'Fiyatlandırma', nav_about: 'Hakkında',
    nav_login: 'Giriş Yap', nav_cta: 'Ücretsiz Başla',
    hero_eyebrow: 'Erken Erişim Açıldı',
    hero_title: 'Geleceğe<br /><em>mesajını bırak.</em>',
    hero_sub: 'Vasi ile sevdiklerine zaman aşımına uğramayan mesajlar gönder. Tarihli, tetikleyici tabanlı veya miras mesajları yaz — doğru anda iletilsin.',
    hero_cta1: 'Ücretsiz Hesap Aç', hero_cta2: 'Nasıl Çalışır? →',
    hero_proof: '+2.400 kişi zaten katıldı',
    mock_m1_title: 'Oğluma 18. yaşgünü mesajı', mock_m1_meta: 'Alıcı: Emre K. · 15 Mart 2036',
    mock_m2_title: '10 yıllık zaman kapsülüm', mock_m2_meta: 'Açılış: 7 Haziran 2036',
    mock_m3_title: 'Evlilik yıldönümü sürprizi', mock_m3_meta: 'Alıcı: Selin · Her yıl 12 Haziran',
    mock_m4_title: 'Mezuniyet günü tebriklerim', mock_m4_meta: 'Alıcı: Deniz K. · İletildi 3 gün önce',
    badge_sched: 'Zamanlandı', badge_locked: 'Kilitli', badge_delivered: 'İletildi',
    stat1_val: '2.400+', stat1_lbl: 'Aktif Kullanıcı',
    stat2_val: '18.000+', stat2_lbl: 'Oluşturulan Mesaj',
    stat3_val: '%99,9', stat3_lbl: 'Teslimat Başarısı',
    stat4_val: '256-bit', stat4_lbl: 'AES Şifreleme',
    feat_tag: 'Özellikler',
    feat_title: 'Mesajların, senin istediğin<br />zaman iletilsin',
    feat_sub: 'Güçlü araçlar, sade arayüz. Hayatının en önemli mesajlarını güvenle yaz.',
    feat1_title: 'Tarih Tabanlı Teslimat', feat1_desc: 'Belirli bir tarihe veya tekrarlayan etkinliklere mesaj programla. Doğum günleri, yıldönümleri, mezuniyetler.',
    feat2_title: 'Zaman Kapsülü', feat2_desc: 'Mesajını oluştur, yıllar sonra açılsın. Açılana kadar içerik gizli kalır; alıcı yalnızca ne zaman ulaşacağını görür.',
    feat3_title: 'Uçtan Uca Şifreleme', feat3_desc: '256-bit AES Şifreleme ile mesajların yalnızca alıcıya ulaşır. Biz dahil kimse okuyamaz.',
    feat4_title: 'Çoklu Alıcı', feat4_desc: 'Aynı mesajı birden fazla kişiye gönder. Aile grupları, iş arkadaşları ve sevdiklerin.',
    feat5_title: 'Medya Desteği', feat5_desc: 'Fotoğraf, video, ses kaydı ve doküman ekle. Mesajını zengin içerikle hayata geçir.',
    feat6_title: 'Global Teslimat', feat6_desc: 'E-posta, SMS, WhatsApp veya uygulama bildirimi. Alıcın nerede olursa olsun mesajına ulaşır.',
    how_tag: 'Nasıl Çalışır',
    how_title: 'Dört adımda mesajını<br />geleceğe gönder',
    step1_title: 'Yaz', step1_desc: 'Mesajını yaz. Metin, fotoğraf veya video ekle.',
    step2_title: 'Alıcı Seç', step2_desc: 'Kime gideceğini belirle. Tek kişi veya grup.',
    step3_title: 'Zamanla', step3_desc: 'Tarih, tekrar veya tetikleyici koşul ayarla.',
    step4_title: 'İletildi', step4_desc: 'Mesajın doğru anda güvenle teslim edilir.',
    pricing_tag: 'Fiyatlandırma', pricing_title: 'Sana uygun planı seç',
    pricing_sub: 'Her plan ücretsiz başlar. İstediğin zaman yükselt veya iptal et.',
    plan_popular: 'En Popüler', plan_per: '/ay', plan_msgs: 'mesaj', plan_recips: 'alıcı', plan_cta: 'Başla',
    plan_free_name: 'Ücretsiz', plan_free_desc: 'Başlamak için ideal.',
    plan_free_f1: '3 mesaj', plan_free_f2: '1 alıcı / mesaj', plan_free_f3: 'E-posta teslimat', plan_free_cta: 'Başla',
    plan_personal_name: 'Premium', plan_personal_desc: 'Kişisel kullanım için tam donanımlı.',
    plan_personal_f1: '50 mesaj', plan_personal_f2: '10 alıcı / mesaj', plan_personal_f3: 'Medya ekleri (5 GB)',
    plan_personal_f4: 'SMS + E-posta', plan_personal_f5: 'Şifreli mesajlar', plan_personal_cta: 'Ücretsiz Dene',
    plan_family_name: 'Aile', plan_family_desc: '5 kişiye kadar aile için.',
    plan_family_f1: 'Sınırsız mesaj', plan_family_f2: '5 hesap dahil', plan_family_f3: 'Medya (20 GB)',
    plan_family_f4: 'Miras mesajları', plan_family_cta: 'Başla',
    plan_premium_name: 'Premium', plan_premium_desc: 'Kapsamlı miras planlaması.',
    plan_premium_f1: 'Her şey dahil', plan_premium_f2: 'Öncelikli destek', plan_premium_f3: '100 GB medya',
    plan_premium_f4: '7/24 destek', plan_premium_cta: 'Başla',
    cta_title: 'Bugün bir mesaj bırak.', cta_sub: 'İlk mesajın ücretsiz. Kredi kartı gerekmez.',
    cta_btn1: 'Ücretsiz Başla', cta_btn2: 'Demo İzle →',
    footer_tagline: 'Geleceğe mesaj bırakmak için güvenilir platform. Sevdiklerine önemli anlar için hazırladığın mesajları ilet.',
    col_product: 'Ürün', fp1: 'Özellikler', fp2: 'Fiyatlandırma', fp3: 'Güvenlik', fp4: 'Yol Haritası',
    col_company: 'Şirket', fc1: 'Hakkımızda', fc2: 'Blog', fc3: 'Kariyer', fc4: 'İletişim',
    col_legal: 'Hukuki', fl1: 'Gizlilik Politikası', fl2: 'Kullanım Şartları', fl3: 'KVKK', fl4: 'Çerezler',
    footer_copy: '© 2026 Vasi. Tüm hakları saklıdır.',
  },
  en: {
    label: 'EN',
    nav_features: 'Features', nav_how: 'How It Works', nav_pricing: 'Pricing', nav_about: 'About',
    nav_login: 'Sign In', nav_cta: 'Get Started Free',
    hero_eyebrow: 'Early Access Now Open',
    hero_title: 'Leave your message<br /><em>to the future.</em>',
    hero_sub: 'Send timeless messages to your loved ones with Vasi. Write date-based, trigger-based, or legacy messages — delivered at exactly the right moment.',
    hero_cta1: 'Create Free Account', hero_cta2: 'How It Works →',
    hero_proof: '+2,400 people already joined',
    mock_m1_title: 'Birthday message for my son', mock_m1_meta: 'Recipient: Emre K. · March 15, 2036',
    mock_m2_title: 'My 10-year time capsule', mock_m2_meta: 'Opens: June 7, 2036',
    mock_m3_title: 'Wedding anniversary surprise', mock_m3_meta: 'Recipient: Selin · Every June 12',
    mock_m4_title: 'Graduation day congratulations', mock_m4_meta: 'Recipient: Deniz K. · Delivered 3 days ago',
    badge_sched: 'Scheduled', badge_locked: 'Locked', badge_delivered: 'Delivered',
    stat1_val: '2,400+', stat1_lbl: 'Active Users',
    stat2_val: '18,000+', stat2_lbl: 'Messages Created',
    stat3_val: '99.9%', stat3_lbl: 'Delivery Success',
    stat4_val: '256-bit', stat4_lbl: 'AES Encryption',
    feat_tag: 'Features',
    feat_title: 'Your messages delivered<br />when you want',
    feat_sub: 'Powerful tools, simple interface. Write the most important messages of your life with confidence.',
    feat1_title: 'Date-Based Delivery', feat1_desc: 'Schedule messages for a specific date or recurring events. Birthdays, anniversaries, graduations.',
    feat2_title: 'Time Capsule', feat2_desc: 'Create a message to be opened years later. Content stays hidden until then — the recipient only sees when it will arrive.',
    feat3_title: 'End-to-End Encryption', feat3_desc: '256-bit AES encryption ensures your messages reach only the recipient. No one can read them, not even us.',
    feat4_title: 'Multiple Recipients', feat4_desc: 'Send the same message to multiple people. Family groups, colleagues, and loved ones.',
    feat5_title: 'Media Support', feat5_desc: 'Attach photos, videos, voice recordings, and documents. Bring your message to life with rich content.',
    feat6_title: 'Global Delivery', feat6_desc: 'Email, SMS, WhatsApp, or push notification. Your message reaches the recipient wherever they are.',
    how_tag: 'How It Works',
    how_title: 'Send your message to the future<br />in four steps',
    step1_title: 'Write', step1_desc: 'Write your message. Add text, photos, or video.',
    step2_title: 'Choose Recipient', step2_desc: 'Decide who it goes to. One person or a group.',
    step3_title: 'Schedule', step3_desc: 'Set a date, repeat, or trigger condition.',
    step4_title: 'Delivered', step4_desc: 'Your message is delivered safely at the right moment.',
    pricing_tag: 'Pricing', pricing_title: 'Choose the right plan for you',
    pricing_sub: 'Every plan starts free. Upgrade or cancel anytime.',
    plan_popular: 'Most Popular', plan_per: '/mo', plan_msgs: 'messages', plan_recips: 'recipients', plan_cta: 'Get Started',
    plan_free_name: 'Free', plan_free_desc: 'Ideal to get started.',
    plan_free_f1: '3 messages', plan_free_f2: '1 recipient / message', plan_free_f3: 'Email delivery', plan_free_cta: 'Get Started',
    plan_personal_name: 'Personal', plan_personal_desc: 'Fully equipped for personal use.',
    plan_personal_f1: '50 messages', plan_personal_f2: '10 recipients / message', plan_personal_f3: 'Media attachments (5 GB)',
    plan_personal_f4: 'SMS + Email', plan_personal_f5: 'Encrypted messages', plan_personal_cta: 'Try Free',
    plan_family_name: 'Family', plan_family_desc: 'For families of up to 5.',
    plan_family_f1: 'Unlimited messages', plan_family_f2: '5 accounts included', plan_family_f3: 'Media (20 GB)',
    plan_family_f4: 'Legacy messages', plan_family_cta: 'Get Started',
    plan_premium_name: 'Premium', plan_premium_desc: 'Comprehensive legacy planning.',
    plan_premium_f1: 'Everything included', plan_premium_f2: 'Priority support', plan_premium_f3: '100 GB media',
    plan_premium_f4: '24/7 support', plan_premium_cta: 'Get Started',
    cta_title: 'Leave a message today.', cta_sub: 'First message is free. No credit card required.',
    cta_btn1: 'Start Free', cta_btn2: 'Watch Demo →',
    footer_tagline: 'A trusted platform for leaving messages to the future. Deliver messages you\'ve prepared for your loved ones at important moments.',
    col_product: 'Product', fp1: 'Features', fp2: 'Pricing', fp3: 'Security', fp4: 'Roadmap',
    col_company: 'Company', fc1: 'About Us', fc2: 'Blog', fc3: 'Careers', fc4: 'Contact',
    col_legal: 'Legal', fl1: 'Privacy Policy', fl2: 'Terms of Service', fl3: 'GDPR', fl4: 'Cookies',
    footer_copy: '© 2026 Vasi. All rights reserved.',
  },
  de: {
    label: 'DE',
    nav_features: 'Funktionen', nav_how: 'So funktioniert\'s', nav_pricing: 'Preise', nav_about: 'Über uns',
    nav_login: 'Anmelden', nav_cta: 'Kostenlos starten',
    hero_eyebrow: 'Frühzugang jetzt offen',
    hero_title: 'Hinterlass deine Botschaft<br /><em>für die Zukunft.</em>',
    hero_sub: 'Sende zeitlose Nachrichten an deine Liebsten mit Vasi. Schreibe datum-, trigger- oder vermächtnisbasierte Nachrichten — pünktlich zugestellt.',
    hero_cta1: 'Kostenloses Konto erstellen', hero_cta2: 'So funktioniert\'s →',
    hero_proof: '+2.400 Personen bereits dabei',
    mock_m1_title: 'Geburtstagsnachricht für meinen Sohn', mock_m1_meta: 'Empfänger: Emre K. · 15. März 2036',
    mock_m2_title: 'Meine 10-Jahres-Zeitkapsel', mock_m2_meta: 'Öffnet: 7. Juni 2036',
    mock_m3_title: 'Überraschung zum Hochzeitstag', mock_m3_meta: 'Empfänger: Selin · Jedes Jahr am 12. Juni',
    mock_m4_title: 'Glückwünsche zum Abschluss', mock_m4_meta: 'Empfänger: Deniz K. · Zugestellt vor 3 Tagen',
    badge_sched: 'Geplant', badge_locked: 'Gesperrt', badge_delivered: 'Zugestellt',
    stat1_val: '2.400+', stat1_lbl: 'Aktive Nutzer',
    stat2_val: '18.000+', stat2_lbl: 'Erstellte Nachrichten',
    stat3_val: '99,9%', stat3_lbl: 'Zustellerfolg',
    stat4_val: '256-bit', stat4_lbl: 'AES-Verschlüsselung',
    feat_tag: 'Funktionen',
    feat_title: 'Deine Nachrichten werden<br />genau dann zugestellt',
    feat_sub: 'Leistungsstarke Tools, einfache Oberfläche. Schreibe die wichtigsten Nachrichten deines Lebens mit Vertrauen.',
    feat1_title: 'Datumsbasierte Zustellung', feat1_desc: 'Plane Nachrichten für ein bestimmtes Datum oder wiederkehrende Ereignisse. Geburtstage, Jubiläen, Abschlüsse.',
    feat2_title: 'Zeitkapsel', feat2_desc: 'Erstelle eine Nachricht, die erst Jahre später geöffnet wird. Der Inhalt bleibt verborgen — der Empfänger sieht nur, wann sie ankommt.',
    feat3_title: 'Ende-zu-Ende-Verschlüsselung', feat3_desc: '256-Bit-AES-Verschlüsselung stellt sicher, dass deine Nachrichten nur den Empfänger erreichen.',
    feat4_title: 'Mehrere Empfänger', feat4_desc: 'Sende dieselbe Nachricht an mehrere Personen. Familiengruppen, Kollegen und Geliebte.',
    feat5_title: 'Medienunterstützung', feat5_desc: 'Hänge Fotos, Videos, Sprachaufnahmen und Dokumente an. Bringe deine Nachricht zum Leben.',
    feat6_title: 'Globale Zustellung', feat6_desc: 'E-Mail, SMS, WhatsApp oder Push-Benachrichtigung. Deine Nachricht erreicht den Empfänger, wo auch immer er ist.',
    how_tag: 'So funktioniert\'s',
    how_title: 'Sende deine Nachricht<br />in vier Schritten',
    step1_title: 'Schreiben', step1_desc: 'Schreibe deine Nachricht. Füge Text, Fotos oder Video hinzu.',
    step2_title: 'Empfänger wählen', step2_desc: 'Entscheide, an wen es geht. Eine Person oder eine Gruppe.',
    step3_title: 'Planen', step3_desc: 'Lege Datum, Wiederholung oder Auslösebedingung fest.',
    step4_title: 'Zugestellt', step4_desc: 'Deine Nachricht wird sicher zum richtigen Moment zugestellt.',
    pricing_tag: 'Preise', pricing_title: 'Wähle den richtigen Plan',
    pricing_sub: 'Jeder Plan beginnt kostenlos. Jederzeit upgraden oder kündigen.',
    plan_popular: 'Beliebteste', plan_per: '/Monat', plan_msgs: 'Nachrichten', plan_recips: 'Empfänger', plan_cta: 'Loslegen',
    plan_free_name: 'Kostenlos', plan_free_desc: 'Ideal für den Einstieg.',
    plan_free_f1: '3 Nachrichten', plan_free_f2: '1 Empfänger / Nachricht', plan_free_f3: 'E-Mail-Zustellung', plan_free_cta: 'Loslegen',
    plan_personal_name: 'Persönlich', plan_personal_desc: 'Vollständig ausgestattet für persönlichen Gebrauch.',
    plan_personal_f1: '50 Nachrichten', plan_personal_f2: '10 Empfänger / Nachricht', plan_personal_f3: 'Medienanhänge (5 GB)',
    plan_personal_f4: 'SMS + E-Mail', plan_personal_f5: 'Verschlüsselte Nachrichten', plan_personal_cta: 'Kostenlos testen',
    plan_family_name: 'Familie', plan_family_desc: 'Für Familien bis zu 5 Personen.',
    plan_family_f1: 'Unbegrenzte Nachrichten', plan_family_f2: '5 Konten inklusive', plan_family_f3: 'Medien (20 GB)',
    plan_family_f4: 'Vermächtnisbotschaften', plan_family_cta: 'Loslegen',
    plan_premium_name: 'Premium', plan_premium_desc: 'Umfassende Nachlassplanung.',
    plan_premium_f1: 'Alles inklusive', plan_premium_f2: 'Priorisierter Support', plan_premium_f3: '100 GB Medien',
    plan_premium_f4: '24/7 Support', plan_premium_cta: 'Loslegen',
    cta_title: 'Hinterlass heute eine Nachricht.', cta_sub: 'Erste Nachricht kostenlos. Keine Kreditkarte erforderlich.',
    cta_btn1: 'Kostenlos starten', cta_btn2: 'Demo ansehen →',
    footer_tagline: 'Eine vertrauenswürdige Plattform, um Nachrichten an die Zukunft zu hinterlassen.',
    col_product: 'Produkt', fp1: 'Funktionen', fp2: 'Preise', fp3: 'Sicherheit', fp4: 'Roadmap',
    col_company: 'Unternehmen', fc1: 'Über uns', fc2: 'Blog', fc3: 'Karriere', fc4: 'Kontakt',
    col_legal: 'Rechtliches', fl1: 'Datenschutzerklärung', fl2: 'Nutzungsbedingungen', fl3: 'DSGVO', fl4: 'Cookies',
    footer_copy: '© 2026 Vasi. Alle Rechte vorbehalten.',
  },
  fr: {
    label: 'FR',
    nav_features: 'Fonctionnalités', nav_how: 'Comment ça marche', nav_pricing: 'Tarifs', nav_about: 'À propos',
    nav_login: 'Se connecter', nav_cta: 'Commencer gratuitement',
    hero_eyebrow: 'Accès anticipé ouvert',
    hero_title: 'Laissez votre message<br /><em>pour l\'avenir.</em>',
    hero_sub: 'Envoyez des messages intemporels à vos proches avec Vasi. Rédigez des messages datés, déclenchés ou en héritage — livrés au bon moment.',
    hero_cta1: 'Créer un compte gratuit', hero_cta2: 'Comment ça marche →',
    hero_proof: '+2 400 personnes ont déjà rejoint',
    mock_m1_title: 'Message d\'anniversaire pour mon fils', mock_m1_meta: 'Destinataire : Emre K. · 15 mars 2036',
    mock_m2_title: 'Ma capsule temporelle de 10 ans', mock_m2_meta: 'Ouverture : 7 juin 2036',
    mock_m3_title: 'Surprise anniversaire de mariage', mock_m3_meta: 'Destinataire : Selin · Chaque 12 juin',
    mock_m4_title: 'Félicitations pour la remise des diplômes', mock_m4_meta: 'Destinataire : Deniz K. · Livré il y a 3 jours',
    badge_sched: 'Planifié', badge_locked: 'Verrouillé', badge_delivered: 'Livré',
    stat1_val: '2 400+', stat1_lbl: 'Utilisateurs actifs',
    stat2_val: '18 000+', stat2_lbl: 'Messages créés',
    stat3_val: '99,9%', stat3_lbl: 'Succès de livraison',
    stat4_val: '256-bit', stat4_lbl: 'Chiffrement AES',
    feat_tag: 'Fonctionnalités',
    feat_title: 'Vos messages livrés<br />quand vous le souhaitez',
    feat_sub: 'Outils puissants, interface simple. Rédigez les messages les plus importants de votre vie en toute confiance.',
    feat1_title: 'Livraison basée sur la date', feat1_desc: 'Programmez des messages pour une date précise ou des événements récurrents. Anniversaires, fêtes, diplômes.',
    feat2_title: 'Capsule temporelle', feat2_desc: 'Créez un message qui sera ouvert des années plus tard. Le contenu reste caché jusqu\'alors — le destinataire voit seulement quand il arrivera.',
    feat3_title: 'Chiffrement de bout en bout', feat3_desc: 'Le chiffrement AES 256 bits garantit que vos messages n\'atteignent que le destinataire.',
    feat4_title: 'Destinataires multiples', feat4_desc: 'Envoyez le même message à plusieurs personnes. Groupes familiaux, collègues et proches.',
    feat5_title: 'Support multimédia', feat5_desc: 'Joignez des photos, vidéos, enregistrements vocaux et documents. Donnez vie à votre message.',
    feat6_title: 'Livraison mondiale', feat6_desc: 'E-mail, SMS, WhatsApp ou notification push. Votre message atteint le destinataire où qu\'il soit.',
    how_tag: 'Comment ça marche',
    how_title: 'Envoyez votre message<br />en quatre étapes',
    step1_title: 'Écrire', step1_desc: 'Rédigez votre message. Ajoutez du texte, des photos ou une vidéo.',
    step2_title: 'Choisir le destinataire', step2_desc: 'Décidez à qui il est destiné. Une personne ou un groupe.',
    step3_title: 'Planifier', step3_desc: 'Définissez une date, une répétition ou une condition déclenchante.',
    step4_title: 'Livré', step4_desc: 'Votre message est livré en toute sécurité au bon moment.',
    pricing_tag: 'Tarifs', pricing_title: 'Choisissez le bon plan',
    pricing_sub: 'Chaque plan commence gratuitement. Mettez à niveau ou annulez à tout moment.',
    plan_popular: 'Le plus populaire', plan_per: '/mois', plan_msgs: 'messages', plan_recips: 'destinataires', plan_cta: 'Commencer',
    plan_free_name: 'Gratuit', plan_free_desc: 'Idéal pour commencer.',
    plan_free_f1: '3 messages', plan_free_f2: '1 destinataire / message', plan_free_f3: 'Livraison par e-mail', plan_free_cta: 'Commencer',
    plan_personal_name: 'Personnel', plan_personal_desc: 'Entièrement équipé pour un usage personnel.',
    plan_personal_f1: '50 messages', plan_personal_f2: '10 destinataires / message', plan_personal_f3: 'Pièces jointes (5 Go)',
    plan_personal_f4: 'SMS + E-mail', plan_personal_f5: 'Messages chiffrés', plan_personal_cta: 'Essai gratuit',
    plan_family_name: 'Famille', plan_family_desc: 'Pour les familles jusqu\'à 5 personnes.',
    plan_family_f1: 'Messages illimités', plan_family_f2: '5 comptes inclus', plan_family_f3: 'Médias (20 Go)',
    plan_family_f4: 'Messages d\'héritage', plan_family_cta: 'Commencer',
    plan_premium_name: 'Premium', plan_premium_desc: 'Planification complète de l\'héritage.',
    plan_premium_f1: 'Tout inclus', plan_premium_f2: 'Support prioritaire', plan_premium_f3: '100 Go de médias',
    plan_premium_f4: 'Support 24/7', plan_premium_cta: 'Commencer',
    cta_title: 'Laissez un message aujourd\'hui.', cta_sub: 'Premier message gratuit. Aucune carte de crédit requise.',
    cta_btn1: 'Commencer gratuitement', cta_btn2: 'Voir la démo →',
    footer_tagline: 'Une plateforme de confiance pour laisser des messages à l\'avenir.',
    col_product: 'Produit', fp1: 'Fonctionnalités', fp2: 'Tarifs', fp3: 'Sécurité', fp4: 'Feuille de route',
    col_company: 'Société', fc1: 'À propos', fc2: 'Blog', fc3: 'Carrières', fc4: 'Contact',
    col_legal: 'Légal', fl1: 'Politique de confidentialité', fl2: 'Conditions d\'utilisation', fl3: 'RGPD', fl4: 'Cookies',
    footer_copy: '© 2026 Vasi. Tous droits réservés.',
  },
  es: {
    label: 'ES',
    nav_features: 'Características', nav_how: 'Cómo funciona', nav_pricing: 'Precios', nav_about: 'Acerca de',
    nav_login: 'Iniciar sesión', nav_cta: 'Empezar gratis',
    hero_eyebrow: 'Acceso anticipado abierto',
    hero_title: 'Deja tu mensaje<br /><em>para el futuro.</em>',
    hero_sub: 'Envía mensajes atemporales a tus seres queridos con Vasi. Escribe mensajes con fecha, basados en disparadores o de legado — entregados en el momento exacto.',
    hero_cta1: 'Crear cuenta gratis', hero_cta2: '¿Cómo funciona? →',
    hero_proof: '+2.400 personas ya se unieron',
    mock_m1_title: 'Mensaje de cumpleaños para mi hijo', mock_m1_meta: 'Destinatario: Emre K. · 15 marzo 2036',
    mock_m2_title: 'Mi cápsula del tiempo de 10 años', mock_m2_meta: 'Se abre: 7 de junio de 2036',
    mock_m3_title: 'Sorpresa de aniversario de boda', mock_m3_meta: 'Destinataria: Selin · Cada 12 de junio',
    mock_m4_title: 'Felicitaciones por la graduación', mock_m4_meta: 'Destinatario: Deniz K. · Entregado hace 3 días',
    badge_sched: 'Programado', badge_locked: 'Bloqueado', badge_delivered: 'Entregado',
    stat1_val: '2.400+', stat1_lbl: 'Usuarios activos',
    stat2_val: '18.000+', stat2_lbl: 'Mensajes creados',
    stat3_val: '99,9%', stat3_lbl: 'Éxito de entrega',
    stat4_val: '256-bit', stat4_lbl: 'Cifrado AES',
    feat_tag: 'Características',
    feat_title: 'Tus mensajes entregados<br />cuando quieras',
    feat_sub: 'Herramientas potentes, interfaz sencilla. Escribe los mensajes más importantes de tu vida con confianza.',
    feat1_title: 'Entrega basada en fecha', feat1_desc: 'Programa mensajes para una fecha específica o eventos recurrentes. Cumpleaños, aniversarios, graduaciones.',
    feat2_title: 'Cápsula del tiempo', feat2_desc: 'Crea un mensaje que se abrirá años después. El contenido permanece oculto hasta entonces — el destinatario solo ve cuándo llegará.',
    feat3_title: 'Cifrado de extremo a extremo', feat3_desc: 'El cifrado AES de 256 bits garantiza que tus mensajes lleguen solo al destinatario.',
    feat4_title: 'Múltiples destinatarios', feat4_desc: 'Envía el mismo mensaje a varias personas. Grupos familiares, colegas y seres queridos.',
    feat5_title: 'Soporte multimedia', feat5_desc: 'Adjunta fotos, vídeos, grabaciones de voz y documentos. Da vida a tu mensaje.',
    feat6_title: 'Entrega global', feat6_desc: 'Correo electrónico, SMS, WhatsApp o notificación push. Tu mensaje llega al destinatario donde quiera que esté.',
    how_tag: 'Cómo funciona',
    how_title: 'Envía tu mensaje al futuro<br />en cuatro pasos',
    step1_title: 'Escribe', step1_desc: 'Escribe tu mensaje. Añade texto, fotos o vídeo.',
    step2_title: 'Elige destinatario', step2_desc: 'Decide a quién va. Una persona o un grupo.',
    step3_title: 'Programa', step3_desc: 'Establece una fecha, repetición o condición de activación.',
    step4_title: 'Entregado', step4_desc: 'Tu mensaje se entrega de forma segura en el momento adecuado.',
    pricing_tag: 'Precios', pricing_title: 'Elige el plan adecuado',
    pricing_sub: 'Cada plan comienza gratis. Mejora o cancela en cualquier momento.',
    plan_popular: 'Más popular', plan_per: '/mes', plan_msgs: 'mensajes', plan_recips: 'destinatarios', plan_cta: 'Comenzar',
    plan_free_name: 'Gratis', plan_free_desc: 'Ideal para empezar.',
    plan_free_f1: '3 mensajes', plan_free_f2: '1 destinatario / mensaje', plan_free_f3: 'Entrega por email', plan_free_cta: 'Comenzar',
    plan_personal_name: 'Personal', plan_personal_desc: 'Completamente equipado para uso personal.',
    plan_personal_f1: '50 mensajes', plan_personal_f2: '10 destinatarios / mensaje', plan_personal_f3: 'Archivos adjuntos (5 GB)',
    plan_personal_f4: 'SMS + Email', plan_personal_f5: 'Mensajes cifrados', plan_personal_cta: 'Probar gratis',
    plan_family_name: 'Familia', plan_family_desc: 'Para familias de hasta 5 personas.',
    plan_family_f1: 'Mensajes ilimitados', plan_family_f2: '5 cuentas incluidas', plan_family_f3: 'Medios (20 GB)',
    plan_family_f4: 'Mensajes de legado', plan_family_cta: 'Comenzar',
    plan_premium_name: 'Premium', plan_premium_desc: 'Planificación completa del legado.',
    plan_premium_f1: 'Todo incluido', plan_premium_f2: 'Soporte prioritario', plan_premium_f3: '100 GB de medios',
    plan_premium_f4: 'Soporte 24/7', plan_premium_cta: 'Comenzar',
    cta_title: 'Deja un mensaje hoy.', cta_sub: 'Primer mensaje gratis. No se requiere tarjeta de crédito.',
    cta_btn1: 'Empezar gratis', cta_btn2: 'Ver demo →',
    footer_tagline: 'Una plataforma de confianza para dejar mensajes al futuro.',
    col_product: 'Producto', fp1: 'Características', fp2: 'Precios', fp3: 'Seguridad', fp4: 'Hoja de ruta',
    col_company: 'Empresa', fc1: 'Acerca de', fc2: 'Blog', fc3: 'Empleo', fc4: 'Contacto',
    col_legal: 'Legal', fl1: 'Política de privacidad', fl2: 'Términos de servicio', fl3: 'RGPD', fl4: 'Cookies',
    footer_copy: '© 2026 Vasi. Todos los derechos reservados.',
  },
  ar: {
    label: 'AR',
    nav_features: 'الميزات', nav_how: 'كيف يعمل', nav_pricing: 'الأسعار', nav_about: 'حول',
    nav_login: 'تسجيل الدخول', nav_cta: 'ابدأ مجانًا',
    hero_eyebrow: 'الوصول المبكر متاح الآن',
    hero_title: 'اترك رسالتك<br /><em>للمستقبل.</em>',
    hero_sub: 'أرسل رسائل خالدة إلى أحبائك مع Vasi. اكتب رسائل مؤرخة أو قائمة على مشغل أو إرثية — تسليمها في اللحظة المناسبة.',
    hero_cta1: 'إنشاء حساب مجاني', hero_cta2: 'كيف يعمل →',
    hero_proof: '+٢٤٠٠ شخص انضموا بالفعل',
    mock_m1_title: 'رسالة عيد ميلاد لابني', mock_m1_meta: 'المستلم: Emre K. · ١٥ مارس ٢٠٣٦',
    mock_m2_title: 'كبسولة زمنية لعشر سنوات', mock_m2_meta: 'تُفتح: ٧ يونيو ٢٠٣٦',
    mock_m3_title: 'مفاجأة ذكرى الزواج', mock_m3_meta: 'المستلمة: Selin · كل ١٢ يونيو',
    mock_m4_title: 'تهاني بمناسبة التخرج', mock_m4_meta: 'المستلم: Deniz K. · سُلِّم منذ ٣ أيام',
    badge_sched: 'مجدول', badge_locked: 'مقفل', badge_delivered: 'تم التسليم',
    stat1_val: '+٢٤٠٠', stat1_lbl: 'مستخدمون نشطون',
    stat2_val: '+١٨٠٠٠', stat2_lbl: 'رسائل تم إنشاؤها',
    stat3_val: '٩٩٫٩٪', stat3_lbl: 'نجاح التسليم',
    stat4_val: '٢٥٦-bit', stat4_lbl: 'تشفير AES',
    feat_tag: 'الميزات',
    feat_title: 'رسائلك تُسلَّم<br />متى تريد',
    feat_sub: 'أدوات قوية، واجهة بسيطة. اكتب أهم رسائل حياتك بثقة.',
    feat1_title: 'التسليم المستند إلى التاريخ', feat1_desc: 'جدول رسائل لتاريخ محدد أو أحداث متكررة. أعياد الميلاد والذكريات السنوية والتخرج.',
    feat2_title: 'كبسولة زمنية', feat2_desc: 'أنشئ رسالة تُفتح بعد سنوات. يظل المحتوى مخفيًا حتى ذلك الحين — لا يرى المستلم إلا موعد وصولها.',
    feat3_title: 'التشفير من طرف إلى طرف', feat3_desc: 'يضمن تشفير AES 256 بت وصول رسائلك إلى المستلم فقط. لا أحد يستطيع قراءتها.',
    feat4_title: 'مستلمون متعددون', feat4_desc: 'أرسل نفس الرسالة إلى أشخاص متعددين. مجموعات العائلة والزملاء والأحباء.',
    feat5_title: 'دعم الوسائط', feat5_desc: 'أرفق الصور ومقاطع الفيديو والتسجيلات الصوتية والمستندات. أحيِ رسالتك بمحتوى غني.',
    feat6_title: 'التسليم العالمي', feat6_desc: 'بريد إلكتروني أو رسالة نصية أو WhatsApp أو إشعار فوري. تصل رسالتك إلى المستلم أينما كان.',
    how_tag: 'كيف يعمل',
    how_title: 'أرسل رسالتك إلى المستقبل<br />في أربع خطوات',
    step1_title: 'اكتب', step1_desc: 'اكتب رسالتك. أضف نصًا أو صورًا أو فيديو.',
    step2_title: 'اختر المستلم', step2_desc: 'قرر من ستذهب إليه. شخص واحد أو مجموعة.',
    step3_title: 'جدول', step3_desc: 'حدد تاريخًا أو تكرارًا أو شرط تشغيل.',
    step4_title: 'تم التسليم', step4_desc: 'تُسلَّم رسالتك بأمان في اللحظة المناسبة.',
    pricing_tag: 'الأسعار', pricing_title: 'اختر الخطة المناسبة لك',
    pricing_sub: 'كل خطة تبدأ مجانًا. يمكنك الترقية أو الإلغاء في أي وقت.',
    plan_popular: 'الأكثر شعبية', plan_per: '/شهر', plan_msgs: 'رسائل', plan_recips: 'مستلمون', plan_cta: 'ابدأ',
    plan_free_name: 'مجاني', plan_free_desc: 'مثالي للبدء.',
    plan_free_f1: '٣ رسائل', plan_free_f2: 'مستلم واحد / رسالة', plan_free_f3: 'تسليم بالبريد الإلكتروني', plan_free_cta: 'ابدأ',
    plan_personal_name: 'شخصي', plan_personal_desc: 'مجهز بالكامل للاستخدام الشخصي.',
    plan_personal_f1: '٥٠ رسالة', plan_personal_f2: '١٠ مستلمين / رسالة', plan_personal_f3: 'مرفقات وسائط (5 جيجا)',
    plan_personal_f4: 'SMS + بريد إلكتروني', plan_personal_f5: 'رسائل مشفرة', plan_personal_cta: 'جرب مجانًا',
    plan_family_name: 'عائلي', plan_family_desc: 'للعائلات حتى ٥ أشخاص.',
    plan_family_f1: 'رسائل غير محدودة', plan_family_f2: '٥ حسابات مضمنة', plan_family_f3: 'وسائط (20 جيجا)',
    plan_family_f4: 'رسائل الإرث', plan_family_cta: 'ابدأ',
    plan_premium_name: 'Premium', plan_premium_desc: 'تخطيط شامل للإرث.',
    plan_premium_f1: 'كل شيء مضمن', plan_premium_f2: 'دعم ذو أولوية', plan_premium_f3: '100 جيجا وسائط',
    plan_premium_f4: 'دعم ٢٤/٧', plan_premium_cta: 'ابدأ',
    cta_title: 'اترك رسالة اليوم.', cta_sub: 'الرسالة الأولى مجانية. لا حاجة لبطاقة ائتمان.',
    cta_btn1: 'ابدأ مجانًا', cta_btn2: 'شاهد العرض →',
    footer_tagline: 'منصة موثوقة لترك الرسائل للمستقبل. سلِّم الرسائل التي أعددتها لأحبائك في اللحظات المهمة.',
    col_product: 'المنتج', fp1: 'الميزات', fp2: 'الأسعار', fp3: 'الأمان', fp4: 'خارطة الطريق',
    col_company: 'الشركة', fc1: 'من نحن', fc2: 'المدونة', fc3: 'الوظائف', fc4: 'اتصل بنا',
    col_legal: 'قانوني', fl1: 'سياسة الخصوصية', fl2: 'شروط الخدمة', fl3: 'GDPR', fl4: 'الكوكيز',
    footer_copy: '© 2026 Vasi. جميع الحقوق محفوظة.',
  },
}

function parseRichText(html: string): React.ReactNode[] {
  return html.split(/(<br\s*\/?>|<em>.*?<\/em>)/g).map((part, i) => {
    if (/^<br\s*\/?>$/.test(part)) return <br key={i} />
    const em = part.match(/^<em>(.*?)<\/em>$/)
    if (em) return <em key={i}>{em[1]}</em>
    return part
  })
}

const LANG_OPTIONS = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
]

export default function LandingPage() {
  // SSR her zaman 'tr' üretir; tarayıcı dili mount SONRASI uygulanır.
  // useState initializer'da navigator okumak hydration mismatch yaratıyordu (TestBulgulari_1 #1).
  const [lang, setLang] = useState('tr')
  useEffect(() => {
    const saved = localStorage.getItem('vasi_lang')
    const browser = (navigator.language || 'tr').split('-')[0]
    const detected = saved || (LANGS[browser] ? browser : 'tr')
    if (detected !== 'tr') queueMicrotask(() => setLang(detected))
  }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  // Admin panelindeki planlarla senkron — DB'den dinamik (/public/pricing => {plans:[...]})
  const [plans, setPlans] = useState<{ slug: string; name: string; price_monthly: number; message_limit: number; recipient_limit: number }[]>([])
  useEffect(() => {
    fetch('/api/v1/public/pricing')
      .then(r => r.json())
      .then(d => setPlans(d.plans ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('vasi_lang', lang)
  }, [lang])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const t = LANGS[lang] || LANGS.tr

  const handleLang = (code: string) => {
    setLang(code)
    setMenuOpen(false)
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container">
          <a href="#" className="navbar-logo">
            <VasiLogo />
            <span className="navbar-wordmark">Vasi</span>
          </a>

          <ul className="navbar-links">
            <li><a href="#features">{t.nav_features}</a></li>
            <li><a href="#how">{t.nav_how}</a></li>
            <li><a href="#pricing">{t.nav_pricing}</a></li>
            <li><a href="#about">{t.nav_about}</a></li>
          </ul>

          <div className="navbar-actions">
            <div className="lang-switcher" ref={langRef}>
              <button className="lang-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}>
                <span>🌐</span>
                <span>{t.label}</span>
              </button>
              {menuOpen && (
                <div className="lang-menu">
                  {LANG_OPTIONS.map(opt => (
                    <div
                      key={opt.code}
                      className={`lang-opt${lang === opt.code ? ' lang-active' : ''}`}
                      onClick={() => handleLang(opt.code)}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/login" className="btn btn-ghost btn-md">{t.nav_login}</Link>
            <Link href="/register" className="btn btn-primary btn-md">{t.nav_cta}</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            <span>{t.hero_eyebrow}</span>
          </div>

          <div className="hero-logo-wrap">
            <VasiLogo />
          </div>

          <h1 className="hero-title">{parseRichText(t.hero_title)}</h1>
          <p className="hero-sub">{t.hero_sub}</p>

          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">{t.hero_cta1}</Link>
            <a href="#how" className="btn btn-secondary btn-lg">{t.hero_cta2}</a>
          </div>

          <div className="hero-proof">
            <div className="proof-avatars">
              {['AK', 'ME', 'SY', 'BT'].map(initials => (
                <div key={initials} className="proof-avatar">{initials}</div>
              ))}
            </div>
            <span>{t.hero_proof}</span>
          </div>

          {/* App Preview Mockup */}
          <div className="hero-mockup">
            <div className="mockup-glow" />
            <div className="mockup-card">
              <div className="mockup-bar">
                <span className="m-dot m-dot-r" />
                <span className="m-dot m-dot-y" />
                <span className="m-dot m-dot-g" />
                <div className="m-url">🔒 app.vasi.co/messages</div>
              </div>
              <div className="msg-list">
                <div className="msg-row">
                  <div className="msg-icon">📝</div>
                  <div className="msg-body">
                    <div className="msg-title">{t.mock_m1_title}</div>
                    <div className="msg-meta">{t.mock_m1_meta}</div>
                  </div>
                  <span className="badge b-sched">{t.badge_sched}</span>
                </div>
                <div className="msg-row">
                  <div className="msg-icon">🕰️</div>
                  <div className="msg-body">
                    <div className="msg-title">{t.mock_m2_title}</div>
                    <div className="msg-meta">{t.mock_m2_meta}</div>
                  </div>
                  <span className="badge b-locked">{t.badge_locked}</span>
                </div>
                <div className="msg-row">
                  <div className="msg-icon">💌</div>
                  <div className="msg-body">
                    <div className="msg-title">{t.mock_m3_title}</div>
                    <div className="msg-meta">{t.mock_m3_meta}</div>
                  </div>
                  <span className="badge b-sched">{t.badge_sched}</span>
                </div>
                <div className="msg-row">
                  <div className="msg-icon">🎓</div>
                  <div className="msg-body">
                    <div className="msg-title">{t.mock_m4_title}</div>
                    <div className="msg-meta">{t.mock_m4_meta}</div>
                  </div>
                  <span className="badge b-delivered">{t.badge_delivered}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="rule" />
      <div className="stats-row">
        {[
          { val: t.stat1_val, lbl: t.stat1_lbl },
          { val: t.stat2_val, lbl: t.stat2_lbl },
          { val: t.stat3_val, lbl: t.stat3_lbl },
          { val: t.stat4_val, lbl: t.stat4_lbl },
        ].map(s => (
          <div key={s.lbl} className="stat">
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="rule" />

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="sec-hdr center">
            <div className="sec-tag">{t.feat_tag}</div>
            <h2 className="sec-title">{parseRichText(t.feat_title)}</h2>
            <p className="sec-sub">{t.feat_sub}</p>
          </div>
          <div className="feat-grid">
            {[
              { icon: '⏰', title: t.feat1_title, desc: t.feat1_desc },
              { icon: '🕰️', title: t.feat2_title, desc: t.feat2_desc },
              { icon: '🛡️', title: t.feat3_title, desc: t.feat3_desc },
              { icon: '👥', title: t.feat4_title, desc: t.feat4_desc },
              { icon: '📎', title: t.feat5_title, desc: t.feat5_desc },
              { icon: '🌍', title: t.feat6_title, desc: t.feat6_desc },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section" id="how">
        <div className="container">
          <div className="sec-hdr center">
            <div className="sec-tag">{t.how_tag}</div>
            <h2 className="sec-title">{parseRichText(t.how_title)}</h2>
          </div>
          <div className="how-grid">
            {[
              { icon: '✏️', title: t.step1_title, desc: t.step1_desc, active: true },
              { icon: '👤', title: t.step2_title, desc: t.step2_desc, active: false },
              { icon: '📅', title: t.step3_title, desc: t.step3_desc, active: false },
              { icon: '✅', title: t.step4_title, desc: t.step4_desc, active: false },
            ].map(s => (
              <div key={s.title} className="how-step">
                <div className={`how-num${s.active ? ' active' : ''}`}>{s.icon}</div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="sec-hdr center">
            <div className="sec-tag">{t.pricing_tag}</div>
            <h2 className="sec-title">{t.pricing_title}</h2>
            <p className="sec-sub">{t.pricing_sub}</p>
          </div>
          <div className="pricing-grid pricing-grid--dynamic">
            {plans.map((p) => {
              const featured = FEATURED_SLUGS.has(p.slug)
              return (
                <div key={p.slug} className={`plan-card${featured ? ' featured' : ''}`}>
                  {featured && <div className="plan-popular">{t.plan_popular}</div>}
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-price">
                    <span className="plan-amount">₺{p.price_monthly}</span>
                    <span className="plan-per">{t.plan_per}</span>
                  </div>
                  <div className="plan-line" />
                  <div className="plan-feats">
                    <div className="plan-feat"><span className="plan-check">✓</span><span>{p.message_limit} {t.plan_msgs}</span></div>
                    <div className="plan-feat"><span className="plan-check">✓</span><span>{p.recipient_limit} {t.plan_recips}</span></div>
                  </div>
                  <Link href="/register" className={`btn btn-md plan-btn ${featured ? 'btn-primary' : 'btn-secondary'}`}>{t.plan_cta}</Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-wrap">
            <h2 className="cta-title">{t.cta_title}</h2>
            <p className="cta-sub">{t.cta_sub}</p>
            <div className="cta-actions">
              <Link href="/register" className="btn btn-primary btn-lg">{t.cta_btn1}</Link>
              <a href="#how" className="btn btn-ghost btn-lg">{t.cta_btn2}</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="about">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <VasiLogo />
                <span className="footer-logo-txt">Vasi</span>
              </div>
              <p className="footer-tagline">{t.footer_tagline}</p>
            </div>
            <div>
              <div className="col-title">{t.col_product}</div>
              <div className="col-links">
                <a href="#">{t.fp1}</a>
                <a href="#">{t.fp2}</a>
                <a href="#">{t.fp3}</a>
                <a href="#">{t.fp4}</a>
              </div>
            </div>
            <div>
              <div className="col-title">{t.col_company}</div>
              <div className="col-links">
                <a href="#">{t.fc1}</a>
                <a href="#">{t.fc2}</a>
                <a href="#">{t.fc3}</a>
                <a href="#">{t.fc4}</a>
              </div>
            </div>
            <div>
              <div className="col-title">{t.col_legal}</div>
              <div className="col-links">
                <a href="#">{t.fl1}</a>
                <a href="#">{t.fl2}</a>
                <a href="#">{t.fl3}</a>
                <Link href="/cerez-politikasi">{t.fl4}</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">{t.footer_copy}</div>
            <div className="footer-links">
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
              <a href="#">Twitter / X</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
