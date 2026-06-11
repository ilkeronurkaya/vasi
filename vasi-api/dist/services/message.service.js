"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const MessagesDB = __importStar(require("../db/messages.db"));
const RecipientsDB = __importStar(require("../db/recipients.db"));
class MessageService {
    static async listMessages(env, userId) {
        return await MessagesDB.findAllByUser(env, userId);
    }
    static async getMessage(env, id, userId) {
        const message = await MessagesDB.findById(env, id, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        const recipients = await env.DB.prepare(`SELECT id, full_name, email FROM recipients WHERE message_id = ?`).bind(id).all();
        return { ...message, recipients: recipients.results ?? [] };
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
exports.MessageService = MessageService;
