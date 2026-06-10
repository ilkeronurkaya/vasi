
import type { Env } from '../types';
import * as MessagesDB from '../db/messages.db';
import * as RecipientsDB from '../db/recipients.db';

export class MessageService {
  static async listMessages(env: Env, userId: string) {
    return await MessagesDB.findAllByUser(env, userId);
  }

  static async getMessage(env: Env, id: string, userId: string) {
    const message = await MessagesDB.findById(env, id, userId);
    if (!message) {
      throw new Error('Message not found');
    }
    const recipients = await env.DB.prepare(
      `SELECT id, full_name, email FROM recipients WHERE message_id = ?`
    ).bind(id).all();
    return { ...message, recipients: recipients.results ?? [] };
  }

  static async createMessage(env: Env, userId: string, data: any) {
    return await MessagesDB.create(env, userId, data);
  }

  static async updateMessage(env: Env, id: string, userId: string, data: any) {
    const message = await MessagesDB.findById(env, id, userId);
    if (!message) {
      throw new Error('Message not found');
    }
    return await MessagesDB.update(env, id, userId, data);
  }

  static async deleteMessage(env: Env, id: string, userId: string) {
    const message = await MessagesDB.findById(env, id, userId);
    if (!message) {
      throw new Error('Message not found');
    }
    return await MessagesDB.remove(env, id, userId);
  }

  static async addRecipient(env: Env, messageId: string, userId: string, data: any) {
    const message = await MessagesDB.findById(env, messageId, userId);
    if (!message) {
      throw new Error('Message not found');
    }
    return await RecipientsDB.create(env, messageId, userId, data);
  }

  static async removeRecipient(env: Env, recipientId: string, messageId: string, userId: string) {
    const message = await MessagesDB.findById(env, messageId, userId);
    if (!message) {
      throw new Error('Message not found');
    }
    return await RecipientsDB.remove(env, recipientId, messageId, userId);
  }
}
