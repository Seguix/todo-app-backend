import {User} from "../domain/user.js";
import {UserRepository} from "../domain/user.repository.js";

export interface CreateUserResult {
  user: User;
  created: boolean;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<CreateUserResult> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return {user: existing, created: false};
    }

    const user = await this.userRepository.create(email);
    return {user, created: true};
  }
}
