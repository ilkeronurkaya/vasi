'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export type InfoLang = {
  title: string;
  updated?: string;
  sections: { h?: string; p: string }[];
};

export type InfoContent = Record<string, InfoLang>;

const RTL = new Set(['ar']);

const BACK: Record<string, string> = {
  tr: '← Ana sayfaya dön',
  en: '← Back to home',
  de: '← Zurück zur Startseite',
  fr: "← Retour à l'accueil",
  es: '← Volver al inicio',
  ar: '← العودة إلى الصفحة الرئيسية',
};

export function InfoPage({ content }: { content: InfoContent }) {
  const [lang] = useLang();
  const t = content[lang] ?? content.tr;
  const rtl = RTL.has(lang);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px', color: 'var(--cream)', lineHeight: '1.7' }}>
        <h1 style={{ color: 'var(--cream)' }}>{t.title}</h1>
        {t.updated ? <p style={{ color: 'var(--mist)', fontSize: '13px' }}>{t.updated}</p> : null}
        {t.sections.map((s, i) => (
          <div key={i}>
            {s.h ? <h2 style={{ marginTop: '28px', color: 'var(--cream)' }}>{s.h}</h2> : null}
            <p style={{ whiteSpace: 'pre-line' }}>{s.p}</p>
          </div>
        ))}
        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{ color: 'var(--copper)' }}>{BACK[lang] ?? BACK.tr}</Link>
        </div>
      </div>
    </div>
  );
}
