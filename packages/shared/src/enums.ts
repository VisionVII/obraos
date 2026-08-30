/**
 * Enums de domínio partilhados entre API e Web.
 * Fonte única de verdade: nunca redeclarar estes valores noutro pacote.
 */
export const QuoteStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const WorkStatus = {
  PLANNED: 'planned',
  PREPARING: 'preparing',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type WorkStatus = (typeof WorkStatus)[keyof typeof WorkStatus];

export const TaskStatus = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' } as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = { LOW: 'low', NORMAL: 'normal', HIGH: 'high', URGENT: 'urgent' } as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const PhotoCategory = {
  BEFORE: 'before', DURING: 'during', AFTER: 'after',
  PROBLEM: 'problem', MATERIAL: 'material', OTHER: 'other',
} as const;
export type PhotoCategory = (typeof PhotoCategory)[keyof typeof PhotoCategory];

export const ExpenseCategory = {
  MATERIAL: 'material', LABOR: 'labor', SUBCONTRACTOR: 'subcontractor',
  TRANSPORT: 'transport', EQUIPMENT: 'equipment', FUEL: 'fuel', OTHER: 'other',
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const PaymentKind = { DEPOSIT: 'deposit', INSTALLMENT: 'installment', FINAL: 'final', CUSTOM: 'custom' } as const;
export type PaymentKind = (typeof PaymentKind)[keyof typeof PaymentKind];

export const PaymentStatus = { PENDING: 'pending', PAID: 'paid', CANCELLED: 'cancelled' } as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const Role = {
  OWNER: 'owner', ADMIN: 'admin', MANAGER: 'manager',
  WORKER: 'worker', SUBCONTRACTOR: 'subcontractor', CLIENT: 'client',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const enumValues = <T extends Record<string, string>>(e: T) => Object.values(e) as [T[keyof T], ...T[keyof T][]];
