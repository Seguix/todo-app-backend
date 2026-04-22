import {Router} from "express";
import {validate} from "../../../../shared/http/validate.js";
import {TaskController} from "./task.controller.js";
import {
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
} from "./task.schemas.js";

export const buildTasksRouter = (controller: TaskController): Router => {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", validate(createTaskSchema), controller.create);
  router.put("/:id", validate(updateTaskSchema), controller.update);
  router.delete("/:id", validate(deleteTaskSchema), controller.delete);

  return router;
};
