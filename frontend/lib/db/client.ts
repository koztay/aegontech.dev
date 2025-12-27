import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Returns a cached PostgreSQL connection pool.
 * Use for database queries.
 * This module should ONLY be imported in API routes and server components.
 */
export function getDbPool(): Pool {
    if (pool) return pool;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("Missing DATABASE_URL environment variable");
    }

    pool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    });

    return pool;
}

/**
 * Execute a query with the database pool
 */
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const client = getDbPool();
    const result = await client.query(text, params);
    return result.rows;
}
