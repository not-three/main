import { KnexInstance } from "../../../plugins/knex";

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const id = getRouterParam(event, 'id');
  const note = await db.from('notes').where('id', id).select('content').select('expires_at').first();
  if (!note) {
    setResponseStatus(event, 404);
    return {success: false, error: 'Note not found'};
  }
  return {
    success: true,
    content: note.content,
    expires: note.expires_at,
  }
})
