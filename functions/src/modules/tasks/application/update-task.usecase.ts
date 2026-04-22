import {AppError} from "../../../shared/errors/app-error.js";
import {Task} from "../domain/task.js";
import {TaskRepository, UpdateTaskInput} from "../domain/task.repository.js";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    id: string,
    userId: string,
    updates: UpdateTaskInput,
  ): Promise<Task> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) throw new AppError("Task not found", 404);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403);

    const updated = await this.taskRepository.update(id, updates);
    if (!updated) throw new AppError("Task not found", 404);
    return updated;
  }
}
