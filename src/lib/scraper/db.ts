/**
 * Database module for the application
 */

import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * SQL template tag for making database queries
 */
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  return {
    text: strings.reduce((prev, curr, i) => prev + '$' + i + curr),
    values,
  };
}

/**
 * Database client for executing queries
 */
export const db = {
  /**
   * Execute a SQL query
   */
  async execute(query: string, params: any[] = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount,
      };
    } finally {
      client.release();
    }
  },

  /**
   * Execute a SQL query using the sql template tag
   */
  async query(sqlQuery: { text: string; values: any[] }) {
    const client = await pool.connect();
    try {
      const result = await client.query(sqlQuery.text, sqlQuery.values);
      return {
        rows: result.rows,
        rowCount: result.rowCount,
      };
    } finally {
      client.release();
    }
  },

  /**
   * Begin a transaction
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
