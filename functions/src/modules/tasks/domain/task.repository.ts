import {Task} from "./task.js";

export interface CreateTaskInput {
  userId: string;
  title: string;
  description: string;
}

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "completed">
>;

export interface TaskRepository {
  listByUser(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, updates: UpdateTaskInput): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
