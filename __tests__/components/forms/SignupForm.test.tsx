import { SignupForm } from "@/components/forms/SignupForm";
import { render, screen, act, waitFor } from "../../utils/test-utils";

jest.mock("@/app/[locale]/(auth)/signup/auth-actions", () => ({
  registerUserAction: jest.fn(),
}));

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    useActionState: () => [
      { data: null, zodErrors: null, message: null },
      jest.fn(),
    ],
  };
});

describe("SignupForm", () => {
  it("renders SignupForm", async () => {
    await act(async () => {
      render(<SignupForm />);
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Enter your details to create a new account/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Password/i)).toBeInTheDocument();
      expect(screen.getByText(/Have an account?/i)).toBeInTheDocument();

      expect(screen.getByPlaceholderText(/John/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Doe/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/name@example.com/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Sign Up/i })
    ).toBeInTheDocument();
  });
});
