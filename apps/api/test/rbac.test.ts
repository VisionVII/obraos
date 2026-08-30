import { describe, expect, it } from "vitest";
import { Permission, Role, RolePermissions, hasPermission } from "@obraos/shared";

describe("RBAC matrix", () => {
  it("client só tem acesso ao portal", () => {
    expect(RolePermissions[Role.CLIENT]).toEqual([Permission.PORTAL_READ]);
  });
  it("worker nunca vê finanças", () => {
    expect(hasPermission(Role.WORKER, Permission.FINANCE_READ)).toBe(false);
    expect(hasPermission(Role.SUBCONTRACTOR, Permission.FINANCE_READ)).toBe(false);
  });
  it("só owner gere a organização", () => {
    for (const role of Object.values(Role)) {
      expect(hasPermission(role, Permission.ORG_MANAGE)).toBe(role === Role.OWNER);
    }
  });
});
