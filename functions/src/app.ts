import cors from "cors";
import express from "express";
import {buildTasksRouter} from "./modules/tasks/infrastructure/http/task.router.js";
import {buildUsersRouter} from "./modules/users/infrastructure/http/user.router.js";
import {getContainer} from "./shared/container.js";
import {errorHandler} from "./shared/http/error-handler.js";

export const app = express();

app.use(cors({origin: true}));
app.use(express.json());

const container = getContainer();

app.get("/health", (_req, res) => res.status(200).json({ok: true}));
app.use("/users", buildUsersRouter(container.userController));
app.use(
  "/tasks",
  container.authenticate,
  buildTasksRouter(container.taskController),
);

app.use(errorHandler);
