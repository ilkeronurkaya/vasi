import { Env } from '../types';

async function generateSignature(
    env: Env,
    path: string,
    body: any,
    randomKey: string
): Promise<string> {
    const requestBodyString = JSON.stringify(body);
    const payload = randomKey + path + requestBodyString;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.IYZICO_SECRET_KEY);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(payload)
    );
    
    const byteArray = new Uint8Array(signatureBuffer);
    return Array.from(byteArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function initializeCheckoutForm(
    env: Env,
    { conversationId, price, paidPrice, buyerEmail, basketItemName, callbackUrl }: any
) {
    if (env.IYZICO_MODE === 'mock') {
        const token = "mock_" + conversationId;
        return {
            token,
            paymentPageUrl: (env.APP_URL ?? "http://localhost:3000") + "/api/v1/payment/checkout/callback?token=" + token
        };
    }
    
    const randomKey = String(Date.now());
    const path = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
    const body = {
        locale: "tr",
        conversationId,
        price: String(price),
        paidPrice: String(paidPrice),
        currency: "TRY",
        basketId: "B_" + conversationId,
        paymentGroup: "PRODUCT",
        callbackUrl,
        buyer: {
            id: "BY_" + conversationId,
            name: "Test",
            surname: "User",
            email: buyerEmail,
            identityNumber: "11111111110"
        },
        shippingAddress: { address: "Test", zipCode: "00000", contactName: "Test User", city: "Istanbul", country: "Turkey" },
        billingAddress: { address: "Test", zipCode: "00000", contactName: "Test User", city: "Istanbul", country: "Turkey" },
        basketItems: [{ id: "I_" + conversationId, name: basketItemName, category1: "Test", itemType: "VIRTUAL", price: String(paidPrice) }]
    };
    
    const signature = await generateSignature(env, path, body, randomKey);
    const authStr = `apiKey:${env.IYZICO_API_KEY}&randomKey:${randomKey}&signature:${signature}`;
    
    const baseUrl = env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'IYZWSv2 ' + btoa(authStr),
            'x-iyzi-rnd': randomKey
        },
        body: JSON.stringify(body)
    });
    
    const data: any = await response.json();
    if (data.status !== 'success') throw new Error(data.errorMessage || 'Iyzico init failed');
    return { token: data.token, paymentPageUrl: data.paymentPageUrl };
}

export async function retrieveCheckoutForm(env: Env, { conversationId, token }: { conversationId: string, token: string }) {
    if (env.IYZICO_MODE === 'mock') {
        if (token.includes("fail")) return { paymentStatus: 'FAILURE' };
        return { paymentStatus: 'SUCCESS', paidPrice: 49.0, paymentId: 'mock_pay_' + token, raw: {} };
    }
    
    const randomKey = String(Date.now());
    const path = "/payment/iyzipos/checkoutform/auth/ecom/detail";
    const body = { locale: "tr", conversationId, token };
    
    const signature = await generateSignature(env, path, body, randomKey);
    const authStr = `apiKey:${env.IYZICO_API_KEY}&randomKey:${randomKey}&signature:${signature}`;
    
    const baseUrl = env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'IYZWSv2 ' + btoa(authStr),
            'x-iyzi-rnd': randomKey
        },
        body: JSON.stringify(body)
    });
    
    const data: any = await response.json();
    if (data.status !== 'success') return { paymentStatus: 'FAILURE', error: data.errorMessage };
    return { 
        paymentStatus: data.paymentStatus === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
        paidPrice: parseFloat(data.paidPrice),
        paymentId: data.paymentId,
        raw: data
    };
}
