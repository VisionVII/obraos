import { Role } from './enums.js';

/** Permissões atómicas. Formato: recurso:ação */
export const Permission = {
  ORG_MANAGE: 'org:manage',
  MEMBERS_MANAGE: 'members:manage',
  CLIENTS_READ: 'clients:read',
  CLIENTS_WRITE: 'clients:write',
  QUOTES_READ: 'quotes:read',
  QUOTES_WRITE: 'quotes:write',
  WORKS_READ: 'works:read',
  WORKS_WRITE: 'works:write',
  WORKS_READ_ASSIGNED: 'works:read_assigned',
  TASKS_WRITE_ASSIGNED: 'tasks:write_assigned',
  DAILY_LOG_WRITE: 'daily_log:write',
  PHOTOS_WRITE: 'photos:write',
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  PORTAL_READ: 'portal:read',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

const P = Permission;
const staff = [P.CLIENTS_READ, P.CLIENTS_WRITE, P.QUOTES_READ, P.QUOTES_WRITE, P.WORKS_READ, P.WORKS_WRITE,
  P.DAILY_LOG_WRITE, P.PHOTOS_WRITE, P.FINANCE_READ, P.FINANCE_WRITE] as const;

/** Matriz role → permissões. É a MESMA para frontend (UI) e backend (enforcement). */
export const RolePermissions: Record<Role, readonly Permission[]> = {
  [Role.OWNER]: [P.ORG_MANAGE, P.MEMBERS_MANAGE, ...staff],
  [Role.ADMIN]: [P.MEMBERS_MANAGE, ...staff],
  [Role.MANAGER]: [...staff],
  [Role.WORKER]: [P.WORKS_READ_ASSIGNED, P.TASKS_WRITE_ASSIGNED, P.DAILY_LOG_WRITE, P.PHOTOS_WRITE],
  [Role.SUBCONTRACTOR]: [P.WORKS_READ_ASSIGNED, P.TASKS_WRITE_ASSIGNED, P.PHOTOS_WRITE],
  [Role.CLIENT]: [P.PORTAL_READ],
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  RolePermissions[role].includes(permission);
