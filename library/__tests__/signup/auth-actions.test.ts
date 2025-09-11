import {
  registerUserAction,
  schemaRegister,
} from "@/app/(auth)/signup/auth-actions";

import { signinAction } from "@/app/(auth)/signin/auth-actions";

describe("Supabase signup and signin auth actions", () => {
  let email = `testuser${Date.now()}@example.com`;
  let password = "StrongPassword!!!";

  it("should signup a new user with valid credentials", async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("first_name", "Test");
    formData.append("last_name", "User");

    const result = await registerUserAction(
      { message: null, zodErrors: null, data: null },
      formData
    );

    expect(result.message).toMatch(
      "Registration successful! You can now sign in."
    );
  });

  it("should reject weak password via Zod", () => {
    const result = schemaRegister.safeParse({
      email: "weak@example.com",
      password: "123",
      first_name: "Weak",
      last_name: "User",
    });

    expect(result.success).toBe(false);
  });

  it("should fail to signup with the email wich is registered already", async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", "normalPassword!");
    formData.append("first_name", "anotherTest");
    formData.append("last_name", "anotherUser");

    const result = await registerUserAction(
      { message: null, zodErrors: null, data: null },
      formData
    );

    expect(result.message).toMatch(
      "An account with this email already exists. Please sign in instead."
    );
  });

  it("should login with valid credentials", async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await signinAction(
      { message: undefined, zodErrors: undefined },
      formData
    );

    expect(result.message).toMatch("Signin successful");
  });

  it("should fail login with wrong password", async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", "wrongpassword");

    const result = await signinAction(
      { message: undefined, zodErrors: undefined },
      formData
    );

    expect(result.message).toMatch("Invalid login credentials");
  });
});
