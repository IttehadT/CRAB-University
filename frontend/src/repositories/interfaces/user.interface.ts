// ─── User Repository Interface ────────────────────────────────────────────────
// This is the CONTRACT. It defines what a UserRepository must do.
// The rest of the app only knows about this interface — never the implementation.
// Swap MySQL for JSON, PostgreSQL, or anything else without touching your pages.

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<void>;
}