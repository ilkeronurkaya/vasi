'use client';

import { useEffect, useState } from 'react';

const CONTENT: Record<string, Record<string, string>> = {
  tr: {
    title: 'Çerez Politikası',
    updated: 'Son güncelleme: 17 Haziran 2026',
    intro: 'Vasi, hizmetin çalışması için yalnızca zorunlu çerez ve benzeri yerel depolama teknolojilerini kullanır. İzleme, analitik veya pazarlama amaçlı çerez kullanmayız ve üçüncü taraflarla veri paylaşmayız.',
    s1_title: 'Kullandığımız çerezler / yerel depolama',
    s1_session: 'Oturum (authToken / adminToken): Giriş yaptığında oturumunu sürdürür. Tarayıcının yerel depolamasında tutulur ve çıkış yaptığında silinir. Zorunlu.',
    s1_verify: 'Kayıt doğrulama (verifyEmail): Kayıt sırasında e-posta doğrulama adımına taşımak için geçici olarak saklanır; doğrulama tamamlanınca silinir. Zorunlu.',
    s1_lang: 'Dil tercihi (vasi_lang): Seçtiğin arayüz dilini hatırlar. İşlevsel.',
    s2_title: 'Üçüncü taraf ve izleme çerezleri',
    s2_body: 'Yok. Vasi analitik, reklam veya izleme çerezi kullanmaz; sayfalarımıza üçüncü taraf izleyici yerleştirmeyiz.',
    s3_title: 'Onay ve kontrol',
    s3_body: 'Yukarıdaki kalemler hizmetin çalışması için zorunlu olduğundan, mevzuat gereği ön onay gerektirmez. Dilersen tarayıcı ayarlarından yerel depolamayı temizleyebilirsin; bu durumda oturumun kapanır ve dil tercihin sıfırlanır.',
    s4_title: 'Haklarınız (KVKK / GDPR)',
    s4_body: 'KVKK m.11 ve GDPR kapsamında; kişisel verilerine erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsin. Talepler için: info@vasiapp.com',
    close: 'Kapat',
  },
  en: {
    title: 'Cookie Policy',
    updated: 'Last updated: 17 June 2026',
    intro: 'Vasi uses only essential cookies and similar local-storage technologies required for the service to work. We do not use any tracking, analytics, or marketing cookies, and we do not share data with third parties.',
    s1_title: 'Cookies / local storage we use',
    s1_session: 'Session (authToken / adminToken): Keeps you signed in. Stored in your browser\'s local storage and removed when you log out. Essential.',
    s1_verify: 'Sign-up verification (verifyEmail): Temporarily stored to carry your email into the verification step during sign-up; removed once verification completes. Essential.',
    s1_lang: 'Language preference (vasi_lang): Remembers your chosen interface language. Functional.',
    s2_title: 'Third-party and tracking cookies',
    s2_body: 'None. Vasi uses no analytics, advertising, or tracking cookies, and we embed no third-party trackers on our pages.',
    s3_title: 'Consent and control',
    s3_body: 'Because the items above are strictly necessary for the service, they do not require prior consent under applicable law. You may clear local storage in your browser settings at any time; this will log you out and reset your language preference.',
    s4_title: 'Your rights (KVKK / GDPR)',
    s4_body: 'Under KVKK Art. 11 and the GDPR, you have the right to access, correct, delete, and object to the processing of your personal data. For requests: info@vasiapp.com',
    close: 'Close',
  },
  de: {
    title: 'Cookie-Richtlinie',
    updated: 'Zuletzt aktualisiert: 17. Juni 2026',
    intro: 'Vasi verwendet nur notwendige Cookies und ähnliche lokale Speichertechnologien, die für den Betrieb des Dienstes erforderlich sind. Wir verwenden keine Tracking-, Analyse- oder Marketing-Cookies und geben keine Daten an Dritte weiter.',
    s1_title: 'Verwendete Cookies / lokaler Speicher',
    s1_session: 'Sitzung (authToken / adminToken): Hält dich angemeldet. Wird im lokalen Speicher des Browsers abgelegt und beim Abmelden entfernt. Notwendig.',
    s1_verify: 'Registrierungsbestätigung (verifyEmail): Wird vorübergehend gespeichert, um deine E-Mail während der Registrierung in den Bestätigungsschritt zu übernehmen; nach Abschluss entfernt. Notwendig.',
    s1_lang: 'Sprachauswahl (vasi_lang): Merkt sich deine gewählte Oberflächensprache. Funktional.',
    s2_title: 'Cookies von Drittanbietern und Tracking',
    s2_body: 'Keine. Vasi verwendet keine Analyse-, Werbe- oder Tracking-Cookies und bindet keine Tracker von Drittanbietern ein.',
    s3_title: 'Einwilligung und Kontrolle',
    s3_body: 'Da die oben genannten Elemente für den Dienst unbedingt erforderlich sind, ist nach geltendem Recht keine vorherige Einwilligung erforderlich. Du kannst den lokalen Speicher jederzeit in deinen Browsereinstellungen löschen; dadurch wirst du abgemeldet und deine Sprachauswahl zurückgesetzt.',
    s4_title: 'Deine Rechte (KVKK / DSGVO)',
    s4_body: 'Gemäß KVKK Art. 11 und der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch gegen die Verarbeitung deiner personenbezogenen Daten. Für Anfragen: info@vasiapp.com',
    close: 'Schließen',
  },
  fr: {
    title: 'Politique relative aux cookies',
    updated: 'Dernière mise à jour : 17 juin 2026',
    intro: 'Vasi n’utilise que les cookies essentiels et technologies de stockage local similaires nécessaires au fonctionnement du service. Nous n’utilisons aucun cookie de suivi, d’analyse ou de marketing, et ne partageons aucune donnée avec des tiers.',
    s1_title: 'Cookies / stockage local utilisés',
    s1_session: 'Session (authToken / adminToken) : vous maintient connecté. Stocké dans le stockage local du navigateur et supprimé à la déconnexion. Essentiel.',
    s1_verify: 'Vérification d’inscription (verifyEmail) : stocké temporairement pour transmettre votre e-mail à l’étape de vérification lors de l’inscription ; supprimé une fois la vérification terminée. Essentiel.',
    s1_lang: 'Préférence de langue (vasi_lang) : mémorise la langue d’interface choisie. Fonctionnel.',
    s2_title: 'Cookies tiers et de suivi',
    s2_body: 'Aucun. Vasi n’utilise aucun cookie d’analyse, de publicité ou de suivi, et n’intègre aucun traceur tiers sur ses pages.',
    s3_title: 'Consentement et contrôle',
    s3_body: 'Comme les éléments ci-dessus sont strictement nécessaires au service, ils ne requièrent pas de consentement préalable selon la loi applicable. Vous pouvez effacer le stockage local dans les paramètres de votre navigateur à tout moment ; cela vous déconnectera et réinitialisera votre préférence de langue.',
    s4_title: 'Vos droits (KVKK / RGPD)',
    s4_body: 'En vertu de l’art. 11 de la KVKK et du RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement et d’opposition au traitement de vos données personnelles. Pour toute demande : info@vasiapp.com',
    close: 'Fermer',
  },
  es: {
    title: 'Política de cookies',
    updated: 'Última actualización: 17 de junio de 2026',
    intro: 'Vasi solo utiliza cookies esenciales y tecnologías de almacenamiento local similares necesarias para que el servicio funcione. No usamos cookies de seguimiento, analítica ni marketing, y no compartimos datos con terceros.',
    s1_title: 'Cookies / almacenamiento local que usamos',
    s1_session: 'Sesión (authToken / adminToken): mantiene tu sesión iniciada. Se guarda en el almacenamiento local del navegador y se elimina al cerrar sesión. Esencial.',
    s1_verify: 'Verificación de registro (verifyEmail): se guarda temporalmente para llevar tu correo al paso de verificación durante el registro; se elimina al completarla. Esencial.',
    s1_lang: 'Preferencia de idioma (vasi_lang): recuerda el idioma de interfaz elegido. Funcional.',
    s2_title: 'Cookies de terceros y de seguimiento',
    s2_body: 'Ninguna. Vasi no usa cookies de analítica, publicidad ni seguimiento, y no incrusta rastreadores de terceros en sus páginas.',
    s3_title: 'Consentimiento y control',
    s3_body: 'Dado que los elementos anteriores son estrictamente necesarios para el servicio, no requieren consentimiento previo según la ley aplicable. Puedes borrar el almacenamiento local en la configuración de tu navegador en cualquier momento; esto cerrará tu sesión y restablecerá tu preferencia de idioma.',
    s4_title: 'Tus derechos (KVKK / RGPD)',
    s4_body: 'Conforme al art. 11 de la KVKK y al RGPD, tienes derecho a acceder, rectificar, suprimir y oponerte al tratamiento de tus datos personales. Para solicitudes: info@vasiapp.com',
    close: 'Cerrar',
  },
  ar: {
    title: 'سياسة ملفات تعريف الارتباط',
    updated: 'آخر تحديث: 17 يونيو 2026',
    intro: 'يستخدم Vasi فقط ملفات تعريف الارتباط الضرورية وتقنيات التخزين المحلي المشابهة اللازمة لعمل الخدمة. لا نستخدم أي ملفات تعريف ارتباط للتتبع أو التحليلات أو التسويق، ولا نشارك البيانات مع أطراف ثالثة.',
    s1_title: 'ملفات تعريف الارتباط / التخزين المحلي الذي نستخدمه',
    s1_session: 'الجلسة (authToken / adminToken): تُبقيك مسجّل الدخول. تُحفظ في التخزين المحلي للمتصفح وتُحذف عند تسجيل الخروج. ضرورية.',
    s1_verify: 'التحقق من التسجيل (verifyEmail): يُخزَّن مؤقتًا لنقل بريدك إلى خطوة التحقق أثناء التسجيل، ويُحذف بعد اكتمال التحقق. ضرورية.',
    s1_lang: 'تفضيل اللغة (vasi_lang): يتذكّر لغة الواجهة التي اخترتها. وظيفية.',
    s2_title: 'ملفات تعريف الارتباط من أطراف ثالثة والتتبع',
    s2_body: 'لا يوجد. لا يستخدم Vasi أي ملفات تعريف ارتباط للتحليلات أو الإعلانات أو التتبع، ولا يضمّن أي أدوات تتبع من أطراف ثالثة في صفحاته.',
    s3_title: 'الموافقة والتحكم',
    s3_body: 'بما أن العناصر المذكورة أعلاه ضرورية تمامًا للخدمة، فهي لا تتطلب موافقة مسبقة بموجب القانون المعمول به. يمكنك مسح التخزين المحلي من إعدادات متصفحك في أي وقت؛ سيؤدي ذلك إلى تسجيل خروجك وإعادة تعيين تفضيل اللغة.',
    s4_title: 'حقوقك (KVKK / GDPR)',
    s4_body: 'بموجب المادة 11 من KVKK واللائحة العامة لحماية البيانات (GDPR)، لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها والاعتراض على معالجاتها. للطلبات: info@vasiapp.com',
    close: 'إغلاق',
  },
};

const RTL = new Set(['ar']);

export function CookiePolicyModal() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    const readLang = () => {
      try {
        const l = localStorage.getItem('vasi_lang') || 'tr';
        return CONTENT[l] ? l : 'tr';
      } catch {
        return 'tr';
      }
    };
    queueMicrotask(() => setLang(readLang()));
    const openHandler = () => {
      setLang(readLang());
      setOpen(true);
    };
    window.addEventListener('vasi-open-cookie-policy', openHandler);
    return () => window.removeEventListener('vasi-open-cookie-policy', openHandler);
  }, []);

  if (!open) return null;

  const t = CONTENT[lang];
  const rtl = RTL.has(lang);
  const close = () => setOpen(false);

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          background: 'var(--midnight)',
          border: '1px solid var(--horizon)',
          borderRadius: '16px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '32px',
          color: 'var(--cream)',
          lineHeight: '1.7',
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
        }}
      >
        <h2 style={{ color: 'var(--cream)', marginTop: 0 }}>{t.title}</h2>
        <p style={{ color: 'var(--mist)', fontSize: '13px' }}>{t.updated}</p>
        <p>{t.intro}</p>

        <h3 style={{ marginTop: '24px' }}>{t.s1_title}</h3>
        <p>{t.s1_session}</p>
        <p>{t.s1_verify}</p>
        <p>{t.s1_lang}</p>

        <h3 style={{ marginTop: '24px' }}>{t.s2_title}</h3>
        <p>{t.s2_body}</p>

        <h3 style={{ marginTop: '24px' }}>{t.s3_title}</h3>
        <p>{t.s3_body}</p>

        <h3 style={{ marginTop: '24px' }}>{t.s4_title}</h3>
        <p>{t.s4_body}</p>

        <div style={{ marginTop: '28px', textAlign: rtl ? 'left' : 'right' }}>
          <button className="btn btn-primary btn-sm" onClick={close}>{t.close}</button>
        </div>
      </div>
    </div>
  );
}
