"use client";

import { createContext, useContext, useState } from "react";
// Create a NotificationContext with default values
// - refreshKey: used to trigger re-renders when notifications should be refreshed
// - triggerRefresh: function to increment refreshKey
const NotificationContext = createContext({
  refreshKey: 0,
  triggerRefresh: () => {},
});
// NotificationProvider component: wraps children with NotificationContext
// Provides state and function to refresh notifications
export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  // Function to increment refreshKey, causing consumers to re-render
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <NotificationContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </NotificationContext.Provider>
  );
};
// Custom hook to access NotificationContext values
// Allows components to use refreshKey and triggerRefresh easily
export const useNotification = () => useContext(NotificationContext);
