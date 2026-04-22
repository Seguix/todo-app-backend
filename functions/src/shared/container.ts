import {RequestHandler} from "express";
import {CreateTaskUseCase} from "../modules/tasks/application/create-task.usecase.js";
import {DeleteTaskUseCase} from "../modules/tasks/application/delete-task.usecase.js";
import {ListTasksUseCase} from "../modules/tasks/application/list-tasks.usecase.js";
import {UpdateTaskUseCase} from "../modules/tasks/application/update-task.usecase.js";
import {TaskController} from "../modules/tasks/infrastructure/http/task.controller.js";
import {FirestoreTaskRepository} from "../modules/tasks/infrastructure/persistence/firestore-task.repository.js";
import {CreateUserUseCase} from "../modules/users/application/create-user.usecase.js";
import {FindUserByEmailUseCase} from "../modules/users/application/find-user-by-email.usecase.js";
import {UserController} from "../modules/users/infrastructure/http/user.controller.js";
import {FirestoreUserRepository} from "../modules/users/infrastructure/persistence/firestore-user.repository.js";
import {buildAuthenticate} from "./http/authenticate.js";

export interface Container {
  userController: UserController;
  taskController: TaskController;
  authenticate: RequestHandler;
}

let instance: Container | null = null;

export const getContainer = (): Container => {
  if (instance) return instance;

  const userRepository = new FirestoreUserRepository();
  const taskRepository = new FirestoreTaskRepository();

  const findUserByEmail = new FindUserByEmailUseCase(userRepository);
  const createUser = new CreateUserUseCase(userRepository);

  const userController = new UserController(findUserByEmail, createUser);

  const taskController = new TaskController(
    new ListTasksUseCase(taskRepository),
    new CreateTaskUseCase(taskRepository),
    new UpdateTaskUseCase(taskRepository),
    new DeleteTaskUseCase(taskRepository),
  );

  const authenticate = buildAuthenticate(findUserByEmail);

  instance = {userController, taskController, authenticate};
  return instance;
};
