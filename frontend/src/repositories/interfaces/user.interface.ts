export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  provider: string | null;
  last_sign_in_at: Date | null;
  created_at?: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  upsert(user: User): Promise<void>; // The new Sync function
}