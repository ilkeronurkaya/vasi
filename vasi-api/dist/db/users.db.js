export async function findByEmail(env, email) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first();
    return user || null;
}
export async function findById(env, id) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(id)
        .first();
    return user || null;
}
export async function create(env, userData) {
    const { email, password_hash, first_name, last_name, phone, status } = userData;
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO users (id, email, password_hash, first_name, last_name, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(id, email, password_hash, first_name, last_name, phone, status)
        .run();
    return id;
}
export async function updateEmailVerified(env, userId) {
    await env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
        .bind(userId)
        .run();
}
