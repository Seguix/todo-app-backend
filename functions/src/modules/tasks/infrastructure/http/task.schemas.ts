import {z} from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(1000).default(""),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
