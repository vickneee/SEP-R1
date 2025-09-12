import {
  registerUserAction,
  schemaRegister,
} from "@/app/(auth)/signup/auth-actions";

import { signinAction } from "@/app/(auth)/signin/auth-actions";

describe("Supabase signin auth actions", () => {
  let email = `testuser${Date.now()}@example.com`;
  let password = "StrongPassword!!!";

  it("should signin with valid credentials after signup", async () => {
    const signupFormData = new FormData();
    signupFormData.append("email", email);
    signupFormData.append("password", password);
    signupFormData.append("first_name", "Test");
    signupFormData.append("last_name", "User");

    await registerUserAction(
      { message: null, zodErrors: null, data: null },
      signupFormData
    );

    const signinFormData = new FormData();
    signinFormData.append("email", email);
    signinFormData.append("password", password);

    const result = await signinAction(
      { message: undefined, zodErrors: undefined },
      signinFormData
    );

    expect(result.message).toMatch("Signin successful");
  });

  it("should fail singin with wrong password", async () => {
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
