import { KnexInstance } from "../../../plugins/knex";

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const id = getRouterParam(event, 'id');
  const note = await db.from('notes').where('id', id).select('content', 'burn_after_reading').select('expires_at').first();
  if (!note) {
    setResponseStatus(event, 404);
    return {success: false, error: 'Note not found'};
  }
  if (note.burn_after_reading) await db.from('notes').where('id', id).del();
  return {
    success: true,
    content: note.content,
    expires: note.burn_after_reading ? Math.floor(new Date() / 1000) : note.expires_at,
    burnt: note.burn_after_reading,
  }
})
