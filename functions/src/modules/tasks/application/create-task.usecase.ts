import {Task} from "../domain/task.js";
import {CreateTaskInput, TaskRepository} from "../domain/task.repository.js";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    return this.taskRepository.create(input);
  }
}
