import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../types'
import { initializeCheckoutForm, retrieveCheckoutForm } from '../lib/iyzico'
import { findById } from '../db/users.db'

const paymentRoutes = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

paymentRoutes.post('/checkout/init', authMiddleware, async (c) => {
    const { plan_slug } = await c.req.json()
    const userId = c.get('userId')
    
    const plan = await c.env.DB.prepare('SELECT * FROM plans WHERE slug = ?').bind(plan_slug).first()
    if (!plan || !plan.is_active || (plan.price_monthly as number) <= 0) return c.json({ error: 'Geçersiz plan' }, 400)
    
    const sub = await c.env.DB.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND plan_type = ? AND status = 'active'").bind(userId, plan_slug).first()
    if (sub) return c.json({ error: 'Zaten premium', code: 'ALREADY_PREMIUM' }, 409)
    
    const user = await findById(c.env, userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    
    const conversationId = crypto.randomUUID()
    const paymentId = crypto.randomUUID()
    
    await c.env.DB.prepare('INSERT INTO payments (id, user_id, plan_slug, amount, conversation_id) VALUES (?, ?, ?, ?, ?)').bind(paymentId, userId, plan_slug, plan.price_monthly, conversationId).run()
    
    const callbackUrl = (c.env.APP_URL ?? 'http://localhost:3000') + '/api/v1/payment/checkout/callback'
    const result = await initializeCheckoutForm(c.env, {
        conversationId,
        price: plan.price_monthly,
        paidPrice: plan.price_monthly,
        buyerEmail: user.email,
        basketItemName: plan.name,
        callbackUrl
    })
    
    await c.env.DB.prepare('UPDATE payments SET iyzico_token = ? WHERE id = ?').bind(result.token, paymentId).run()
    
    return c.json({ token: result.token, paymentPageUrl: result.paymentPageUrl })
})

// İyzico gerçek modda POST atar; mock modda tarayıcı paymentPageUrl'i GET ile gelir.
// İkisini de aynı handler karşılar.
const callbackHandler = async (c: any) => {
    let token: string | null = c.req.query('token') || null
    if (!token) {
        const body = await c.req.parseBody()
        token = (body.token as string) || null
    }
    
    if (!token) return c.json({ error: 'Token missing' }, 400)
    
    const payment = await c.env.DB.prepare('SELECT * FROM payments WHERE iyzico_token = ?').bind(token).first()
    if (!payment) return c.json({ error: 'Not found' }, 404)
    
    if (payment.status === 'success') {
        return c.redirect((c.env.APP_URL ?? 'http://localhost:3000') + '/upgrade?payment=success')
    }
    
    const result = await retrieveCheckoutForm(c.env, { conversationId: payment.conversation_id as string, token })
    
    if (result.paymentStatus === 'SUCCESS' && result.paidPrice === (payment.amount as number)) {
        // subscriptions.user_id'de UNIQUE yok → ON CONFLICT kullanılamaz.
        // admin.ts kalıbı: aktif abonelik varsa UPDATE, yoksa açık id ile INSERT.
        const existing = await c.env.DB.prepare(
            `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'`
        ).bind(payment.user_id).first()

        if (existing) {
            await c.env.DB.prepare(`
                UPDATE subscriptions SET
                    plan_type = ?, status = 'active',
                    expires_at = datetime('now', '+30 days'),
                    last_payment_ref = ?, last_payment_at = datetime('now'),
                    updated_at = datetime('now')
                WHERE id = ?
            `).bind(payment.plan_slug, result.paymentId, existing.id).run()
        } else {
            await c.env.DB.prepare(`
                INSERT INTO subscriptions
                    (id, user_id, plan_type, status, started_at, expires_at, last_payment_ref, last_payment_at, created_at, updated_at)
                VALUES (?, ?, ?, 'active', datetime('now'), datetime('now', '+30 days'), ?, datetime('now'), datetime('now'), datetime('now'))
            `).bind(crypto.randomUUID(), payment.user_id, payment.plan_slug, result.paymentId).run()
        }

        await c.env.DB.prepare('UPDATE payments SET status = ?, iyzico_payment_id = ? WHERE id = ?')
            .bind('success', result.paymentId, payment.id).run()

        return c.redirect((c.env.APP_URL ?? 'http://localhost:3000') + '/upgrade?payment=success')
    } else {
        await c.env.DB.prepare('UPDATE payments SET status = ?, error_message = ? WHERE id = ?').bind('failure', (result as any).error ?? 'Unknown error', payment.id).run()
        return c.redirect((c.env.APP_URL ?? 'http://localhost:3000') + '/upgrade?payment=failed')
    }
}

paymentRoutes.post('/checkout/callback', callbackHandler)
paymentRoutes.get('/checkout/callback', callbackHandler)

export { paymentRoutes }
