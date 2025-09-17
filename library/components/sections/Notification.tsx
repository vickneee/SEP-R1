import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { getNotification } from "@/components/sections/NotificationAction";
import { useEffect, useState } from "react";

type Notification = {
  reservation_id: number;
  book_id: number;
  due_date: string;
  status: "active" | "returned" | "overdue" | "cancelled";
  reminder_sent: boolean;
};

export default function NotificationSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchNotifications = async () => {
    const result = await getNotification();
    if (result?.error) {
      setError(result.error);
    } else if (result) {
      setNotifications(result.notifications || []);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);
  const hasNotifications = notifications.length > 0;

  console.log(notifications);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} />
          {hasNotifications && (
            <div className="absolute -top-0 -right-1 flex h-4 w-4 items-center justify-center ">
              {notifications.length}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]" sideOffset={35}>
        <div className="flex p-4">
          <h3 className="text-lg font-medium">Notifications</h3>
        </div>
        <Separator />
        <ScrollArea>
          <div className="space-y-4 p-4">
            {!hasNotifications && <p>You have no notifications.</p>}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
