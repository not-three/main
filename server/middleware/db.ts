import { Database } from '../plugins/knex';

export default defineEventHandler((event) => {
  event.context.db = Database.getInstance().get();
})
