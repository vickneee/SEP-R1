// __tests__/registerSchema.test.ts
import { getRegisterSchema } from "@/components/schemas/registerationSchema";

describe("getRegisterSchema", () => {
  const mockT = (key: string) => `translated:${key}`;

  const schema = getRegisterSchema(mockT);

  it("should pass validation with valid data", () => {
    const result = schema.safeParse({
      first_name: "John",
      last_name: "Doe",
      password: "securepassword123",
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("should fail when first_name is empty", () => {
    const result = schema.safeParse({
      first_name: "",
      last_name: "Doe",
      password: "securepassword123",
      email: "john@example.com",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "first_name" field
    // and retrieve its error message if it exists
    const firstNameError = result.error?.issues.find(
      (issue) => issue.path[0] === "first_name"
    )?.message;

    expect(firstNameError).toBe(
      "translated:signup_validation_first_name_required"
    );
  });

  it("should fail when password is too short", () => {
    const result = schema.safeParse({
      first_name: "John",
      last_name: "Doe",
      password: "123",
      email: "john@example.com",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "password" field
    // and retrieve its error message if it exists
    const passwordError = result.error?.issues.find(
      (issue) => issue.path[0] === "password"
    )?.message;

    expect(passwordError).toBe(
      "translated:signup_validation_password_min_length"
    );
  });

  it("should fail when email is invalid", () => {
    const result = schema.safeParse({
      first_name: "John",
      last_name: "Doe",
      password: "securepassword123",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);

    // Find the validation error related to the "email" field
    // and retrieve its error message if it exists
    const emailError = result.error?.issues.find(
      (issue) => issue.path[0] === "email"
    )?.message;
    expect(emailError).toBe("translated:signup_validation_email_invalid");
  });
});
