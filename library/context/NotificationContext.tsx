"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <NotificationContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
