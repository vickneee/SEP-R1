import { registerUserAction } from "@/app/[locale]/(auth)/signup/auth-actions";

describe("Supabase signup auth actions", () => {
  const password = "StrongPassword!!!";
  const email = "testuser@example.com";

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
      "Registration failed: User already registered. Please try again."
    );
  });
});
