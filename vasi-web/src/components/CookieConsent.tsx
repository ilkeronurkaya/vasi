'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COPY: Record<string, { text: string; link: string; btn: string }> = {
  tr: { text: '🍪 Vasi yalnızca zorunlu çerezleri kullanır (oturum ve dil tercihi). İzleme veya analitik çerez yok.', link: 'Çerez Politikası', btn: 'Anladım' },
  en: { text: '🍪 Vasi uses only essential cookies (session and language preference). No tracking or analytics.', link: 'Cookie Policy', btn: 'Got it' },
  de: { text: '🍪 Vasi verwendet nur notwendige Cookies (Sitzung und Sprachauswahl). Kein Tracking, keine Analyse.', link: 'Cookie-Richtlinie', btn: 'Verstanden' },
  fr: { text: "🍪 Vasi n'utilise que des cookies essentiels (session et préférence de langue). Aucun suivi ni analyse.", link: 'Politique relative aux cookies', btn: "J'ai compris" },
  es: { text: '🍪 Vasi solo usa cookies esenciales (sesión y preferencia de idioma). Sin seguimiento ni analíticas.', link: 'Política de cookies', btn: 'Entendido' },
  ar: { text: '🍪 يستخدم Vasi ملفات تعريف الارتباط الضرورية فقط (الجلسة وتفضيل اللغة). لا تتبع ولا تحليلات.', link: 'سياسة ملفات تعريف الارتباط', btn: 'حسناً' },
};

const RTL = new Set(['ar']);

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    try {
      const ack = localStorage.getItem('vasi_cookie_notice');
      const l = localStorage.getItem('vasi_lang') || 'tr';
      queueMicrotask(() => {
        setLang(COPY[l] ? l : 'tr');
        if (!ack) setVisible(true);
      });
    } catch {}
  }, []);

  if (!visible) return null;

  const t = COPY[lang];
  const rtl = RTL.has(lang);

  const accept = () => {
    try { localStorage.setItem('vasi_cookie_notice', 'v1'); } catch {};
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        background: 'var(--midnight)',
        borderTop: '1px solid var(--horizon)',
        color: 'var(--cream)',
        padding: '14px 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,.25)',
      }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 16px' }}>
        <span style={{ fontSize: '14px' }}>{t.text}</span>
        <Link href="/cerez-politikasi" style={{ color: 'var(--copper)', fontSize: '14px', textDecoration: 'underline' }}>
          {t.link}
        </Link>
        <button className="btn btn-primary btn-sm" onClick={accept}>
          {t.btn}
        </button>
      </div>
    </div>
  );
}
