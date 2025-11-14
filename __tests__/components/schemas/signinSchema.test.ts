import { getSigninSchema } from "@/components/schemas/signinSchema";

describe("getSigninSchema", () => {
  const mockT = (key: string) => `translated:${key}`;
  const schema = getSigninSchema(mockT);

  it("should pass validation with valid email and password", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "securePassword123",
    });

    expect(result.success).toBe(true);
  });

  it("should fail when email is empty", () => {
    const result = schema.safeParse({
      email: "",
      password: "securePassword123",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "email" field
    // and retrieve its error message if it exists
    const emailError = result?.error?.issues.find(
      (issue) => issue.path[0] === "email"
    )?.message;
    expect(emailError).toBe("translated:validation_email_required");
  });

  it("should fail when email is invalid", () => {
    const result = schema.safeParse({
      email: "invalid-email",
      password: "securePassword123",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "email" field
    // and retrieve its error message if it exists
    const emailError = result?.error?.issues.find(
      (issue) => issue.path[0] === "email"
    )?.message;
    expect(emailError).toBe("translated:signin_validation_email_invalid");
  });

  it("should fail when password is too short", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "password" field
    // and retrieve its error message if it exists
    const passwordError = result?.error?.issues.find(
      (issue) => issue.path[0] === "password"
    )?.message;
    expect(passwordError).toBe("translated:validation_password_min_length");
  });

  it("should fail when password is too long", () => {
    const longPassword = "a".repeat(101);
    const result = schema.safeParse({
      email: "user@example.com",
      password: longPassword,
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "password" field
    // and retrieve its error message if it exists
    const passwordError = result?.error?.issues.find(
      (issue) => issue.path[0] === "password"
    )?.message;
    expect(passwordError).toBe("translated:validation_password_max_length");
  });
});
