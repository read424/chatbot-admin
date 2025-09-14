// Contact validation exports
export * from './contact';

// Chatbot validation exports
export * from './chatbot';

// Chat validation exports
export * from './chat';

// Connection validation exports
export * from './connection';

// Common validation utilities
import { z } from 'zod';

// Common schemas
export const idSchema = z.string().min(1, 'ID is required');

export const paginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
}).refine((data) => data.from <= data.to, {
  message: 'From date must be before or equal to to date',
  path: ['from'],
});

// Validation helper functions
export const validateId = (id: string) => idSchema.parse(id);

export const validatePagination = (params: unknown) => paginationParamsSchema.parse(params);

export const validateDateRange = (range: unknown) => dateRangeSchema.parse(range);

// Error handling for validation
export class ValidationError extends Error {
  public issues: z.ZodIssue[];

  constructor(error: z.ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.issues = error.issues;
  }

  public getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    
    this.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    
    return fieldErrors;
  }

  public getFirstError(): string | null {
    return this.issues.length > 0 ? this.issues[0].message : null;
  }
}

// Validation wrapper function
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
};

// Safe validation that returns result with success flag
export const safeValidateSchema = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: new ValidationError(error) };
    }
    throw error;
  }
};

// Type inference
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;