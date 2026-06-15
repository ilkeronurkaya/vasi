
'use client'
export const runtime = 'edge'

import { apiFetch } from '@/lib/api'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useLang, t } from '@/lib/i18n'

interface MeData {
    user: {
        id: string
        email: string
        first_name: string | null
        last_name: string | null
        phone: string | null
    }
    plan: string
    usage: {
        messages_used: number
        messages_limit: number
    }
}

type Section = 'profile' | 'email' | 'password'

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--mist)', marginBottom: '6px' }
const inputStyle = { width: '100%', minHeight: '44px', padding: '10px 14px', background: 'var(--obsidian)', border: '1px solid var(--horizon)', borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px', outline: 'none', transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)', boxSizing: 'border-box' as const }
const cardStyle = { background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '24px' }

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [meData, setMeData] = useState<MeData | null>(null)
    const [lang, setLang] = useLang()

    // Profile fields
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')

    // Email field
    const [newEmail, setNewEmail] = useState('')

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    // OTP states per section: { requesting: boolean, otpValue: string, submitted: boolean }
    const [sectionStates, setSectionStates] = useState<Record<Section, { requesting: boolean; otpValue: string; submitted: boolean }>>({
        profile: { requesting: false, otpValue: '', submitted: false },
        email: { requesting: false, otpValue: '', submitted: false },
        password: { requesting: false, otpValue: '', submitted: false },
    })

    // Per-section messages
    const [sectionMessages, setSectionMessages] = useState<Record<Section, { type: 'success' | 'error'; text: string } | null>>({
        profile: null,
        email: null,
        password: null,
    })

    useEffect(() => {
        apiFetch('/api/v1/me')
            .then((data: MeData) => {
                setMeData(data)
                setFirstName(data.user.first_name || '')
                setLastName(data.user.last_name || '')
                setPhone(data.user.phone || '')
                setLoading(false)
            })
            .catch(() => {
                setError('Veriler yüklenemedi.')
                setLoading(false)
            })
    }, [])

    const resetSectionMessage = (section: Section) => {
        setSectionMessages(prev => ({ ...prev, [section]: null }))
    }

    const handleRequestOtp = async (section: Section) => {
        resetSectionMessage(section)
        try {
            await apiFetch('/api/v1/me/profile/request-otp', { method: 'POST' })
            setSectionStates(prev => ({
                ...prev,
                [section]: { ...prev[section], requesting: true, otpValue: '', submitted: false },
            }))
        } catch (e) {
            const err = e as { data?: { error?: string } }
            setSectionMessages(prev => ({ ...prev, [section]: { type: 'error', text: err.data?.error || 'OTP istek hatası' } }))
        }
    }

    const handleSave = async (section: Section) => {
        resetSectionMessage(section)
        const state = sectionStates[section]
        if (!state.otpValue || state.otpValue.length < 4) {
            setSectionMessages(prev => ({ ...prev, [section]: { type: 'error', text: 'OTP zorunlu' } }))
            return
        }

        const body: Record<string, unknown> = { otp: state.otpValue }

        if (section === 'profile') {
            if (firstName !== (meData?.user.first_name || '')) body.first_name = firstName
            if (lastName !== (meData?.user.last_name || '')) body.last_name = lastName
            if (phone !== (meData?.user.phone || '')) body.phone = phone
            // No changes needed
            const hasChanges = body.first_name !== undefined || body.last_name !== undefined || body.phone !== undefined
            if (!hasChanges) {
                setSectionMessages(prev => ({ ...prev, [section]: { type: 'success', text: 'Değişiklik yok.' } }))
                return
            }
        } else if (section === 'email') {
            if (!newEmail || newEmail === meData?.user.email) {
                setSectionMessages(prev => ({ ...prev, [section]: { type: 'success', text: 'E-posta değişikliği yok.' } }))
                return
            }
            body.email = newEmail
        } else if (section === 'password') {
            if (!newPassword) {
                setSectionMessages(prev => ({ ...prev, [section]: { type: 'error', text: 'Yeni şifre zorunlu' } }))
                return
            }
            if (newPassword.length < 8) {
                setSectionMessages(prev => ({ ...prev, [section]: { type: 'error', text: 'Şifre en az 8 hane olmalı' } }))
                return
            }
            body.current_password = currentPassword
            body.new_password = newPassword
        }

        try {
            await apiFetch('/api/v1/me/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            // Refresh data
            const refreshed = await apiFetch('/api/v1/me')
            setMeData(refreshed)

            // Reset section
            const cleanState = { ...sectionStates[section], requesting: false, otpValue: '', submitted: false }
            setSectionStates(prev => ({ ...prev, [section]: cleanState }))

            if (section === 'profile') {
                setFirstName(refreshed.user.first_name || '')
                setLastName(refreshed.user.last_name || '')
                setPhone(refreshed.user.phone || '')
            } else if (section === 'email') {
                setNewEmail('')
            } else if (section === 'password') {
                setCurrentPassword('')
                setNewPassword('')
            }

            setSectionMessages(prev => ({ ...prev, [section]: { type: 'success', text: 'Bilgiler güncellendi.' } }))
        } catch (e) {
            const err = e as { data?: { error?: string } }
            setSectionMessages(prev => ({ ...prev, [section]: { type: 'error', text: err.data?.error || 'Güncelleme hatası' } }))
        }
    }

    if (loading) {
        return <div style={{ color: 'var(--mist)', fontSize: '14px' }}>{t('common_loading', lang)}</div>
    }

    const renderSection = (section: Section, title: string, description: string, fields: React.ReactNode) => {
        const state = sectionStates[section]
        const msg = sectionMessages[section]

        return (
            <div style={cardStyle}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px' }}>{title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--mist)', marginBottom: '20px' }}>{description}</p>

                {msg && (
                    <div style={{
                        background: msg.type === 'success' ? 'rgba(75, 181, 67, 0.15)' : 'rgba(212, 59, 59, 0.15)',
                        color: msg.type === 'success' ? '#4bb543' : '#d43b3b',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '16px',
                    }}>
                        {msg.text}
                    </div>
                )}

                {!state.requesting ? (
                    <>
                        {fields}
                        <button
                            className="btn btn-primary btn-md"
                            style={{ marginTop: '16px' }}
                            onClick={() => handleRequestOtp(section)}
                        >
                            {t('settings_save', lang)}
                        </button>
                    </>
                ) : (
                    <>
                        <label style={labelStyle}>{t('settings_otp_label', lang)}</label>
                        <input
                            type="text"
                            value={state.otpValue}
                            onChange={(e) => setSectionStates(prev => ({
                                ...prev,
                                [section]: { ...prev[section], otpValue: e.target.value },
                            }))}
                            style={inputStyle}
                            maxLength={10}
                            placeholder="6 haneli kodu girin"
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button
                                className="btn btn-primary btn-md"
                                onClick={() => handleSave(section)}
                            >
                                {t('settings_save', lang)}
                            </button>
                            <button
                                className="btn btn-ghost btn-md"
                                onClick={() => setSectionStates(prev => ({
                                    ...prev,
                                    [section]: { ...prev[section], requesting: false },
                                }))}
                            >
                                {t('settings_cancel', lang)}
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--cream)', marginBottom: '24px' }}>{t('settings_title', lang)}</h1>

            {error && (
                <div style={{ background: 'rgba(212, 59, 59, 0.15)', color: '#d43b3b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Dil Bölümü — OTP YOK (dil hassas değil, OTP'li bölümlerden bağımsız) */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px' }}>{t('settings_lang_title', lang)}</h2>
                <p style={{ fontSize: '13px', color: 'var(--mist)', marginBottom: '20px' }}>{t('settings_lang_desc', lang)}</p>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'tr' | 'en')}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                >
                    <option value="tr">{t('settings_lang_tr', lang)}</option>
                    <option value="en">{t('settings_lang_en', lang)}</option>
                </select>
            </div>

            {/* Profil Bölümü */}
            {renderSection(
                'profile',
                t('settings_profile_title', lang),
                t('settings_profile_desc', lang),
                <>
                    <label style={labelStyle}>{t('settings_label_firstname', lang)}</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />

                    <label style={{ ...labelStyle, marginTop: '16px' }}>{t('settings_label_lastname', lang)}</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />

                    <label style={{ ...labelStyle, marginTop: '16px' }}>{t('settings_label_phone', lang)}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+90 5XX XXX XX XX" />
                </>
            )}

            {/* E-posta Bölümü */}
            {renderSection(
                'email',
                t('settings_email_title', lang),
                t('settings_email_desc', lang),
                <>
                    <label style={labelStyle}>{t('settings_label_current_email', lang)}</label>
                    <input value={meData?.user.email || ''} style={{ ...inputStyle, color: 'var(--mist)' }} disabled />

                    <label style={{ ...labelStyle, marginTop: '16px' }}>{t('settings_label_new_email', lang)}</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} placeholder="yeni@ornek.com" />
                </>
            )}

            {/* Şifre Bölümü */}
            {renderSection(
                'password',
                t('settings_password_title', lang),
                t('settings_password_desc', lang),
                <>
                    <label style={labelStyle}>{t('settings_label_current_password', lang)}</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Mevcut şifreniz" />

                    <label style={{ ...labelStyle, marginTop: '16px' }}>{t('settings_label_new_password', lang)}</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} placeholder="En az 8 karakter" />
                </>
            )}

            <button className="btn btn-secondary btn-sm" style={{ marginTop: '32px' }} onClick={() => router.back()}>
                {t('common_back', lang)}
            </button>
        </div>
    )
}
