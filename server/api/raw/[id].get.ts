import { KnexInstance } from "../../plugins/knex";

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const id = getRouterParam(event, 'id');
  if (typeof id !== 'string') {
    setResponseStatus(event, 400);
    return {success: false, error: 'Invalid ID'};
  }
  const note = await db.from('notes').where('id', id).select('content').first();
  if (!note) {
    setResponseStatus(event, 404);
    return {success: false, error: 'Note not found'};
  }
  return note.content;
})
