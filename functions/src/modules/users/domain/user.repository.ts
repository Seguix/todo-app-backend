import {User} from "./user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(email: string): Promise<User>;
}
