import { KnexInstance } from "../../../plugins/knex";
import CryptoJS from "crypto-js";

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const id = getRouterParam(event, 'id');
  const key = getRouterParam(event, 'key');
  if (typeof id !== 'string' || typeof key !== 'string') {
    setResponseStatus(event, 400);
    return {success: false, error: 'Invalid ID or key'};
  }
  const note = await db.from('notes').where('id', id).select('content, expires_at').first();
  if (!note) {
    setResponseStatus(event, 404);
    return {success: false, error: 'Note not found'};
  }
  try {
    return {
      success: true,
      content: CryptoJS.AES.decrypt(note.content, key).toString(CryptoJS.enc.Utf8),
      expires: note.expiresAt,
    }
  } catch (e) {
    setResponseStatus(event, 400);
    return {success: false, error: 'Invalid key'};
  }
})
