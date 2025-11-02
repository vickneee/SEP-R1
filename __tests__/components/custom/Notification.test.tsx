import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "../../utils/test-utils";
import Notification from "@/components/custom/Notification";

jest.mock("@/components/custom/NotificationAction", () => ({
  getDueDateNotification: jest.fn(() => Promise.resolve({ notifications: [] })),
  markReminderSentAsTrue: jest.fn(() => Promise.resolve({})),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}));

// --- Mock next/navigation ---
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ locale: "en" })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Notification Component", () => {
  it("renders notification component without crashing", async () => {
    await act(async () => {
      render(<Notification />);
    });
  });

  it("renders Notification component with bell-icon", async () => {
    await act(async () => {
      render(<Notification />);
    });

    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
  });

  it("has correct width", async () => {
    await act(async () => {
      render(<Notification />);
    });

    const iconElement = screen.getByTestId("bell-icon");
    expect(iconElement).toHaveAttribute("width", "16");
  });

  it("renders Notifications text in PopoverContent", async () => {
    await act(async () => {
      render(<Notification />);
    });

    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });
});
