import { KnexInstance } from "../plugins/knex"
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const db = event.context.db as KnexInstance;
  const body = await readBody(event);
  const defaultExpires = 1000 * (Number(process.env.EXPIRY) || 60 * 60 * 24 * 30);
  if (typeof body.content !== 'string') {
    setResponseStatus(event, 400);
    return {success: false, error: 'Invalid content'}
  }
  if (body.content.length > (Number(process.env.MAX_LENGTH) || 10000)) {
    setResponseStatus(event, 400);
    return {success: false, error: 'Content too long'}
  }
  if (body.content.length <= 0) {
    setResponseStatus(event, 400);
    return {success: false, error: 'Content too short'}
  }
  if (body.language) {
    if (typeof body.language !== 'string') {
      setResponseStatus(event, 400);
      return {success: false, error: 'Invalid language'}
    }
    if (body.language.length > 16) {
      setResponseStatus(event, 400);
      return {success: false, error: 'Language too long'}
    }
    if (/[^a-zA-Z0-9_-]/.test(body.language)) {
      setResponseStatus(event, 400);
      return {success: false, error: 'Invalid language'}
    }
  }
  if (body.expires) {
    if (typeof body.expires !== 'number') {
      setResponseStatus(event, 400);
      return {success: false, error: 'Invalid expiry'}
    }
    if (body.expires < 30_000) {
      setResponseStatus(event, 400);
      return {success: false, error: 'Expiry too short'}
    }
    if (body.expires > defaultExpires) {
      setResponseStatus(event, 400);
      return {success: false, error: 'Expiry too long'}
    }
  }
  if (typeof body.burn_after_reading !== 'boolean' && body.burn_after_reading !== undefined) {
    setResponseStatus(event, 400);
    return {success: false, error: 'Invalid burn_after_reading'}
  }
  const realIP = event.node.req.socket.remoteAddress || '127.0.0.1';
  const ipEnv = process.env.IP_HEADER;
  const ip = ipEnv !== 'false' ? event.node.req.headers[ipEnv || 'x-real-ip'] || realIP : realIP;
  const last60Minutes = new Date(Date.now() - (1000 * 60 * 60));
  const lastXNotes = await db.from('notes').where('ip', ip).where('created_at', '>', last60Minutes).count().as('count');
  const lastXNotesCount = (lastXNotes[0] as any)[Object.keys(lastXNotes[0])[0]]
  if (lastXNotesCount >= (Number(process.env.MAX_NOTES_PER_HOUR) || 200)) {
    setResponseStatus(event, 429);
    return {success: false, error: 'Rate limited'}
  }
  const id = nanoid();
  await db.from('notes').insert({
    id, ip,
    content: body.content,
    created_at: db.fn.now(),
    expires_at: new Date(Date.now() + (body.expires || defaultExpires)),
    language: body.language || null,
    burn_after_reading: body.burn_after_reading || false,
  });
  return {success: true, id};
})
