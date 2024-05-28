import { KnexInstance } from "../plugins/knex";

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const key = process.env.STATUS_KEY;
  if (key) {
    const query = getQuery(event);
    if (query.key !== key) {
      setResponseStatus(event, 403);
      return {success: false, error: 'Invalid key'};
    }
  }
  const count = await db.from('notes').count('id').first();
  if (!count) {
    return {success: false, error: 'Error counting notes'};
  }
  return {
    success: true,
    count: Number(Object.entries(count as any)[0][1]),
  };
});
