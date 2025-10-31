import { SigninForm } from "@/components/forms/SigninForm";
import { render, screen, act, waitFor } from "../../utils/test-utils";

jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ locale: 'en' })),
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@/app/[locale]/(auth)/signin/auth-actions", () => ({
  signinAction: jest.fn(),
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

describe("SigninForm", () => {
  it("renders SigninForm", async () => {
    await act(async () => {
      render(<SigninForm />);
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Enter your details to sign in to your account/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Password/i)).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/name@example.com/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Sign In/i })
    ).toBeInTheDocument();
  });
});
