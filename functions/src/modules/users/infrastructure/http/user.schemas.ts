import {z} from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const findUserSchema = z.object({
  query: z.object({
    email: z.string().email(),
  }),
});
