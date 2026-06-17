# Sprint 29 — Çerez onayı (bilgilendirme banner'ı) + Çerez Politikası sayfası

> Kaynak: ROADMAP S28-cookie dilimi (KVKK/GDPR). Karar (2026-06-17, iko): **bilgilendirme tarzı** banner (tam onay yöneticisi DEĞİL) + gerçek **/cerez-politikasi** sayfası. İlke: stabil + sıfır maliyet (saf frontend, dış hesap yok).
> Uygulayıcı: **yerel Qwen** (OpenHands, klonda). İçerik metni (6 dil) iko+Claude tarafından bu dokümanda hazır verildi → model birebir kopyalar.
> Git/doğrulama: Claude. Banner/sayfa saf frontend → smoke 58/58 etkilenmez.

## Tespit (neden bilgilendirme yeterli)
Tarama (2026-06-17): uygulamada **izleme/analitik/pazarlama çerezi YOK** (GA, gtag, pixel, hotjar vb. yok). Tüm kalıcı veri `localStorage` ve **zorunlu/işlevsel**:
- `authToken` / `adminToken` — oturum JWT (çıkışta silinir)
- `verifyEmail` — kayıt→doğrulama akışı sırasında geçici (doğrulamadan sonra silinir)
- `vasi_lang` — dil tercihi (kalıcı)

KVKK ve GDPR: **zorunlu çerezler ön onay gerektirmez**; yalnız izleme/pazarlama gerektirir → Vasi'de o yok. Bu yüzden "kabul/ret/kategori" yöneticisi değil, **bilgilendirme bildirimi** doğru ve dürüst tasarım.

## i18n notu (önemli)
`lib/i18n.ts` **yalnız TR+EN** (`type Lang = 'tr' | 'en'`). Landing (`page.tsx`) ise **kendi 6 dilli `LANGS`** sözlüğüne sahip. → Banner ve politika sayfası **kendi 6 dilli sözlüğünü** taşır (lib/i18n'e BAĞLANMAZ), `localStorage 'vasi_lang'`'i okur. RTL: `ar`.

## Kapsam ve dosyalar
| # | İş | Dosya | Tür |
|---|----|-------|-----|
| 1 | Çerez bilgilendirme banner'ı (6 dil + RTL, dismiss kalıcı) | **yeni** `vasi-web/src/components/CookieConsent.tsx` | frontend |
| 2 | Banner'ı app geneline bağla | `vasi-web/src/app/layout.tsx` (root) | frontend |
| 3 | Çerez Politikası sayfası (6 dil + RTL) | **yeni** `vasi-web/src/app/cerez-politikasi/page.tsx` | frontend |
| 4 | Footer "Çerezler" linkini sayfaya bağla | `vasi-web/src/app/page.tsx` (satır ~693, `fl4`) | frontend |

## Davranış
- Banner ilk ziyarette (consent yoksa) tüm sayfalarda görünür; **Anladım** → `localStorage['vasi_cookie_notice']='v1'` → bir daha çıkmaz.
- Dil: `localStorage['vasi_lang']` (yoksa `tr`); sözlükte yoksa `tr` fallback. RTL `ar`'da `dir="rtl"`.
- **Hydration güvenli:** localStorage'a bağlı → `mounted` olana dek render etme (SSR'de görünmez), sonra `useEffect` ile karar ver. Aksi halde Next 15 hydration uyarısı.
- Konum: ekran altı, sabit (fixed), non-modal (içerikle etkileşimi engellemez). Vasi tasarım token'ları (`--midnight`/`--copper`/`--cream`/`btn` sınıfları).
- Footer `fl4` linki `<a href="#">` → `<Link href="/cerez-politikasi">` (B3 lint korunur; iç sayfa = `<Link>`).

## Kabul kriterleri
- İlk ziyaret → banner görünür; **Anladım** → kapanır; sayfa yenile → **bir daha çıkmaz**.
- 6 dilde (TR/EN/DE/FR/ES/AR) banner + politika sayfası kırılmadan render; `ar`'da `dir=rtl`.
- Footer "Çerezler"/"Cookies" → `/cerez-politikasi` açar; sayfa içeriği seçili dilde gelir; "Ana sayfaya dön" çalışır.
- `pnpm exec tsc --noEmit` 0 hata; `next lint` **0 error** (yeni `any` yok, iç sayfa linkleri `<Link>`); **smoke 58/58** (frontend → etkilenmez).
- Banner/sayfa yalnız hedef dosyalara dokunur; başka section/sayfa davranışı değişmez.

## ⚠️ iko'nun doldurması gereken TEK alan
Politika metnindeki **iletişim e-postası** placeholder: `{{CONTACT_EPOSTA}}`. Canlıya çıkmadan iko gerçek adresi (ör. `destek@vasi.app` veya `ilkeronurkaya@gmail.com`) koyar. Model placeholder'ı aynen bırakır.

---

## İÇERİK — Banner kopyası (6 dil)
Her dil: `text` (gövde) · `link` (politika link metni) · `btn` (kabul).

- **tr:** text=`🍪 Vasi yalnızca zorunlu çerezleri kullanır (oturum ve dil tercihi). İzleme veya analitik çerez yok.` · link=`Çerez Politikası` · btn=`Anladım`
- **en:** text=`🍪 Vasi uses only essential cookies (session and language preference). No tracking or analytics.` · link=`Cookie Policy` · btn=`Got it`
- **de:** text=`🍪 Vasi verwendet nur notwendige Cookies (Sitzung und Sprachauswahl). Kein Tracking, keine Analyse.` · link=`Cookie-Richtlinie` · btn=`Verstanden`
- **fr:** text=`🍪 Vasi n'utilise que des cookies essentiels (session et préférence de langue). Aucun suivi ni analyse.` · link=`Politique relative aux cookies` · btn=`J'ai compris`
- **es:** text=`🍪 Vasi solo usa cookies esenciales (sesión y preferencia de idioma). Sin seguimiento ni analíticas.` · link=`Política de cookies` · btn=`Entendido`
- **ar:** text=`🍪 يستخدم Vasi ملفات تعريف الارتباط الضرورية فقط (الجلسة وتفضيل اللغة). لا تتبع ولا تحليلات.` · link=`سياسة ملفات تعريف الارتباط` · btn=`حسناً`

## İÇERİK — Çerez Politikası sayfası (6 dil)
Sayfa anahtarları: `title` · `updated` · `intro` · `s1_title` · `s1_session` · `s1_verify` · `s1_lang` · `s2_title` · `s2_body` · `s3_title` · `s3_body` · `s4_title` · `s4_body` · `back`. Model bunları 6 dilli bir sözlükte tutup render eder (landing `LANGS` deseni gibi).

### tr
- title: `Çerez Politikası`
- updated: `Son güncelleme: 17 Haziran 2026`
- intro: `Vasi, hizmetin çalışması için yalnızca zorunlu çerez ve benzeri yerel depolama teknolojilerini kullanır. İzleme, analitik veya pazarlama amaçlı çerez kullanmayız ve üçüncü taraflarla veri paylaşmayız.`
- s1_title: `Kullandığımız çerezler / yerel depolama`
- s1_session: `Oturum (authToken / adminToken): Giriş yaptığında oturumunu sürdürür. Tarayıcının yerel depolamasında tutulur ve çıkış yaptığında silinir. Zorunlu.`
- s1_verify: `Kayıt doğrulama (verifyEmail): Kayıt sırasında e-posta doğrulama adımına taşımak için geçici olarak saklanır; doğrulama tamamlanınca silinir. Zorunlu.`
- s1_lang: `Dil tercihi (vasi_lang): Seçtiğin arayüz dilini hatırlar. İşlevsel.`
- s2_title: `Üçüncü taraf ve izleme çerezleri`
- s2_body: `Yok. Vasi analitik, reklam veya izleme çerezi kullanmaz; sayfalarımıza üçüncü taraf izleyici yerleştirmeyiz.`
- s3_title: `Onay ve kontrol`
- s3_body: `Yukarıdaki kalemler hizmetin çalışması için zorunlu olduğundan, mevzuat gereği ön onay gerektirmez. Dilersen tarayıcı ayarlarından yerel depolamayı temizleyebilirsin; bu durumda oturumun kapanır ve dil tercihin sıfırlanır.`
- s4_title: `Haklarınız (KVKK / GDPR)`
- s4_body: `KVKK m.11 ve GDPR kapsamında; kişisel verilerine erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsin. Talepler için: {{CONTACT_EPOSTA}}`
- back: `← Ana sayfaya dön`

### en
- title: `Cookie Policy`
- updated: `Last updated: 17 June 2026`
- intro: `Vasi uses only essential cookies and similar local-storage technologies required for the service to work. We do not use any tracking, analytics, or marketing cookies, and we do not share data with third parties.`
- s1_title: `Cookies / local storage we use`
- s1_session: `Session (authToken / adminToken): Keeps you signed in. Stored in your browser's local storage and removed when you log out. Essential.`
- s1_verify: `Sign-up verification (verifyEmail): Temporarily stored to carry your email into the verification step during sign-up; removed once verification completes. Essential.`
- s1_lang: `Language preference (vasi_lang): Remembers your chosen interface language. Functional.`
- s2_title: `Third-party and tracking cookies`
- s2_body: `None. Vasi uses no analytics, advertising, or tracking cookies, and we embed no third-party trackers on our pages.`
- s3_title: `Consent and control`
- s3_body: `Because the items above are strictly necessary for the service, they do not require prior consent under applicable law. You may clear local storage in your browser settings at any time; this will log you out and reset your language preference.`
- s4_title: `Your rights (KVKK / GDPR)`
- s4_body: `Under KVKK Art. 11 and the GDPR, you have the right to access, correct, delete, and object to the processing of your personal data. For requests: {{CONTACT_EPOSTA}}`
- back: `← Back to home`

### de
- title: `Cookie-Richtlinie`
- updated: `Zuletzt aktualisiert: 17. Juni 2026`
- intro: `Vasi verwendet nur notwendige Cookies und ähnliche lokale Speichertechnologien, die für den Betrieb des Dienstes erforderlich sind. Wir verwenden keine Tracking-, Analyse- oder Marketing-Cookies und geben keine Daten an Dritte weiter.`
- s1_title: `Verwendete Cookies / lokaler Speicher`
- s1_session: `Sitzung (authToken / adminToken): Hält dich angemeldet. Wird im lokalen Speicher des Browsers abgelegt und beim Abmelden entfernt. Notwendig.`
- s1_verify: `Registrierungsbestätigung (verifyEmail): Wird vorübergehend gespeichert, um deine E-Mail während der Registrierung in den Bestätigungsschritt zu übernehmen; nach Abschluss entfernt. Notwendig.`
- s1_lang: `Sprachauswahl (vasi_lang): Merkt sich deine gewählte Oberflächensprache. Funktional.`
- s2_title: `Cookies von Drittanbietern und Tracking`
- s2_body: `Keine. Vasi verwendet keine Analyse-, Werbe- oder Tracking-Cookies und bindet keine Tracker von Drittanbietern ein.`
- s3_title: `Einwilligung und Kontrolle`
- s3_body: `Da die oben genannten Elemente für den Dienst unbedingt erforderlich sind, ist nach geltendem Recht keine vorherige Einwilligung erforderlich. Du kannst den lokalen Speicher jederzeit in deinen Browsereinstellungen löschen; dadurch wirst du abgemeldet und deine Sprachauswahl zurückgesetzt.`
- s4_title: `Deine Rechte (KVKK / DSGVO)`
- s4_body: `Gemäß KVKK Art. 11 und der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch gegen die Verarbeitung deiner personenbezogenen Daten. Für Anfragen: {{CONTACT_EPOSTA}}`
- back: `← Zurück zur Startseite`

### fr
- title: `Politique relative aux cookies`
- updated: `Dernière mise à jour : 17 juin 2026`
- intro: `Vasi n'utilise que les cookies essentiels et technologies de stockage local similaires nécessaires au fonctionnement du service. Nous n'utilisons aucun cookie de suivi, d'analyse ou de marketing, et ne partageons aucune donnée avec des tiers.`
- s1_title: `Cookies / stockage local utilisés`
- s1_session: `Session (authToken / adminToken) : vous maintient connecté. Stocké dans le stockage local du navigateur et supprimé à la déconnexion. Essentiel.`
- s1_verify: `Vérification d'inscription (verifyEmail) : stocké temporairement pour transmettre votre e-mail à l'étape de vérification lors de l'inscription ; supprimé une fois la vérification terminée. Essentiel.`
- s1_lang: `Préférence de langue (vasi_lang) : mémorise la langue d'interface choisie. Fonctionnel.`
- s2_title: `Cookies tiers et de suivi`
- s2_body: `Aucun. Vasi n'utilise aucun cookie d'analyse, de publicité ou de suivi, et n'intègre aucun traceur tiers sur ses pages.`
- s3_title: `Consentement et contrôle`
- s3_body: `Comme les éléments ci-dessus sont strictement nécessaires au service, ils ne requièrent pas de consentement préalable selon la loi applicable. Vous pouvez effacer le stockage local dans les paramètres de votre navigateur à tout moment ; cela vous déconnectera et réinitialisera votre préférence de langue.`
- s4_title: `Vos droits (KVKK / RGPD)`
- s4_body: `En vertu de l'art. 11 de la KVKK et du RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition au traitement de vos données personnelles. Pour toute demande : {{CONTACT_EPOSTA}}`
- back: `← Retour à l'accueil`

### es
- title: `Política de cookies`
- updated: `Última actualización: 17 de junio de 2026`
- intro: `Vasi solo utiliza cookies esenciales y tecnologías de almacenamiento local similares necesarias para que el servicio funcione. No usamos cookies de seguimiento, analítica ni marketing, y no compartimos datos con terceros.`
- s1_title: `Cookies / almacenamiento local que usamos`
- s1_session: `Sesión (authToken / adminToken): mantiene tu sesión iniciada. Se guarda en el almacenamiento local del navegador y se elimina al cerrar sesión. Esencial.`
- s1_verify: `Verificación de registro (verifyEmail): se guarda temporalmente para llevar tu correo al paso de verificación durante el registro; se elimina al completarla. Esencial.`
- s1_lang: `Preferencia de idioma (vasi_lang): recuerda el idioma de interfaz elegido. Funcional.`
- s2_title: `Cookies de terceros y de seguimiento`
- s2_body: `Ninguna. Vasi no usa cookies de analítica, publicidad ni seguimiento, y no incrusta rastreadores de terceros en sus páginas.`
- s3_title: `Consentimiento y control`
- s3_body: `Dado que los elementos anteriores son estrictamente necesarios para el servicio, no requieren consentimiento previo según la ley aplicable. Puedes borrar el almacenamiento local en la configuración de tu navegador en cualquier momento; esto cerrará tu sesión y restablecerá tu preferencia de idioma.`
- s4_title: `Tus derechos (KVKK / RGPD)`
- s4_body: `Conforme al art. 11 de la KVKK y al RGPD, tienes derecho a acceder, rectificar, suprimir y oponerte al tratamiento de tus datos personales. Para solicitudes: {{CONTACT_EPOSTA}}`
- back: `← Volver al inicio`

### ar
- title: `سياسة ملفات تعريف الارتباط`
- updated: `آخر تحديث: 17 يونيو 2026`
- intro: `يستخدم Vasi فقط ملفات تعريف الارتباط الضرورية وتقنيات التخزين المحلي المشابهة اللازمة لعمل الخدمة. لا نستخدم أي ملفات تعريف ارتباط للتتبع أو التحليلات أو التسويق، ولا نشارك البيانات مع أطراف ثالثة.`
- s1_title: `ملفات تعريف الارتباط / التخزين المحلي الذي نستخدمه`
- s1_session: `الجلسة (authToken / adminToken): تُبقيك مسجّل الدخول. تُحفظ في التخزين المحلي للمتصفح وتُحذف عند تسجيل الخروج. ضرورية.`
- s1_verify: `التحقق من التسجيل (verifyEmail): يُخزَّن مؤقتًا لنقل بريدك إلى خطوة التحقق أثناء التسجيل، ويُحذف بعد اكتمال التحقق. ضرورية.`
- s1_lang: `تفضيل اللغة (vasi_lang): يتذكّر لغة الواجهة التي اخترتها. وظيفية.`
- s2_title: `ملفات تعريف الارتباط من أطراف ثالثة والتتبع`
- s2_body: `لا يوجد. لا يستخدم Vasi أي ملفات تعريف ارتباط للتحليلات أو الإعلانات أو التتبع، ولا يضمّن أي أدوات تتبع من أطراف ثالثة في صفحاته.`
- s3_title: `الموافقة والتحكم`
- s3_body: `بما أن العناصر المذكورة أعلاه ضرورية تمامًا للخدمة، فهي لا تتطلب موافقة مسبقة بموجب القانون المعمول به. يمكنك مسح التخزين المحلي من إعدادات متصفحك في أي وقت؛ سيؤدي ذلك إلى تسجيل خروجك وإعادة تعيين تفضيل اللغة.`
- s4_title: `حقوقك (KVKK / GDPR)`
- s4_body: `بموجب المادة 11 من KVKK واللائحة العامة لحماية البيانات (GDPR)، لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها والاعتراض على معالجتها. للطلبات: {{CONTACT_EPOSTA}}`
- back: `← العودة إلى الصفحة الرئيسية`
