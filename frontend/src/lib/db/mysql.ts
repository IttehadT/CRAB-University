// src/lib/db/mysql.ts

/**
 * ── THE MYSQL WORKER ────────────────────────────────────────────────────────
 * This file ONLY knows how to talk to Aiven MySQL. 
 * It contains no logic, no decisions, and no filtering.
 * It opens the connection and provides a safe way to execute queries.
 */

import mysql from "mysql2/promise";

// 1. The Persistent Connection Pool
// We keep this exactly as you wrote it to ensure stability.
export const mysqlPool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 2. Generic Query Helper (From your Architecture Plan)
// This allows control.ts to pass ANY SQL string and safely get data back.
export async function mysqlQuery<T>(
  sql: string,
  params: any[] = [] 
): Promise<T[]> {
  const [rows] = await mysqlPool.execute(sql, params);
  return rows as T[];
}