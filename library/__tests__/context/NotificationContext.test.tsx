import React from "react";
import { render, screen } from "@testing-library/react";
import {
  NotificationProvider,
  useNotification,
} from "@/context/NotificationContext";
import userEvent from "@testing-library/user-event";

// A test component to test the context function
const TestComponent = () => {
  const { refreshKey, triggerRefresh } = useNotification();

  return (
    <div>
      <p data-testid="refresh-key">{refreshKey}</p>
      <button onClick={triggerRefresh}>Refresh</button>
    </div>
  );
};

describe("NotificationContext", () => {
  it("should provide the initial refreshKey value as 0", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const refreshKey = screen.getByTestId("refresh-key");
    expect(refreshKey.textContent).toBe("0");
  });

  it("should increment refreshKey when triggerRefresh is called", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const refreshKey = screen.getByTestId("refresh-key");
    const button = screen.getByRole("button", { name: "Refresh" });

    expect(refreshKey.textContent).toBe("0");

    await userEvent.click(button);
    expect(refreshKey.textContent).toBe("1");

    await userEvent.click(button);
    expect(refreshKey.textContent).toBe("2");
  });
});
