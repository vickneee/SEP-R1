import { createMockClient } from "@/utils/supabase/mock";

describe("createMockClient", () => {
  let client: Awaited<ReturnType<typeof createMockClient>>;

  beforeEach(async () => {
    client = await createMockClient();
  });

  it("registers a new user", async () => {
    const result = await client.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.error).toBeNull();
    expect(result.data.user.id).toBe("mock-user-id");
    expect(result.data.user.identities.length).toBeGreaterThan(0);
  });

  it("returns error for already registered user", async () => {
    await client.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    const result = await client.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.error?.message).toBe("User already registered");
  });

  it("authenticates with correct credentials", async () => {
    await client.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    const result = await client.auth.signInWithPassword({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.data?.session?.access_token).toBe("mock-token");
    expect(result.error).toBeNull();
  });

  it("fails authentication with wrong password", async () => {
    await client.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });
    const result = await client.auth.signInWithPassword({
      email: "test@example.com",
      password: "wrongpass",
    });
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid login credentials");
  });

  it("returns null session and user", async () => {
    const session = await client.auth.getSession();
    const user = await client.auth.getUser();
    expect(session.data.session).toBeNull();
    expect(user.data.user).toBeNull();
  });

  it("signs out successfully", async () => {
    const result = await client.auth.signOut();
    expect(result.error).toBeNull();
  });

  it("subscribes to auth state changes", () => {
    const result = client.auth.onAuthStateChange();
    expect(result.data.subscription.unsubscribe).toBeDefined();
  });

  it("supports chained from().select().single()", async () => {
    const result = await client.from().select("*").eq("id", "123").single();
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });
});
