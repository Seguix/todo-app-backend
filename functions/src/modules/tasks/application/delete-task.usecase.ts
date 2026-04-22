import {AppError} from "../../../shared/errors/app-error.js";
import {TaskRepository} from "../domain/task.repository.js";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) throw new AppError("Task not found", 404);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403);

    await this.taskRepository.delete(id);
  }
}
