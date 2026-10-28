import { z } from 'zod';
import { TIME_OFF_TYPES } from '../types/request';
import { countWorkingDays, todayString } from '../utils/dates';

export const NOTE_MAX_LENGTH = 500;

export const newRequestSchema = z
  .object({
    type: z.enum(TIME_OFF_TYPES, { error: 'Choose a type' }),
    startDate: z.iso.date({ error: 'Choose a start date' }),
    endDate: z.iso.date({ error: 'Choose an end date' }),
    note: z
      .string()
      .trim()
      .max(NOTE_MAX_LENGTH, { error: `Keep the note under ${NOTE_MAX_LENGTH} characters` })
      .optional()
      .transform((note) => note || undefined),
  })
  .refine((request) => request.endDate >= request.startDate, {
    path: ['endDate'],
    error: "The end date can't be before the start date",
  })
  .refine(
    (request) =>
      request.endDate < request.startDate ||
      countWorkingDays(request.startDate, request.endDate) > 0,
    {
      path: ['endDate'],
      error: 'Choose at least one working day',
    },
  )
  .refine((request) => request.type === 'sick' || request.startDate >= todayString(), {
    path: ['startDate'],
    error: "The start date can't be in the past (except for sick leave)",
  });

export type NewRequestInput = z.input<typeof newRequestSchema>;
export type NewRequest = z.output<typeof newRequestSchema>;
