import {NextFunction, Request, Response} from "express";
import {CreateUserUseCase} from "../../application/create-user.usecase.js";
import {
  FindUserByEmailUseCase,
} from "../../application/find-user-by-email.usecase.js";

export class UserController {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly createUser: CreateUserUseCase,
  ) {}

  findByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const email = String(req.query.email);
      const user = await this.findUserByEmail.execute(email);
      res.status(200).json({data: user});
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
      const email = req.body.email as string;
      const {user, created} = await this.createUser.execute(email);
      res.status(created ? 201 : 200).json({data: user});
    } catch (error) {
      next(error);
    }
  };
}
