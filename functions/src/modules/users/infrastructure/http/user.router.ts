import {Router} from "express";
import {validate} from "../../../../shared/http/validate.js";
import {UserController} from "./user.controller.js";
import {createUserSchema, findUserSchema} from "./user.schemas.js";

export const buildUsersRouter = (controller: UserController): Router => {
  const router = Router();

  router.get("/", validate(findUserSchema), controller.findByEmail);
  router.post("/", validate(createUserSchema), controller.create);

  return router;
};
