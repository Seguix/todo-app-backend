import {User} from "../domain/user.js";
import {UserRepository} from "../domain/user.repository.js";

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
