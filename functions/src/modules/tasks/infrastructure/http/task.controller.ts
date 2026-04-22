import {NextFunction, Request, Response} from "express";
import {AppError} from "../../../../shared/errors/app-error.js";
import {CreateTaskUseCase} from "../../application/create-task.usecase.js";
import {DeleteTaskUseCase} from "../../application/delete-task.usecase.js";
import {ListTasksUseCase} from "../../application/list-tasks.usecase.js";
import {UpdateTaskUseCase} from "../../application/update-task.usecase.js";

const requireUserId = (req: Request): string => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  return req.user.id;
};

export class TaskController {
  constructor(
    private readonly listTasks: ListTasksUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const tasks = await this.listTasks.execute(userId);
      res.status(200).json({data: tasks});
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const task = await this.createTask.execute({
        userId,
        title: req.body.title as string,
        description: (req.body.description as string) || "",
      });
      res.status(201).json({data: task});
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const id = String(req.params.id);
      const task = await this.updateTask.execute(id, userId, req.body);
      res.status(200).json({data: task});
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const id = String(req.params.id);
      await this.deleteTask.execute(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
