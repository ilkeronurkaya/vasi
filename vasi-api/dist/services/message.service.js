import * as MessagesDB from '../db/messages.db';
import * as RecipientsDB from '../db/recipients.db';
export class MessageService {
    static async listMessages(env, userId) {
        return await MessagesDB.findAllByUser(env, userId);
    }
    static async getMessage(env, id, userId) {
        const message = await MessagesDB.findById(env, id, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    }
    static async createMessage(env, userId, data) {
        return await MessagesDB.create(env, userId, data);
    }
    static async updateMessage(env, id, userId, data) {
        const message = await MessagesDB.findById(env, id, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return await MessagesDB.update(env, id, userId, data);
    }
    static async deleteMessage(env, id, userId) {
        const message = await MessagesDB.findById(env, id, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return await MessagesDB.remove(env, id, userId);
    }
    static async addRecipient(env, messageId, userId, data) {
        const message = await MessagesDB.findById(env, messageId, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return await RecipientsDB.create(env, messageId, userId, data);
    }
    static async removeRecipient(env, recipientId, messageId, userId) {
        const message = await MessagesDB.findById(env, messageId, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return await RecipientsDB.remove(env, recipientId, messageId, userId);
    }
}
