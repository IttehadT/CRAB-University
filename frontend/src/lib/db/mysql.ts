// ─── MySQL Connection Pool ────────────────────────────────────────────────────
// NOTE: This is a dedicated academic layer for raw SQL demonstration.
// Auth, sessions, and all live features continue to use Supabase.
// This pool is used only by the Repository/Service architecture below.

import mysql from "mysql2/promise";

export const mysqlPool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});