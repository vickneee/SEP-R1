import { render, screen, fireEvent, act } from "../../utils/test-utils";
import UserAccountOperations from "@/app/[locale]/(dashboard)/customer-dashboard/UserAccountOperations";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/customer-dashboard",
}));

jest.mock("react-hot-toast", () => ({
  toast: jest.fn(),
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn(),
    },
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe("UserAccountOperations Component", () => {
  it("renders update and delete buttons", async () => {
    await act(async () => {
      render(<UserAccountOperations />);
    });

    expect(screen.getByTestId("update-button")).toBeInTheDocument();
    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
  });

  it("toggles email form visibility", async () => {
    render(<UserAccountOperations />);

    const toggleButton = screen.getByTestId("update-button");

    expect(
      screen.queryByPlaceholderText("name@example.com")
    ).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(
      screen.queryByPlaceholderText("name@example.com")
    ).not.toBeInTheDocument();
  });

  it("calls delete API and redirects on success", async () => {
    render(<UserAccountOperations />);

    jest.spyOn(window, "confirm").mockReturnValueOnce(true);

    const deleteButton = screen.getByTestId("delete-button");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/delete-user", {
      method: "POST",
    });
  });
});
