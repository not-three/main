import knex from 'knex';

export type KnexInstance = ReturnType<typeof knex>;

export class Database {
  private static instance: Database;
  private db: KnexInstance;

  constructor() {
    if (process.env.USE_SQLITE) {
      this.db = knex({
        client: 'sqlite3',
        connection: {
          filename: process.env.SQLITE_FILENAME || 'db.sqlite',
        },
        useNullAsDefault: true
      });
    } else this.db = knex({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'db',
        password: process.env.DB_PASSWORD || 'db',
        database: process.env.DB_NAME || 'db',
      }
    });

    (async () => {
      const db = (this as any).db as KnexInstance;
      if (!await db.schema.hasTable('notes')) {
        await db.schema.createTable('notes', (x) => {
          x.string('id').primary().notNullable();
          x.text('content').notNullable();
          x.timestamp('created_at').notNullable();
          x.timestamp('expires_at').notNullable();
          x.string('ip').notNullable();
        });
      }
    })();
    
    setInterval(async () => {
      console.log('Deleting expired notes');
      await this.db.from('notes').where('expires_at', '<', this.db.fn.now()).del();
    }, 1000 * 60 * 15)
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  get(): KnexInstance {
    return this.db;
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = Database.getInstance().get();
})
