// ─── User Service ─────────────────────────────────────────────────────────────
// The "brain" layer. Pages and API routes only ever call this.
// The service checks DATABASE_TYPE in .env and picks the right repository.
// If you add a new database tomorrow, only this file changes.

import { IUserRepository } from "@/repositories/interfaces/user.interface";
import { MySQLUserRepository } from "@/repositories/mysql/user.repository";

class UserService {
  private repository: IUserRepository;

  constructor() {
    const dbType = process.env.DATABASE_TYPE || "mysql";

    if (dbType === "mysql") {
      this.repository = new MySQLUserRepository();
    } else if (dbType === "json") {
      // Placeholder — JsonUserRepository will be implemented in a later phase
      throw new Error("JSON Database not yet implemented");
    } else {
      throw new Error(`Invalid DATABASE_TYPE: "${dbType}". Use "mysql" or "json".`);
    }
  }

  // ── Get a user by their Supabase UUID ──────────────────────────────────────
  async getUserProfile(id: string) {
    return await this.repository.findById(id);
  }

  // ── Get a user by email ────────────────────────────────────────────────────
  async getUserByEmail(email: string) {
    return await this.repository.findByEmail(email);
  }

  async findByEmail(email: string) {
    return await this.repository.findByEmail(email);
  }

  async syncUser(user: any) {
    // We are adding this right now for the Auth Bridge!
    return await this.repository.upsert(user);
  }

  
}

// Export a single shared instance — the whole app uses this one object
export const userService = new UserService();