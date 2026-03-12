import { mysqlPool } from '@/lib/db/mysql';
import { IUserRepository, User } from '../interfaces/user.interface';
import { RowDataPacket } from 'mysql2';

export class MySQLUserRepository implements IUserRepository {
  
  async findById(id: string): Promise<User | null> {
    const [rows] = await mysqlPool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?', [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await mysqlPool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async upsert(user: User): Promise<void> {
    const query = `
      INSERT INTO users (id, email, full_name, avatar_url, phone, provider, last_sign_in_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        full_name = VALUES(full_name),
        avatar_url = VALUES(avatar_url),
        phone = VALUES(phone),
        last_sign_in_at = VALUES(last_sign_in_at)
    `;
    
    await mysqlPool.execute(query, [
      user.id,
      user.email,
      user.full_name || null,
      user.avatar_url || null,
      user.phone || null,
      user.provider || 'email',
      user.last_sign_in_at || new Date()
    ]);
  }
}