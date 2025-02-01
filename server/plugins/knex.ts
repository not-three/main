import knex from 'knex';

export type KnexInstance = ReturnType<typeof knex>;

export class Database {
  private static instance: Database;
  private db: KnexInstance;

  constructor() {
    console.warn([
      "--------------------------------------",
      "UPGRADE AVAILABLE!",
      "!3 2.0 Released with breaking changes!",
      "Please visit our repo for more information on how to redeploy:",
      "https://github.com/not-three/main",
      "--------------------------------------",
      "The UI and API have from now on theyr own containers!",
      "--------------------------------------",
    ]);
    if (process.env.SKIP_DB) this.db = null as any
    else if (process.env.USE_SQLITE) this.db = knex({
        client: 'sqlite3',
        connection: {
          filename: process.env.SQLITE_FILENAME || 'db.sqlite',
        },
        useNullAsDefault: true
      });
    else this.db = knex({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'db',
        password: process.env.DB_PASSWORD || 'db',
        database: process.env.DB_NAME || 'db',
      }
    });

    if (process.env.SKIP_DB) return;
    
    setTimeout(async () => {
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

      if (!await db.schema.hasTable('meta')) {
        await db.schema.createTable('meta', (x) => {
          x.string('key').primary().notNullable();
          x.text('value').notNullable();
        });
        await db.from('meta').insert({key: 'version', value: '1'});
      }
      let version = await db.from('meta').where('key', 'version').select('value').first();
      version = version ? version.value : '1';

      if (version === '1') {
        console.log('Migrating to version 2 of the database');
        version = '2';
        await db.schema.alterTable('notes', (x) => {
          x.boolean('burn_after_reading').notNullable().defaultTo(false);
        });
        await db.from('meta').where('key', 'version').update({value: '2'});
      }

      if (version === '2') {
        console.log('Migrating to version 3 of the database');
        version = '3';
        await db.schema.alterTable('notes', (x) => {
          x.string('language', 16).nullable().defaultTo(null);
        });
        await db.from('meta').where('key', 'version').update({value: '3'});
      }
    }, 15_000);
    
    const deleteOldNotes = async () => {
      console.log('Deleting expired notes');
      await this.db.from('notes').where('expires_at', '<', this.db.fn.now()).del();
    }

    setInterval(deleteOldNotes, Number(process.env.CLEANUP_INTERVAL) || 1000 * 60 * 15)
    deleteOldNotes();
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
  Database.getInstance().get();
})
