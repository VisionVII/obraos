import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  address: z.string().trim().max(400).optional(),
  notes: z.string().trim().max(4000).optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;
export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const clientSchema = createClientSchema.extend({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Client = z.infer<typeof clientSchema>;
