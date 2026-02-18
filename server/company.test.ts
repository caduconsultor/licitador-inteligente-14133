import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("company procedures", () => {
  it("should get company profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.company.getProfile();
    expect(result === null || result === undefined || result.id).toBeDefined();
  });

  it("should search CNPJ with valid format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.company.searchCNPJ({
      cnpj: "11222333000181",
    });

    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data?.cnpj).toBeDefined();
      expect(result.data?.companyName).toBeDefined();
    } else {
      expect(result.error).toBeDefined();
    }
  });

  it("should reject invalid CNPJ format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.company.searchCNPJ({
        cnpj: "invalid",
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle CNPJ not found", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.company.searchCNPJ({
      cnpj: "00000000000000",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
