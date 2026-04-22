import {NextFunction, Request, RequestHandler, Response} from "express";
import {FindUserByEmailUseCase} from "../../modules/users/application/find-user-by-email.usecase.js";
import {User} from "../../modules/users/domain/user.js";
import {AppError} from "../errors/app-error.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const buildAuthenticate = (
  findUserByEmail: FindUserByEmailUseCase,
): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const email = req.header("x-user-email");
      if (!email) {
        throw new AppError("Missing x-user-email header", 401);
      }

      const user = await findUserByEmail.execute(email);
      if (!user) {
        throw new AppError("Unauthorized", 401);
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
