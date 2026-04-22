import {Task} from "../domain/task.js";
import {TaskRepository} from "../domain/task.repository.js";

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(userId: string): Promise<Task[]> {
    return this.taskRepository.listByUser(userId);
  }
}
