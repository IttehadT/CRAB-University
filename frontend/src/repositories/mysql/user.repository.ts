// ─── MySQL User Repository ────────────────────────────────────────────────────
// Implements IUserRepository using raw MySQL queries.
// This satisfies the academic raw SQL requirement.
// The Service layer calls this — pages never import this directly.

import { mysqlPool } from "@/lib/db/mysql";
import { IUserRepository, User } from "../interfaces/user.interface";
import { RowDataPacket } from "mysql2";

export class MySQLUserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const [rows] = await mysqlPool.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await mysqlPool.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async create(user: User): Promise<void> {
    await mysqlPool.execute(
      "INSERT INTO users (id, email, full_name, created_at) VALUES (?, ?, ?, ?)",
      [user.id, user.email, user.full_name, user.created_at]
    );
  }
}