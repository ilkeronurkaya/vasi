"use strict";
// lib/uuid.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
function generateUUID() {
    return crypto.randomUUID();
}
