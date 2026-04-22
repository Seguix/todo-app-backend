import {db} from "../../../../config/firebase.js";
import {Task} from "../../domain/task.js";
import {
  CreateTaskInput,
  TaskRepository,
  UpdateTaskInput,
} from "../../domain/task.repository.js";

const TASKS_COLLECTION = "tasks";

type TaskDocument = Omit<Task, "id">;

export class FirestoreTaskRepository implements TaskRepository {
  async listByUser(userId: string): Promise<Task[]> {
    const snapshot = await db.collection(TASKS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TaskDocument),
    }));
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await db.collection(TASKS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {id: doc.id, ...(doc.data() as TaskDocument)};
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const payload: TaskDocument = {
      userId: input.userId,
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    const doc = await db.collection(TASKS_COLLECTION).add(payload);
    return {id: doc.id, ...payload};
  }

  async update(id: string, updates: UpdateTaskInput): Promise<Task | null> {
    const ref = db.collection(TASKS_COLLECTION).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;

    const patch = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await ref.update(patch);

    const current = snapshot.data() as TaskDocument;
    return {
      id: ref.id,
      ...current,
      ...patch,
    };
  }

  async delete(id: string): Promise<boolean> {
    const ref = db.collection(TASKS_COLLECTION).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return false;
    await ref.delete();
    return true;
  }
}
