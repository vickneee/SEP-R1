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
    expect(result.error?.format().email?._errors[0]).toBe(
      "translated:validation_email_required"
    );
  });

  it("should fail when email is invalid", () => {
    const result = schema.safeParse({
      email: "invalid-email",
      password: "securePassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.format().email?._errors[0]).toBe(
      "translated:signin_validation_email_invalid"
    );
  });

  it("should fail when password is too short", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.format().password?._errors[0]).toBe(
      "translated:validation_password_min_length"
    );
  });

  it("should fail when password is too long", () => {
    const longPassword = "a".repeat(101);
    const result = schema.safeParse({
      email: "user@example.com",
      password: longPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error?.format().password?._errors[0]).toBe(
      "translated:validation_password_max_length"
    );
  });
});
